import { useEffect, useMemo, useState } from "react";

import type { BridgeTx } from "./api";
import { fetchBridgeTxsSince, mapTxToVolume, fetchLatestBlockNumber } from "./api";
import { layer2Destinations } from "./model";
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
    const key = `${source}-${target}`;
    if (!linkMap.has(key)) {
      linkMap.set(key, {
        source,
        target,
        blockNumber: tx.blockNumber,
        lastUpdated: tx.timestamp,
        tokens: new Map(),
        txs: [],
      });
    }
    const entry = linkMap.get(key)!;
    entry.blockNumber = Math.max(entry.blockNumber, tx.blockNumber);
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
  const [state, setState] = useState<BridgeDataState>({
    blockNumber: 0,
    links: [],
    layer2Flows: [],
    transactions: [],
  });

  useEffect(() => {
    let cancelled = false;
    let timerId: number | undefined;
    let nextBlockToFetch: number | undefined;

    const fetchAndUpdate = async () => {
      if (nextBlockToFetch === undefined) {
        return;
      }
      const response = await fetchBridgeTxsSince(nextBlockToFetch);
      if (cancelled) {
        return;
      }
      setState(prev => {
        const mergedTxs = [...prev.transactions, ...response.transactions];
        const cutoff = Date.now() - historyWindowMs;
        const filteredTxs = mergedTxs.filter(tx => tx.timestamp >= cutoff);
        const { links, layer2Flows } = buildAggregatedData(filteredTxs, historyWindowMs);
        return {
          blockNumber: response.blockNumber,
          links,
          layer2Flows,
          transactions: filteredTxs,
        };
      });
      nextBlockToFetch = response.blockNumber;
    };

    const initialise = async () => {
      const latest = await fetchLatestBlockNumber();
      if (cancelled) {
        return;
      }
      nextBlockToFetch = latest;
      setState(prev => ({ ...prev, blockNumber: latest }));
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
