import { useEffect, useMemo, useRef, useState } from "react";

import type { BridgeTx } from "./api";
import { fetchBridgeTxsSince, mapTxToVolume } from "./api";
import { layer2Destinations } from "./model";
import { initialLatestBlockNumber } from "./bootstrap";
import type { Layer2Flow, Link, TokenFlow } from "./model";

export const DEFAULT_HISTORY_WINDOW_MS = 60_000;

export const chainIdToDestination: Record<number, string> = {
  10: "Optimism",
  42161: "Arbitrum",
  8453: "Base",
  324: "zkSync",
};

const DEFAULT_LATENCY_MS = 4200;

const destinationColorFallback = "#64748b";

const destinationColors = new Map<string, string>(layer2Destinations.map(dest => [dest.name, dest.color]));

interface BridgeDataState {
  blockNumber: number;
  links: Link[];
  layer2Flows: Layer2Flow[];
  transactions: BridgeTx[];
}

const normalizeTxPerMinute = (count: number, windowMs: number) => {
  if (windowMs <= 0) {
    return count;
  }
  const minutes = windowMs / 60_000;
  if (minutes === 0) {
    return count;
  }
  return Math.max(1, Math.round(count / minutes));
};

export const buildAggregatedData = (
  transactions: BridgeTx[],
  windowMs: number,
): { links: Link[]; layer2Flows: Layer2Flow[] } => {
  const linkMap = new Map<string, {
    source: string;
    target: string;
    blockNumber: number;
    lastUpdated: number;
    tokens: Map<string, { volumeUsd: number; txCount: number; txPerMinute: number }>;
    txs: BridgeTx[];
  }>();

  transactions.forEach(tx => {
    const target = chainIdToDestination[tx.chainID];
    if (!target) {
      return;
    }
    const source = tx.from || "Ethereum";
    const destinationBlockNumber = tx.destinationBlockNumber ?? tx.blockNumber;
    const key = `${source}-${target}`;
    if (!linkMap.has(key)) {
      linkMap.set(key, {
        source,
        target,
        blockNumber: destinationBlockNumber,
        lastUpdated: tx.timestamp,
        tokens: new Map(),
        txs: [],
      });
    }
    const entry = linkMap.get(key)!;
    entry.blockNumber = Math.max(entry.blockNumber, destinationBlockNumber);
    entry.lastUpdated = Math.max(entry.lastUpdated, tx.timestamp);
    entry.txs.push(tx);

    const tokenEntry = entry.tokens.get(tx.token) ?? { volumeUsd: 0, txCount: 0, txPerMinute: 0 };
    tokenEntry.volumeUsd += mapTxToVolume(tx);
    tokenEntry.txCount += 1;
    entry.tokens.set(tx.token, tokenEntry);
  });

  const links: Link[] = Array.from(linkMap.entries()).map(([key, value]) => {
    const tokens: TokenFlow[] = Array.from(value.tokens.entries()).map(([symbol, metrics]) => ({
      symbol,
      volumeUsd: metrics.volumeUsd,
      txPerMinute: normalizeTxPerMinute(metrics.txCount, windowMs),
      avgLatencyMs: DEFAULT_LATENCY_MS,
      txCount: metrics.txCount,
      lastUpdated: value.lastUpdated,
    }));

    return {
      id: key,
      source: value.source,
      target: value.target,
      blockNumber: value.blockNumber,
      tokens,
      lastUpdated: value.lastUpdated,
      transactions: value.txs,
    };
  });

  const destinationMap = new Map<string, Layer2Flow>();
  transactions.forEach(tx => {
    const target = chainIdToDestination[tx.chainID];
    if (!target) {
      return;
    }
    const volumeUsd = mapTxToVolume(tx);
    const existing = destinationMap.get(target) ?? {
      name: target,
      color: destinationColors.get(target) ?? destinationColorFallback,
      volumeUsd: 0,
      txPerMinute: 0,
      avgLatencyMs: DEFAULT_LATENCY_MS,
      txCount: 0,
      lastUpdated: tx.timestamp,
    };
    existing.volumeUsd += volumeUsd;
    existing.txCount += 1;
    existing.txPerMinute = normalizeTxPerMinute(existing.txCount, windowMs);
    existing.lastUpdated = Math.max(existing.lastUpdated, tx.timestamp);
    destinationMap.set(target, existing);
  });

  return {
    links,
    layer2Flows: Array.from(destinationMap.values()),
  };
};

export const useBridgeData = (
  intervalMs: number = 10_000,
  historyWindowMs: number = DEFAULT_HISTORY_WINDOW_MS,
) => {
  const SESSION_KEY = 'op-tip-block';
  const [state, setState] = useState<BridgeDataState>(() => {
    let startBlock = initialLatestBlockNumber;
    try {
      const cached = Number.parseInt(sessionStorage.getItem(SESSION_KEY) ?? '', 10);
      startBlock = Number.isFinite(cached) && cached > 0 ? cached : initialLatestBlockNumber;
    } catch {
      // Ignore sessionStorage errors; use pre-fetched initialLatestBlockNumber
    }
    return {
      blockNumber: startBlock,
      links: [],
      layer2Flows: [],
      transactions: [],
    };
  });

  const blockRef = useRef(state.blockNumber);

  useEffect(() => {
    blockRef.current = state.blockNumber;
  }, [state.blockNumber]);

  useEffect(() => {
    let cancelled = false;
    let timerId: number | undefined;

    const fetchAndUpdate = async () => {
      const response = await fetchBridgeTxsSince(blockRef.current);
      if (cancelled) {
        return;
      }
      setState(prev => {
        const mergedTxs = [...prev.transactions, ...response.transactions];
        const txMap = new Map<string, BridgeTx>();
        mergedTxs.forEach(tx => {
          const existing = txMap.get(tx.id);
          if (!existing || (tx.timestamp ?? 0) >= (existing.timestamp ?? 0)) {
            txMap.set(tx.id, tx);
          }
        });
        const dedupedTxs = Array.from(txMap.values()).sort((a, b) => (a.timestamp ?? 0) - (b.timestamp ?? 0));
        const cutoff = Date.now() - historyWindowMs;
        const filteredTxs = dedupedTxs.filter(tx => tx.timestamp >= cutoff);
        const { links, layer2Flows } = buildAggregatedData(filteredTxs, historyWindowMs);
        return {
          blockNumber: response.blockNumber,
          links,
          layer2Flows,
          transactions: filteredTxs,
        };
      });
      blockRef.current = response.blockNumber;
      try {
        sessionStorage.setItem(SESSION_KEY, String(response.blockNumber));
      } catch {
        // ignore storage errors
      }
    };

    const initialise = async () => {
      const cached = Number.parseInt(sessionStorage.getItem(SESSION_KEY) ?? '', 10);
      const startBlock = Number.isFinite(cached) && cached > 0 ? cached : initialLatestBlockNumber;
      if (cancelled) {
        return;
      }
      setState(prev => ({ ...prev, blockNumber: startBlock }));
      blockRef.current = startBlock;
      await fetchAndUpdate();
      if (!cancelled && intervalMs > 0) {
        timerId = window.setInterval(fetchAndUpdate, intervalMs);
      }
    };

    initialise();

    return () => {
      cancelled = true;
      if (timerId !== undefined) {
        window.clearInterval(timerId);
      }
    };
  }, [historyWindowMs, intervalMs]);

  return useMemo(() => state, [state]);
};
