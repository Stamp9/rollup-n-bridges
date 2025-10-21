import { useMemo } from "react";

import type { BridgeTx } from "../../data/api";
import type { Layer2Flow, Link } from "../../data/model";
import {
  baseDestinationColorMap,
  bridgeProtocols,
  fallbackDestinationColor,
} from "../bridgeOverviewConfig";

export type BridgeDestinationFlow = Layer2Flow & {
  bridgeId: string;
  transactions: BridgeTx[];
};

export type BridgeSummary = {
  protocol: typeof bridgeProtocols[number];
  flows: BridgeDestinationFlow[];
};

export const sortTransactions = (txs: BridgeTx[]) =>
  txs.sort((a, b) => {
    const blockA = a.destinationBlockNumber ?? a.blockNumber;
    const blockB = b.destinationBlockNumber ?? b.blockNumber;
    return blockB - blockA || (b.timestamp ?? 0) - (a.timestamp ?? 0);
  });

export const useBridgeSummaries = (flows: Layer2Flow[], links: Link[] = []) => {
  const destinationColorMap = useMemo(() => {
    const map = new Map(baseDestinationColorMap);
    flows.forEach(flow => map.set(flow.name, flow.color));
    return map;
  }, [flows]);

  const allowedDestinations = useMemo(() => new Set(flows.map(flow => flow.name)), [flows]);

  const bridgeSummaries = useMemo<BridgeSummary[]>(() => {
    return bridgeProtocols.map(protocol => {
      const flowsByDestination = new Map<string, BridgeDestinationFlow>();

      (links ?? []).forEach(link => {
        if (link.source !== protocol.name) {
          return;
        }
        if (allowedDestinations.size > 0 && !allowedDestinations.has(link.target)) {
          return;
        }

        const tokens = link.tokens ?? [];
        const volumeUsd = tokens.reduce((sum, token) => sum + token.volumeUsd, 0);
        const txPerMinute = tokens.reduce((sum, token) => sum + token.txPerMinute, 0);
        const txCount = tokens.reduce((sum, token) => sum + (token.txCount ?? 0), 0);
        const latencyWeightedSum = tokens.reduce(
          (sum, token) => sum + (token.avgLatencyMs ?? 0) * (token.txCount ?? 1),
          0,
        );
        const latencyWeight = tokens.reduce((sum, token) => sum + (token.txCount ?? 1), 0);
        const avgLatencyMs = latencyWeight > 0 ? latencyWeightedSum / latencyWeight : tokens[0]?.avgLatencyMs ?? 0;
        const color = destinationColorMap.get(link.target) ?? fallbackDestinationColor;
        const transactions = sortTransactions([...(link.transactions ?? [])]);

        const existing = flowsByDestination.get(link.target);
        if (existing) {
          const existingTxCount = existing.txCount ?? 0;
          const combinedTxCount = existingTxCount + txCount;
          const combinedLatencySum = existing.avgLatencyMs * existingTxCount + avgLatencyMs * txCount;
          const updatedTransactions = sortTransactions([...(existing.transactions ?? []), ...transactions]);

          flowsByDestination.set(link.target, {
            bridgeId: existing.bridgeId,
            name: existing.name,
            color: existing.color,
            volumeUsd: existing.volumeUsd + volumeUsd,
            txPerMinute: existing.txPerMinute + txPerMinute,
            avgLatencyMs: combinedTxCount > 0 ? combinedLatencySum / combinedTxCount : existing.avgLatencyMs,
            txCount: combinedTxCount,
            lastUpdated: Math.max(existing.lastUpdated, link.lastUpdated),
            transactions: updatedTransactions,
          });
          return;
        }

        flowsByDestination.set(link.target, {
          bridgeId: protocol.name,
          name: link.target,
          color,
          volumeUsd,
          txPerMinute,
          avgLatencyMs,
          txCount,
          lastUpdated: link.lastUpdated,
          transactions,
        });
      });

      const flowsForBridge = Array.from(flowsByDestination.values()).sort((a, b) => b.volumeUsd - a.volumeUsd);
      return { protocol, flows: flowsForBridge };
    });
  }, [links, allowedDestinations, destinationColorMap]);

  const flattenedFlows = useMemo(
    () => bridgeSummaries.flatMap(summary => summary.flows),
    [bridgeSummaries],
  );

  return { destinationColorMap, allowedDestinations, bridgeSummaries, flattenedFlows };
};
