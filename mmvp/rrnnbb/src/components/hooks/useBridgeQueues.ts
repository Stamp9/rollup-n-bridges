import { useCallback, useEffect, useRef, useState } from "react";

import type { Layer2Flow } from "../../data/model";
import { fallbackDestinationColor } from "../bridgeOverviewConfig";
import type { BridgeSummary } from "./useBridgeSummaries";

export type ActiveParticle = {
  id: string;
  token: string;
  amount: number;
  color: string;
  size: number;
  start: number;
  timestamp: number;
};

type QueueState = { active: ActiveParticle[]; processed: Map<string, number> };

type UseBridgeQueuesParams = {
  bridgeSummaries: BridgeSummary[];
  destinationColorMap: Map<string, string>;
  flows: Layer2Flow[];
};

const TX_DURATION_MS = 7_000;
const TICK_MS = 300;
const MAX_ACTIVE = 24;
const MAX_ENQUEUE_PER_TICK = 8;

export const useBridgeQueues = ({
  bridgeSummaries,
  destinationColorMap,
  flows,
}: UseBridgeQueuesParams) => {
  const queuesRef = useRef<Map<string, QueueState>>(new Map());
  const [, setTick] = useState(0);
  const getFlowKey = useCallback((bridgeId: string, destination: string) => `${bridgeId}::${destination}`, []);
  const previousSummariesRef = useRef<BridgeSummary[] | null>(null);

  const summariesChanged = useCallback((next: BridgeSummary[]) => {
    const previous = previousSummariesRef.current;
    if (!previous || previous.length !== next.length) {
      previousSummariesRef.current = next;
      return true;
    }

    for (let i = 0; i < next.length; i += 1) {
      const nextSummary = next[i];
      const prevSummary = previous[i];
      if (nextSummary.protocol.name !== prevSummary.protocol.name) {
        previousSummariesRef.current = next;
        return true;
      }

      if (nextSummary.flows.length !== prevSummary.flows.length) {
        previousSummariesRef.current = next;
        return true;
      }

      for (let j = 0; j < nextSummary.flows.length; j += 1) {
        const nextFlow = nextSummary.flows[j];
        const prevFlow = prevSummary.flows[j];
        if (!prevFlow) {
          previousSummariesRef.current = next;
          return true;
        }

        if (
          nextFlow.bridgeId !== prevFlow.bridgeId ||
          nextFlow.name !== prevFlow.name ||
          (nextFlow.txCount ?? 0) !== (prevFlow.txCount ?? 0) ||
          (nextFlow.transactions?.length ?? 0) !== (prevFlow.transactions?.length ?? 0) ||
          (nextFlow.lastUpdated ?? 0) !== (prevFlow.lastUpdated ?? 0)
        ) {
          previousSummariesRef.current = next;
          return true;
        }
      }
    }

    previousSummariesRef.current = next;
    return false;
  }, []);

  useEffect(() => {
    const shouldReset = summariesChanged(bridgeSummaries);
    if (shouldReset) {
      queuesRef.current.clear();
      console.log("[🐾 queuesRef cleared due to flows structural update]");
    }
  }, [bridgeSummaries, summariesChanged]);

  useEffect(() => {
    let cancelled = false;
    const timer = window.setInterval(() => {
      if (cancelled) return;
      const now = Date.now();
      let changed = false;
      const map = queuesRef.current;

      bridgeSummaries.forEach(summary => {
        summary.flows.forEach(flow => {
          const key = getFlowKey(flow.bridgeId, flow.name);
          let state = map.get(key);
          if (!state) {
            state = { active: [], processed: new Map<string, number>() };
            map.set(key, state);
          }
          const processed = state.processed;
          const actives = state.active;

          const newTxs = (flow.transactions ?? [])
            .filter(tx => !processed.has(tx.id))
            .slice(0, MAX_ENQUEUE_PER_TICK);

          if (newTxs.length > 0) {
            newTxs.forEach(tx => {
              const color = destinationColorMap.get(flow.name) ?? fallbackDestinationColor;
              const size = Math.max(5, Math.min(12, 5 + Math.log10(1 + Math.max(0, tx.amount))));
              const timestamp = now;
              actives.push({ id: tx.id, token: tx.token, amount: tx.amount, color, size, start: now, timestamp });
              processed.set(tx.id, timestamp);
            });
            changed = true;
          }

          const filtered = actives.filter(p => now - p.start < TX_DURATION_MS);
          if (filtered.length !== actives.length) {
            state.active = filtered;
            changed = true;
          } else {
            state.active = actives;
          }

          if (state.active.length > MAX_ACTIVE) {
            state.active.splice(0, state.active.length - MAX_ACTIVE);
            changed = true;
          }
        });
      });

      if (changed) {
        setTick(t => (t + 1) % 1_000_000);
      }
    }, TICK_MS);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [bridgeSummaries, destinationColorMap, getFlowKey]);

  return { queuesRef, getFlowKey, TX_DURATION_MS };
};
