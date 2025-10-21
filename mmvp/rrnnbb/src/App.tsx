import { useEffect, useMemo, useState } from "react";

import { PiexelBridgeOverview } from "./components/PiexelBridgeOverview";
import { useBridgeSummaries } from "./components/hooks/useBridgeSummaries";
import type { BridgeTx } from "./data/api";
import { nodes } from "./data/model";
import {
  useBridgeData,
  buildAggregatedData,
  DEFAULT_HISTORY_WINDOW_MS,
  chainIdToDestination,
} from "./data/useBridgeData";

const formatMillions = (value: number) => `${(value / 1_000_000).toFixed(1)}M`;

const bridgeNodes = nodes.filter(node => node.type === "Bridge").map(node => node.id);

type PageView = "network" | "bridge" | "piexel";

export default function App() {
  const [page, setPage] = useState<PageView>("piexel");
  const [bridgeDetailsOpen, setBridgeDetailsOpen] = useState(false);
  const [selectedProtocolId, setSelectedProtocolId] = useState<string>("All");
  const [selectedDestination, setSelectedDestination] = useState<string>("All");
  const { blockNumber, transactions } = useBridgeData(3_000, DEFAULT_HISTORY_WINDOW_MS);
  const [destinationFilters, setDestinationFilters] = useState<Record<string, boolean>>({});
  const [protocolFilters, setProtocolFilters] = useState<Record<string, boolean>>({});

  // Intentionally do not auto-populate destination filters from transactions for now.

  useEffect(() => {
    setProtocolFilters(prev => {
      const next = { ...prev };
      let changed = false;
      bridgeNodes.forEach(protocol => {
        if (!(protocol in next)) {
          next[protocol] = true;
          changed = true;
        }
      });
      return changed ? next : prev;
    });
  }, [transactions]);

  const toggleDestination = (destination: string) => {
    setDestinationFilters(prev => ({ ...prev, [destination]: !(prev[destination] ?? true) }));
  };

  const toggleProtocol = (protocol: string) => {
    setProtocolFilters(prev => ({ ...prev, [protocol]: !(prev[protocol] ?? true) }));
  };

  const activeDestinations = useMemo(() => {
    const entries = Object.entries(destinationFilters);
    if (entries.length === 0) {
      return new Set<string>();
    }
    return new Set(entries.filter(([, enabled]) => enabled).map(([name]) => name));
  }, [destinationFilters]);

  const availableDestinations = useMemo(() => Object.keys(destinationFilters).sort(), [destinationFilters]);
  const availableProtocols = useMemo(() => Object.keys(protocolFilters).sort(), [protocolFilters]);

  const filteredTransactions: BridgeTx[] = useMemo(() => {
    if (transactions.length === 0) {
      return [];
    }
    return transactions.filter(tx => {
      const destination = chainIdToDestination[tx.chainID];
      if (!destination) {
        return false;
      }
      const destinationAllowed = destinationFilters[destination] ?? true;
      if (!destinationAllowed) {
        return false;
      }
      const protocolAllowed = protocolFilters[tx.from] ?? true;
      return protocolAllowed;
    });
  }, [transactions, destinationFilters, protocolFilters]);

  const { links, layer2Flows } = useMemo(
    () => buildAggregatedData(filteredTransactions, DEFAULT_HISTORY_WINDOW_MS),
    [filteredTransactions],
  );

  const filteredFlows = useMemo(() => {
    const hasFilters = Object.keys(destinationFilters).length > 0;
    if (!hasFilters) {
      return layer2Flows;
    }
    return layer2Flows.filter(flow => activeDestinations.has(flow.name));
  }, [layer2Flows, activeDestinations, destinationFilters]);

  const bridgeTotalVolume = filteredFlows.reduce((sum, flow) => sum + flow.volumeUsd, 0);

  const { bridgeSummaries, flattenedFlows, destinationColorMap } = useBridgeSummaries(filteredFlows, links);

  useEffect(() => {
    if (
      selectedProtocolId !== "All" &&
      !flattenedFlows.some(flow => flow.bridgeId === selectedProtocolId)
    ) {
      setSelectedProtocolId("All");
    }
  }, [flattenedFlows, selectedProtocolId]);

  useEffect(() => {
    if (selectedDestination !== "All" && !flattenedFlows.some(flow => flow.name === selectedDestination)) {
      setSelectedDestination("All");
    }
  }, [flattenedFlows, selectedDestination]);

  const legendSummaries = useMemo(() => bridgeSummaries.filter(summary => summary.flows.length > 0), [bridgeSummaries]);

  const handleSelectFlow = (bridgeId: string, destination: string) => {
    setSelectedProtocolId(bridgeId);
    setSelectedDestination(destination);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#020617",
        color: "#e2e8f0",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <header
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "0.75rem",
          padding: "1.5rem 1rem 0.5rem",
        }}
      >
        <div style={{ display: "flex", gap: "0.75rem" }}>
          <button
            type="button"
            onClick={() => setPage("piexel")}
            style={{
              padding: "0.5rem 1.25rem",
              borderRadius: "9999px",
              border: "1px solid",
              borderColor: page === "piexel" ? "#facc15" : "rgba(148, 163, 184, 0.4)",
              background: page === "piexel" ? "rgba(250, 204, 21, 0.12)" : "transparent",
              color: "#f8fafc",
              cursor: "pointer",
              fontWeight: 600,
              letterSpacing: "0.03em",
              transition: "background 0.2s ease",
            }}
          >
            Piexel Bridge Overview
          </button>
        </div>
        {page === "piexel" && legendSummaries.length > 0 && (
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              gap: "0.9rem",
              paddingTop: "0.75rem",
              maxWidth: "960px",
            }}
          >
            {legendSummaries.map(summary => (
              <div
                key={summary.protocol.name}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.4rem",
                  padding: "0.75rem 0.9rem",
                  borderRadius: "16px",
                  background: "rgba(15, 23, 42, 0.65)",
                  border: "1px solid rgba(148, 163, 184, 0.35)",
                  minWidth: "180px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <span
                    style={{
                      width: "10px",
                      height: "10px",
                      borderRadius: "9999px",
                      background: summary.protocol.hue,
                    }}
                  />
                  <span style={{ fontSize: "0.8rem", letterSpacing: "0.08em", textTransform: "uppercase", color: "#cbd5f5" }}>
                    {summary.protocol.name}
                  </span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                  {summary.flows.slice(0, 4).map(flow => {
                    const isActive =
                      selectedProtocolId !== "All" &&
                      selectedDestination !== "All"
                        ? selectedProtocolId === flow.bridgeId && selectedDestination === flow.name
                        : selectedProtocolId === flow.bridgeId && (selectedDestination === "All" || selectedDestination === flow.name);
                    const color = destinationColorMap.get(flow.name) ?? "#94a3b8";
                    return (
                      <button
                        key={`${flow.bridgeId}-${flow.name}`}
                        type="button"
                        onClick={() => handleSelectFlow(flow.bridgeId, flow.name)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: "0.5rem",
                          borderRadius: "12px",
                          border: `1px solid ${isActive ? color : "rgba(148, 163, 184, 0.25)"}`,
                          background: isActive ? `${color}22` : "rgba(15, 23, 42, 0.45)",
                          color: "#f8fafc",
                          padding: "0.4rem 0.55rem",
                          cursor: "pointer",
                          fontSize: "0.78rem",
                        }}
                      >
                        <span style={{ display: "flex", alignItems: "center", gap: "0.45rem" }}>
                          <span
                            style={{
                              width: "12px",
                              height: "12px",
                              borderRadius: "9999px",
                              background: color,
                            }}
                          />
                          {flow.name}
                        </span>
                        <span style={{ color: "#cbd5f5" }}>{`${(flow.volumeUsd / 1_000_000).toFixed(1)}M`}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
        <div
          style={{
            display: "flex",
            gap: "1rem",
            alignItems: "center",
            justifyContent: "center",
            flexWrap: "wrap",
            color: "#94a3b8",
            fontSize: "0.85rem",
          }}
        >
          <span>Block #{blockNumber.toLocaleString()} · Bridge volume last tick {formatMillions(bridgeTotalVolume)}</span>
          {page !== "network" && (
            <button
              type="button"
              onClick={() => setBridgeDetailsOpen(prev => !prev)}
              style={{
                padding: "0.45rem 1.15rem",
                borderRadius: "9999px",
                border: "1px solid",
                borderColor: bridgeDetailsOpen ? "#22c55e" : "rgba(148, 163, 184, 0.45)",
                background: bridgeDetailsOpen ? "rgba(34, 197, 94, 0.18)" : "rgba(15, 23, 42, 0.55)",
                color: "#f8fafc",
                cursor: "pointer",
                fontSize: "0.78rem",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                transition: "background 0.2s ease",
              }}
            >
              {bridgeDetailsOpen ? "Hide bridge details" : "Show bridge details"}
            </button>
          )}
        </div>
        <div
          style={{
            display: "flex",
            gap: "0.5rem",
            flexWrap: "wrap",
            justifyContent: "center",
            paddingTop: "0.25rem",
            alignItems: "center",
          }}
        >
          <span style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "#a5b4fc" }}>
            Protocols
          </span>
          {availableProtocols.map(protocol => {
            const enabled = protocolFilters[protocol] ?? true;
            return (
              <button
                key={protocol}
                type="button"
                onClick={() => toggleProtocol(protocol)}
                style={{
                  padding: "0.35rem 0.9rem",
                  borderRadius: "9999px",
                  border: "1px solid",
                  borderColor: enabled ? "#38bdf8" : "rgba(148, 163, 184, 0.35)",
                  background: enabled ? "rgba(59, 130, 246, 0.18)" : "rgba(15, 23, 42, 0.4)",
                  color: "#f8fafc",
                  cursor: "pointer",
                  fontSize: "0.82rem",
                  letterSpacing: "0.02em",
                  transition: "background 0.2s ease",
                }}
              >
                {enabled ? "● " : "○ "}
                {protocol}
              </button>
            );
          })}
        </div>
        <div
          style={{
            display: "flex",
            gap: "0.5rem",
            flexWrap: "wrap",
            justifyContent: "center",
            paddingTop: "0.5rem",
            alignItems: "center",
          }}
        >
          <span style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "#a5b4fc" }}>
            Destinations
          </span>
          {availableDestinations.map(destination => {
            const enabled = destinationFilters[destination] ?? true;
            return (
              <button
                key={destination}
                type="button"
                onClick={() => toggleDestination(destination)}
                style={{
                  padding: "0.35rem 0.9rem",
                  borderRadius: "9999px",
                  border: "1px solid",
                  borderColor: enabled ? "#22c55e" : "rgba(148, 163, 184, 0.4)",
                  background: enabled ? "rgba(34, 197, 94, 0.16)" : "rgba(15, 23, 42, 0.4)",
                  color: "#f8fafc",
                  cursor: "pointer",
                  fontSize: "0.85rem",
                  letterSpacing: "0.02em",
                  transition: "background 0.2s ease",
                }}
              >
                {enabled ? "● " : "○ "}
                {destination}
              </button>
            );
          })}
        </div>
      </header>

      <main
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "1.5rem",
        }}
      >
        {page === "piexel" && (
          <PiexelBridgeOverview
            detailsOpen={bridgeDetailsOpen}
            onCloseDetails={() => setBridgeDetailsOpen(false)}
            bridgeSummaries={bridgeSummaries}
            flattenedFlows={flattenedFlows}
            destinationColorMap={destinationColorMap}
            selectedProtocolId={selectedProtocolId}
            selectedDestination={selectedDestination}
            onSelectProtocol={setSelectedProtocolId}
            onSelectDestination={setSelectedDestination}
          />
        )}
      </main>
    </div>
  );
}
