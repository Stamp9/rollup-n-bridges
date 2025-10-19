import { useMemo, useState } from "react";

import islandSrc from "../assets/island.png";
import temBgSrc from "../assets/tem_bg.png";
import catWaitingSrc from "../assets/cat_wating.png";
import catRunningSrc from "../assets/cat_running.gif";

import { NodeCircle } from "./NodeCircle";
import { TokenParticle } from "./TokenParticle";
import type { Layer2Flow, Link } from "../data/model";
import { layer2Destinations, tokenColors } from "../data/model";
import type { BridgeTx } from "../data/api";

interface PiexelBridgeOverviewProps {
  flows: Layer2Flow[];
  links?: Link[];
  detailsOpen: boolean;
  onCloseDetails: () => void;
}

const islandNode = { id: "Island", type: "L1" as const, x: 220, y: 320 };

const bridgeProtocols = [
  { name: "Relay", hue: "#38bdf8", node: { id: "Relay", type: "Bridge" as const, x: 540, y: 220 } },
  { name: "Across", hue: "#a855f7", node: { id: "Across", type: "Bridge" as const, x: 540, y: 360 } },
  { name: "Mayan", hue: "#f97316", node: { id: "Mayan", type: "Bridge" as const, x: 540, y: 500 } },
] as const;

const svgWidth = 900;
const svgHeight = 620;

const SIDE_PANEL_OPEN_WIDTH = 260;

const fallbackDestinationColor = "#64748b";

const baseDestinationColorMap = new Map(layer2Destinations.map(dest => [dest.name, dest.color]));

const hexToRgba = (hex: string, alpha: number) => {
  if (!hex || typeof hex !== "string" || !hex.startsWith("#")) {
    return `rgba(100, 116, 139, ${alpha})`;
  }
  let normalized = hex.slice(1);
  if (normalized.length === 3) {
    normalized = normalized
      .split("")
      .map(char => char + char)
      .join("");
  }
  if (normalized.length !== 6) {
    return `rgba(100, 116, 139, ${alpha})`;
  }
  const value = Number.parseInt(normalized, 16);
  const r = (value >> 16) & 255;
  const g = (value >> 8) & 255;
  const b = value & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

type BridgeDestinationFlow = Layer2Flow & {
  bridgeId: string;
  transactions: BridgeTx[];
};

type BridgeSummary = {
  protocol: typeof bridgeProtocols[number];
  flows: BridgeDestinationFlow[];
};

const sortTransactions = (txs: BridgeTx[]) =>
  txs.sort((a, b) => b.blockNumber - a.blockNumber || (b.timestamp ?? 0) - (a.timestamp ?? 0));

export const PiexelBridgeOverview: React.FC<PiexelBridgeOverviewProps> = ({
  flows,
  links = [],
  detailsOpen,
  onCloseDetails,
}) => {
  const [hoveredKey, setHoveredKey] = useState<{ bridgeId: string; destination: string } | null>(null);

  const destinationColorMap = useMemo(() => {
    const map = new Map(baseDestinationColorMap);
    flows.forEach(flow => map.set(flow.name, flow.color));
    return map;
  }, [flows]);

  const allowedDestinations = useMemo(() => new Set(flows.map(flow => flow.name)), [flows]);

  const bridgeSummaries = useMemo<BridgeSummary[]>(() => {
    return bridgeProtocols.map(protocol => {
      const flowsByDestination = new Map<string, BridgeDestinationFlow>();

      links.forEach(link => {
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
          const updatedTransactions = sortTransactions([...existing.transactions, ...transactions]);
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
        } else {
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
        }
      });

      const flowsForBridge = Array.from(flowsByDestination.values()).sort((a, b) => b.volumeUsd - a.volumeUsd);
      return { protocol, flows: flowsForBridge };
    });
  }, [links, allowedDestinations, destinationColorMap]);

  const flattenedFlows = useMemo(() => bridgeSummaries.flatMap(summary => summary.flows), [bridgeSummaries]);

  const activeFlow = useMemo(() => {
    if (!hoveredKey) {
      return flattenedFlows[0] ?? null;
    }
    return (
      flattenedFlows.find(flow => flow.bridgeId === hoveredKey.bridgeId && flow.name === hoveredKey.destination) ??
      flattenedFlows[0] ??
      null
    );
  }, [hoveredKey, flattenedFlows]);

  const activeBridge = bridgeSummaries.find(summary => summary.protocol.name === activeFlow?.bridgeId) ?? null;
  const activeBridgeId = activeBridge?.protocol.name ?? null;

  const protocolChipData = bridgeProtocols.map(protocol => ({
    name: protocol.name,
    hue: protocol.hue,
    isActive: protocol.name === activeBridgeId,
  }));

  const activeTransactions = activeFlow?.transactions ?? [];

  const formatMillions = (value: number) => `${(value / 1_000_000).toFixed(2)}M`;
  const formatLatency = (value: number | undefined) => (value ? `${(value / 1000).toFixed(2)} s` : "—");
  const formatAmount = (token: string, amount: number) =>
    token === "ETH"
      ? `${amount.toFixed(3)} ${token}`
      : `${amount.toLocaleString(undefined, { maximumFractionDigits: 0 })} ${token}`;

  return (
    <>
      <div
        style={{
          width: "100%",
          margin: 0,
          padding: 0,
          boxSizing: "border-box",
          display: "flex",
          justifyContent: "center",
          backgroundImage: `url(${temBgSrc})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            width: "100%",
            maxWidth: "1200px",
            padding: "2.5rem 2rem",
          }}
        >
          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            preserveAspectRatio="xMidYMid meet"
            style={{ width: "100%", height: "auto", background: "transparent" }}
          >
            <defs>
              {bridgeProtocols.map(protocol => (
                <radialGradient id={`piexelBridgeGlow-${protocol.name}`} cx="50%" cy="50%" r="70%" key={protocol.name}>
                  <stop offset="0%" stopColor={protocol.hue} stopOpacity={0.45} />
                  <stop offset="100%" stopColor={protocol.hue} stopOpacity={0.1} />
                </radialGradient>
              ))}
            </defs>

            <image
              href={islandSrc}
              x={islandNode.x - 60}
              y={islandNode.y - 60}
              width={120}
              height={120}
              preserveAspectRatio="xMidYMid slice"
              style={{ filter: "drop-shadow(0 0 20px rgba(56, 189, 248, 0.35))" }}
            />

            {bridgeSummaries.map((summary, bridgeIndex) => {
              const { protocol, flows: bridgeFlows } = summary;
              const { node, hue } = protocol;
              const controlX = (islandNode.x + node.x) / 2;
              const controlY = ((islandNode.y + node.y) / 2) - 140;
              const path = `M${islandNode.x},${islandNode.y} Q${controlX},${controlY} ${node.x},${node.y}`;
              const legendRowHeight = 20;
              const legendHeight = bridgeFlows.length * legendRowHeight + 18;
              const legendX = node.x + 128;
              const legendY = Math.max(36, node.y - legendHeight / 2);
              const tooltipLines = bridgeFlows.map(
                flow => `${flow.name}: $${(flow.volumeUsd / 1_000_000).toFixed(1)}M • ${flow.txPerMinute} tx/min`,
              );
              const containerWidth = 240;
              const containerHeight = legendHeight + 20;
              const containerX = legendX - 36;
              const containerY = legendY - 10;
              const containerFill = hexToRgba(hue, 0.14);
              const containerStroke = hexToRgba(hue, 0.3);
              return (
                <g key={`piexel-${protocol.name}`}>
                  <circle cx={node.x} cy={node.y} r={70} fill={`url(#piexelBridgeGlow-${protocol.name})`} opacity={0.45} />
                  <path d={path} stroke={hue} strokeWidth={4} fill="none" opacity={0.35} />
                  <title>{[`${protocol.name} bridge`].concat(tooltipLines).join("\n")}</title>
                  {bridgeFlows.length === 0 ? (
                    <text x={legendX} y={node.y} fill="#475569" fontSize={12}>
                      No active flows
                    </text>
                  ) : (
                    <>
                      <rect
                        x={containerX}
                        y={containerY}
                        width={containerWidth}
                        height={containerHeight}
                        rx={18}
                        fill={containerFill}
                        stroke={containerStroke}
                        strokeWidth={1.2}
                      />
                      {bridgeFlows.map((flow, flowIndex) => {
                        const delay = bridgeIndex * 0.6 + flowIndex * 0.8;
                        const size = Math.min(22, 4 + flow.volumeUsd / 2_000_000);
                        const labelX = legendX;
                        const labelY = legendY + 22 + flowIndex * legendRowHeight;
                        const indicatorSize = 16;
                        const indicatorX = labelX - indicatorSize - 8;
                        const indicatorY = labelY - indicatorSize / 2;
                        return (
                          <g
                            key={`piexel-${protocol.name}-${flow.name}`}
                            onMouseEnter={() => setHoveredKey({ bridgeId: flow.bridgeId, destination: flow.name })}
                            onMouseLeave={() => setHoveredKey(null)}
                          >
                            {flow.name === "Base" ? (
                              <image
                                href={catRunningSrc}
                                x={0}
                                y={0}
                                width={size * 4.8}
                                height={size * 3.2}
                                preserveAspectRatio="xMidYMid meet"
                                style={{ transform: `translate(${-size * 1.2}px, ${-size * 1.1}px)` }}
                              >
                                <animateMotion
                                  dur={`${6}s`}
                                  repeatCount="indefinite"
                                  path={path}
                                  rotate="auto"
                                  begin={`${delay}s`}
                                />
                              </image>
                            ) : (
                              <TokenParticle path={path} delay={delay} color={flow.color} duration={6} size={size} />
                            )}
                        {flow.name === "Base" ? (
                          <image
                            href={catWaitingSrc}
                            x={indicatorX}
                            y={indicatorY}
                            width={indicatorSize}
                            height={indicatorSize}
                            preserveAspectRatio="xMidYMid slice"
                            style={{ filter: "drop-shadow(0 2px 6px rgba(15, 23, 42, 0.6))" }}
                          />
                        ) : (
                          <rect
                            x={indicatorX}
                            y={indicatorY}
                            width={indicatorSize}
                            height={indicatorSize}
                            rx={5}
                            fill={flow.color}
                            opacity={0.95}
                          />
                        )}
                            <text
                              x={labelX}
                              y={labelY}
                              fill="#e5e7eb"
                              fontSize={12}
                              fontWeight={600}
                              dominantBaseline="middle"
                            >
                              {flow.name}
                              <tspan
                                dx={8}
                                fill="#cbd5f5"
                                fontSize={10}
                                fontWeight={400}
                              >
                                {`${(flow.volumeUsd / 1_000_000).toFixed(1)}M • ${flow.txPerMinute} tx/min`}
                              </tspan>
                            </text>
                          </g>
                        );
                      })}
                    </>
                  )}
                </g>
              );
            })}

            {bridgeProtocols.map(protocol => (
              <NodeCircle
                key={`piexel-node-${protocol.name}`}
                x={protocol.node.x}
                y={protocol.node.y}
                label={protocol.node.id}
                type={protocol.node.type}
              />
            ))}
          </svg>
        </div>
      </div>

      {detailsOpen && (
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
              {activeFlow?.bridgeId ?? "Bridge"}
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
              <div style={{ display: "flex", gap: "0.45rem", flexWrap: "wrap" }}>
                {protocolChipData.map(protocol => (
                  <span
                    key={protocol.name}
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
                    }}
                  >
                    {protocol.name}
                  </span>
                ))}
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
                  activeTransactions.slice(0, 8).map(tx => (
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
                        <span>Block {tx.blockNumber.toLocaleString()}</span>
                        <span style={{ color: tokenColors[tx.token] ?? "#f59e0b" }}>{tx.token}</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.78rem", color: "#94a3b8" }}>
                        <span>{formatAmount(tx.token, tx.amount)}</span>
                        <span>{tx.from}</span>
                      </div>
                      <a
                        href={`https://etherscan.io/tx/${tx.id}`}
                        target="_blank"
                        rel="noreferrer"
                        style={{ fontSize: "0.75rem", color: "#38bdf8", textDecoration: "none" }}
                      >
                        View on Etherscan
                      </a>
                    </div>
                  ))
                ) : (
                  <div style={{ fontSize: "0.8rem", color: "#94a3b8" }}>No recent transactions</div>
                )}
              </div>
            </>
          ) : (
            <div style={{ fontSize: "0.9rem", color: "#94a3b8" }}>No active flows</div>
          )}
        </div>
      )}
    </>
  );
};
