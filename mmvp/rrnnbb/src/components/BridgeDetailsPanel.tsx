import type { BridgeTx } from "../data/api";
import { tokenColors } from "../data/model";
import {
  SIDE_PANEL_OPEN_WIDTH,
  blockExplorerByChain,
  defaultBlockExplorer,
} from "./bridgeOverviewConfig";
import type { BridgeDestinationFlow } from "./hooks/useBridgeSummaries";

type ProtocolChip = {
  label: string;
  hue: string;
  value: string;
  isActive: boolean;
};

type DestinationChip = {
  label: string;
  color: string;
  value: string;
  isActive: boolean;
};

type BridgeDetailsPanelProps = {
  activeBridgeLabel: string;
  activeFlow: BridgeDestinationFlow | null;
  activeTransactions: BridgeTx[];
  protocolChipData: ProtocolChip[];
  destinationChipData: DestinationChip[];
  onSelectProtocol: (protocolId: string) => void;
  onSelectDestination: (destination: string) => void;
  onCloseDetails: () => void;
};

const formatMillions = (value: number) => `${(value / 1_000_000).toFixed(2)}M`;
const formatLatency = (value: number | undefined) => (value ? `${(value / 1000).toFixed(2)} s` : "—");
const formatAmount = (token: string, amount: number) =>
  token === "ETH"
    ? `${amount.toFixed(3)} ${token}`
    : `${amount.toLocaleString(undefined, { maximumFractionDigits: 0 })} ${token}`;

export const BridgeDetailsPanel: React.FC<BridgeDetailsPanelProps> = ({
  activeBridgeLabel,
  activeFlow,
  activeTransactions,
  protocolChipData,
  destinationChipData,
  onSelectProtocol,
  onSelectDestination,
  onCloseDetails,
}) => (
  <div
    id="piexel-bridge-overview-card"
    role="dialog"
    aria-label="Piexel bridge details"
    style={{
      position: "fixed",
      top: "72px",
      right: "72px",
      width: `${SIDE_PANEL_OPEN_WIDTH}px`,
      maxHeight: "80vh",
      overflowY: "auto",
      background: "rgba(15, 23, 42, 0.92)",
      border: "1px solid rgba(148, 163, 184, 0.45)",
      borderRadius: "18px",
      padding: "1.35rem 1.25rem 1rem 1.25rem",
      color: "#e2e8f0",
      display: "flex",
      flexDirection: "column",
      gap: "0.85rem",
      boxShadow: "0 25px 50px rgba(15, 23, 42, 0.6)",
      zIndex: 40,
    }}
  >
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <span
        style={{
          fontSize: "0.72rem",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "#94a3b8",
        }}
      >
        {activeBridgeLabel}
      </span>
      <button
        type="button"
        onClick={onCloseDetails}
        style={{
          background: "transparent",
          border: "none",
          color: "#38bdf8",
          fontSize: "0.72rem",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          cursor: "pointer",
        }}
      >
        Close
      </button>
    </div>

    {activeFlow ? (
      <>
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
          <span
            style={{
              width: "12px",
              height: "12px",
              borderRadius: "9999px",
              background: activeFlow.color,
            }}
          />
          <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 600 }}>{activeFlow.name}</h3>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.65rem" }}>
          <div>
            <div style={{ fontSize: "0.7rem", color: "#94a3b8", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "0.35rem" }}>
              Protocol
            </div>
            <div style={{ display: "flex", gap: "0.45rem", flexWrap: "wrap" }}>
              {protocolChipData.map(protocol => (
                <button
                  key={protocol.value}
                  type="button"
                  onClick={() => onSelectProtocol(protocol.value)}
                  style={{
                    fontSize: "0.72rem",
                    letterSpacing: "0.05em",
                    textTransform: "uppercase",
                    padding: "0.25rem 0.6rem",
                    borderRadius: "9999px",
                    border: `1px solid ${protocol.isActive ? protocol.hue : `${protocol.hue}33`}`,
                    color: protocol.hue,
                    background: protocol.isActive ? `${protocol.hue}26` : `${protocol.hue}1a`,
                    opacity: protocol.isActive ? 1 : 0.7,
                    cursor: "pointer",
                    transition: "opacity 120ms ease",
                  }}
                >
                  {protocol.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <div style={{ fontSize: "0.7rem", color: "#94a3b8", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "0.35rem" }}>
              Destination
            </div>
            <div style={{ display: "flex", gap: "0.45rem", flexWrap: "wrap" }}>
              {destinationChipData.map(destination => (
                <button
                  key={destination.value}
                  type="button"
                  onClick={() => onSelectDestination(destination.value)}
                  style={{
                    fontSize: "0.72rem",
                    letterSpacing: "0.05em",
                    textTransform: "uppercase",
                    padding: "0.25rem 0.6rem",
                    borderRadius: "9999px",
                    border: `1px solid ${destination.isActive ? destination.color : `${destination.color}33`}`,
                    color: destination.color,
                    background: destination.isActive ? `${destination.color}26` : `${destination.color}1a`,
                    opacity: destination.isActive ? 1 : 0.7,
                    cursor: "pointer",
                    transition: "opacity 120ms ease",
                  }}
                >
                  {destination.label}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div style={{ fontSize: "0.85rem", color: "#cbd5f5" }}>Volume (1m window)</div>
        <div style={{ fontSize: "1.4rem", fontWeight: 600 }}>{formatMillions(activeFlow.volumeUsd)} USD</div>
        <div style={{ display: "flex", flexDirection: "column", fontSize: "0.85rem", color: "#94a3b8", gap: "0.3rem" }}>
          <span>{activeFlow.txCount ?? 0} tx · {activeFlow.txPerMinute} tx/min</span>
          <span>Avg latency {formatLatency(activeFlow.avgLatencyMs)}</span>
          <span>Last updated {activeFlow.lastUpdated ? new Date(activeFlow.lastUpdated).toLocaleTimeString() : "—"}</span>
        </div>
        <div style={{ fontSize: "0.78rem", color: "#cbd5f5", textTransform: "uppercase", letterSpacing: "0.08em" }}>Recent tx</div>
        <div style={{ maxHeight: "200px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "0.4rem" }}>
          {activeTransactions.length > 0 ? (
            activeTransactions.slice(0, 8).map(tx => {
              const explorer = blockExplorerByChain[tx.chainID] ?? defaultBlockExplorer;
              const blockNumber = tx.destinationBlockNumber ?? tx.blockNumber;
              return (
                <div
                  key={tx.id}
                  style={{
                    border: "1px solid rgba(59, 130, 246, 0.2)",
                    borderRadius: "12px",
                    padding: "0.55rem 0.65rem",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.25rem",
                    background: "rgba(30, 41, 59, 0.7)",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", color: "#f8fafc", fontSize: "0.85rem" }}>
                    <span>Block {blockNumber.toLocaleString()}</span>
                    <span style={{ color: tokenColors[tx.token] ?? "#f59e0b" }}>{tx.token}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.78rem", color: "#94a3b8" }}>
                    <span>{formatAmount(tx.token, tx.amount)}</span>
                    <span>{tx.from}</span>
                  </div>
                  <a
                    href={explorer.buildUrl(blockNumber)}
                    target="_blank"
                    rel="noreferrer"
                    style={{ fontSize: "0.75rem", color: "#38bdf8", textDecoration: "none" }}
                  >
                    {explorer.label}
                  </a>
                </div>
              );
            })
          ) : (
            <div style={{ fontSize: "0.8rem", color: "#94a3b8" }}>No recent transactions</div>
          )}
        </div>
      </>
    ) : (
      <div style={{ fontSize: "0.9rem", color: "#94a3b8" }}>No active flows</div>
    )}
  </div>
);
