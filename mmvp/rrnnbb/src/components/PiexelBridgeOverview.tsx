import { useEffect, useMemo, useRef, useState } from "react";

import islandSrc from "../assets/ethereum.png";
import temBgSrc from "../assets/tem_bg.png";
import catWaitingSrc from "../assets/cat_wating.png";
import OPcatRunningSrc from "../assets/cattie2.gif";
import BasecatRunningSrc from "../assets/cattie1.gif";
import relayNodeSrc from "../assets/relay.png";

import { NodeCircle } from "./NodeCircle";
import { TokenParticle } from "./TokenParticle";
import type { Layer2Flow, Link } from "../data/model";
import { layer2Destinations, tokenColors } from "../data/model";
import type { BridgeTx } from "../data/api";

const TX_DURATION_MS = 7_000;

interface PiexelBridgeOverviewProps {
  flows: Layer2Flow[];
  links?: Link[];
  detailsOpen: boolean;
  onCloseDetails: () => void;
}

const formatMillions = (value: number) => `${(value / 1_000_000).toFixed(2)}M`;
const formatLatency = (value: number | undefined) =>
  value ? `${(value / 1000).toFixed(2)} s` : "—";
const formatAmount = (token: string, amount: number) =>
  token === "ETH"
    ? `${amount.toFixed(3)} ${token}`
    : `${amount.toLocaleString(undefined, { maximumFractionDigits: 0 })} ${token}`;

// Amount of time between each query to the Envio indexer.
export const QUERY_TICK = 3_000;

const islandNode = { id: "Island", type: "L1" as const, x: 220, y: 320 };

const bridgeProtocols = [
  {
    name: "Relay",
    hue: "#38bdf8",
    node: { id: "Relay", type: "Bridge" as const, x: 540, y: 320 },
  },
  {
    name: "Across",
    hue: "#a855f7",
    node: { id: "Across", type: "Bridge" as const, x: 540, y: 120 },
  },
  {
    name: "Mayan",
    hue: "#f97316",
    node: { id: "Mayan", type: "Bridge" as const, x: 540, y: 500 },
  },
] as const;

const svgWidth = 900;
const svgHeight = 620;

const SIDE_PANEL_OPEN_WIDTH = 260;
const FLOW_END_OFFSET = 30;

const fallbackDestinationColor = "#64748b";

const baseDestinationColorMap = new Map(
  layer2Destinations.map((dest) => [dest.name, dest.color]),
);

const blockExplorerByChain: Record<
  number,
  { buildUrl: (blockNumber: number) => string; label: string }
> = {
  1: {
    buildUrl: (blockNumber) => `https://etherscan.io/block/${blockNumber}`,
    label: "View on Etherscan",
  },
  10: {
    buildUrl: (blockNumber) =>
      `https://explorer.optimism.io/block/${blockNumber}`,
    label: "View on Optimism Explorer",
  },
  8453: {
    buildUrl: (blockNumber) =>
      `https://base.blockscout.com/block/${blockNumber}`,
    label: "View on Blockscout",
  },
};

const defaultBlockExplorer = blockExplorerByChain[1];
const hexToRgba = (hex: string, alpha: number) => {
  if (!hex || typeof hex !== "string" || !hex.startsWith("#")) {
    return `rgba(100, 116, 139, ${alpha})`;
  }
  let normalized = hex.slice(1);
  if (normalized.length === 3) {
    normalized = normalized
      .split("")
      .map((char) => char + char)
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
  protocol: (typeof bridgeProtocols)[number];
  flows: BridgeDestinationFlow[];
};

const sortTransactions = (txs: BridgeTx[]) =>
  txs.sort((a, b) => {
    const blockA = a.destinationBlockNumber ?? a.blockNumber;
    const blockB = b.destinationBlockNumber ?? b.blockNumber;
    return blockB - blockA || (b.timestamp ?? 0) - (a.timestamp ?? 0);
  });

function renderCat(p: any, flow: any, txDelay: any, lanePath: any) {
  // Use a stable per-particle begin offset to prevent animation restarts on re-render

  const catSrc =
    flow.name === "Base"
      ? BasecatRunningSrc
      : flow.name === "Optimism"
        ? OPcatRunningSrc
        : catWaitingSrc;

  const minSize = 6; // catsize
  const maxSize = 12;
  const baseScale = Math.log10(Math.max(1, p.amount + 1));
  const normalized = Math.min(1, baseScale / 6);
  const catSize = minSize + (maxSize - minSize) * normalized;

  return (
    <image
      key={`cat--${p.id}-${p.start}`}
      href={catSrc}
      x={0}
      y={0}
      width={catSize * 4.8}
      height={catSize * 3.2}
      preserveAspectRatio="xMidYMid meet"
      style={{
        transform: `translate(${-p.size * 1.2}px, ${-p.size * 1.1}px)`,
      }}
    >
      <animateMotion
        dur={`${TX_DURATION_MS / 1000}s`}
        repeatCount="indefinite"
        path={lanePath}
        rotate="auto"
        begin={`${txDelay}s`}
      />
    </image>
  );
}

export const PiexelBridgeOverview: React.FC<PiexelBridgeOverviewProps> = ({
  flows,
  links = [],
  detailsOpen,
  onCloseDetails,
}) => {
  const [selectedProtocolId, setSelectedProtocolId] = useState<string>("All");
  const [selectedDestination, setSelectedDestination] = useState<string>("All");
  // Keep a map of
  // < Base:
  //     active: <0: cats0, 1: cats1, 2: cats2>
  // >
  //
  const [baseState, setBaseState] = useState<BridgeState>();
  const [opState, setOpState] = useState<BridgeState>();

  const destinationColorMap = useMemo(() => {
    const map = new Map(baseDestinationColorMap);
    flows.forEach((flow) => map.set(flow.name, flow.color));
    return map;
  }, [flows]);

  const allowedDestinations = useMemo(
    () => new Set(flows.map((flow) => flow.name)),
    [flows],
  );

  const bridgeSummaries = useMemo<BridgeSummary[]>(() => {
    return bridgeProtocols.map((protocol) => {
      const flowsByDestination = new Map<string, BridgeDestinationFlow>();

      links.forEach((link) => {
        if (link.source !== protocol.name) {
          return;
        }
        if (
          allowedDestinations.size > 0 &&
          !allowedDestinations.has(link.target)
        ) {
          return;
        }
        const tokens = link.tokens ?? [];
        const volumeUsd = tokens.reduce(
          (sum, token) => sum + token.volumeUsd,
          0,
        );
        const txPerMinute = tokens.reduce(
          (sum, token) => sum + token.txPerMinute,
          0,
        );
        const txCount = tokens.reduce(
          (sum, token) => sum + (token.txCount ?? 0),
          0,
        );
        const latencyWeightedSum = tokens.reduce(
          (sum, token) =>
            sum + (token.avgLatencyMs ?? 0) * (token.txCount ?? 1),
          0,
        );
        const latencyWeight = tokens.reduce(
          (sum, token) => sum + (token.txCount ?? 1),
          0,
        );
        const avgLatencyMs =
          latencyWeight > 0
            ? latencyWeightedSum / latencyWeight
            : (tokens[0]?.avgLatencyMs ?? 0);
        const color =
          destinationColorMap.get(link.target) ?? fallbackDestinationColor;
        const transactions = sortTransactions([...(link.transactions ?? [])]);

        const existing = flowsByDestination.get(link.target);
        if (existing) {
          const existingTxCount = existing.txCount ?? 0;
          const combinedTxCount = existingTxCount + txCount;
          const combinedLatencySum =
            existing.avgLatencyMs * existingTxCount + avgLatencyMs * txCount;
          const updatedTransactions = sortTransactions([
            ...existing.transactions,
            ...transactions,
          ]);
          flowsByDestination.set(link.target, {
            bridgeId: existing.bridgeId,
            name: existing.name,
            color: existing.color,
            volumeUsd: existing.volumeUsd + volumeUsd,
            txPerMinute: existing.txPerMinute + txPerMinute,
            avgLatencyMs:
              combinedTxCount > 0
                ? combinedLatencySum / combinedTxCount
                : existing.avgLatencyMs,
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

      const flowsForBridge = Array.from(flowsByDestination.values()).sort(
        (a, b) => b.volumeUsd - a.volumeUsd,
      );
      return { protocol, flows: flowsForBridge };
    });
  }, [links, allowedDestinations, destinationColorMap]);

  const flattenedFlows = useMemo(
    () => bridgeSummaries.flatMap((summary) => summary.flows),
    [bridgeSummaries],
  );

  useEffect(() => {
    if (
      selectedProtocolId !== "All" &&
      !flattenedFlows.some((flow) => flow.bridgeId === selectedProtocolId)
    ) {
      setSelectedProtocolId("All");
    }
  }, [flattenedFlows, selectedProtocolId]);

  useEffect(() => {
    if (
      selectedDestination !== "All" &&
      !flattenedFlows.some((flow) => flow.name === selectedDestination)
    ) {
      setSelectedDestination("All");
    }
  }, [flattenedFlows, selectedDestination]);

  const allDestinations = useMemo(() => {
    const set = new Set<string>();
    flattenedFlows.forEach((flow) => set.add(flow.name));
    return ["All", ...Array.from(set)];
  }, [flattenedFlows]);

  const protocolOptions = useMemo(
    () => ["All", ...bridgeProtocols.map((protocol) => protocol.name)],
    [],
  );

  const selectedFlows = useMemo(() => {
    return flattenedFlows.filter((flow) => {
      const matchesProtocol =
        selectedProtocolId === "All" || flow.bridgeId === selectedProtocolId;
      const matchesDestination =
        selectedDestination === "All" || flow.name === selectedDestination;
      return matchesProtocol && matchesDestination;
    });
  }, [flattenedFlows, selectedProtocolId, selectedDestination]);

  const activeFlow = useMemo(() => {
    if (selectedFlows.length === 0) {
      return null;
    }
    if (selectedFlows.length === 1) {
      return selectedFlows[0];
    }

    const totalVolume = selectedFlows.reduce(
      (sum, flow) => sum + flow.volumeUsd,
      0,
    );
    const totalTxCount = selectedFlows.reduce(
      (sum, flow) => sum + (flow.txCount ?? 0),
      0,
    );
    const totalTxPerMinute = selectedFlows.reduce(
      (sum, flow) => sum + flow.txPerMinute,
      0,
    );
    const latencyWeightedSum = selectedFlows.reduce(
      (sum, flow) => sum + (flow.avgLatencyMs ?? 0) * (flow.txCount ?? 0),
      0,
    );
    const lastUpdated = selectedFlows.reduce(
      (max, flow) => Math.max(max, flow.lastUpdated ?? 0),
      0,
    );
    const transactions = sortTransactions(
      selectedFlows.flatMap((flow) => flow.transactions ?? []),
    );

    const name =
      selectedDestination === "All"
        ? selectedProtocolId === "All"
          ? "All Destinations"
          : `${selectedProtocolId} · All Destinations`
        : selectedDestination;

    const color =
      selectedDestination !== "All"
        ? (destinationColorMap.get(selectedDestination) ??
          fallbackDestinationColor)
        : fallbackDestinationColor;

    const avgLatencyMs =
      totalTxCount > 0
        ? latencyWeightedSum / totalTxCount
        : (selectedFlows[0]?.avgLatencyMs ?? 0);

    const aggregatedFlow: BridgeDestinationFlow = {
      bridgeId: selectedProtocolId === "All" ? "All" : selectedProtocolId,
      name,
      color,
      volumeUsd: totalVolume,
      txPerMinute: totalTxPerMinute,
      avgLatencyMs,
      txCount: totalTxCount,
      lastUpdated,
      transactions,
    };

    return aggregatedFlow;
  }, [
    selectedFlows,
    selectedDestination,
    selectedProtocolId,
    destinationColorMap,
  ]);

  const protocolChipData = protocolOptions.map((option) => {
    if (option === "All") {
      return {
        label: "All Bridges",
        hue: "#38bdf8",
        value: "All",
        isActive: selectedProtocolId === "All",
      };
    }
    const protocol = bridgeProtocols.find((p) => p.name === option)!;
    return {
      label: protocol.name,
      hue: protocol.hue,
      value: protocol.name,
      isActive: selectedProtocolId === protocol.name,
    };
  });

  const destinationChipData = allDestinations.map((option) => {
    if (option === "All") {
      return {
        label: "All L2",
        color: "#38bdf8",
        value: "All",
        isActive: selectedDestination === "All",
      };
    }
    return {
      label: option,
      color: destinationColorMap.get(option) ?? fallbackDestinationColor,
      value: option,
      isActive: selectedDestination === option,
    };
  });

  const activeBridgeLabel =
    selectedProtocolId === "All" ? "All Bridges" : selectedProtocolId;

  const activeTransactions = activeFlow?.transactions ?? [];

  // Per-flow particle queues sourced from flow.transactions
  type ActiveParticle = {
    id: string;
    token: string;
    amount: number;
    color: string;
    size: number;
    start: number;
    timestamp: number;
    laneOffset?: number; // perpendicular offset from center path (px)
    beginOffsetSec: number; // stable animation begin offset to avoid restarts
  };
  type BridgeState = {
    cats: Array<Array<ActiveParticle>>;
    next_idx: number;
  };
  const getFlowKey = (bridgeId: string, destination: string) =>
    `${bridgeId}::${destination}`;

  // How long a tx should stay alive along the path
  const NUM_BATCHES = Math.ceil(TX_DURATION_MS / QUERY_TICK);
  const TICK_MS = QUERY_TICK;
  const MAX_ACTIVE = 24;
  const MAX_ENQUEUE_PER_TICK = 8;
  // Motion path visual width and lane settings
  const PATH_BAND_WIDTH = 56; // px wide band rendered under the particles
  const LANE_COUNT = 7; // number of discrete parallel lanes within the band
  // const catDurationSeconds = TX_DURATION_MS / 1_000;

  useEffect(() => {
    let cancelled = false;
    const timer = window.setInterval(() => {
      if (cancelled) return;
      const now = Date.now();
      let changed = false;

      // Walk current flows (by protocol) and enqueue new txs into per-flow queues
      bridgeSummaries.forEach((summary) => {
        summary.flows.forEach((flow) => {
          const key = getFlowKey(flow.bridgeId, flow.name);

          if (key !== "Relay::Base") {
            return;
          }
          console.log(key);
          var state = undefined;
          if (key === "Relay::Base") {
            state = baseState;
          } else if (key === "Relay::Optimism") {
            state = opState;
          }

          if (state === undefined) {
            const bridgeState = { cats: [], next_idx: 0 };
            let i = 0;
            console.log(bridgeState);
            while (i < NUM_BATCHES) {
              bridgeState.cats.push([]);
              i++;
            }

            if (key === "Relay::Base") {
              state = baseState;
              setBaseState(bridgeState);
            } else if (key === "Relay::Optimism") {
              state = opState;
              setOpState(bridgeState);
            }

            return;
          }

          // Advance ring buffer index safely within [0, NUM_BATCHES)
          const curr_idx = state.next_idx % NUM_BATCHES;
          state.next_idx = (state.next_idx + 1) % NUM_BATCHES;
          const cats = state.cats[curr_idx];

          if (flow.transactions.length > 0) {
            var new_cats = new Array();
            flow.transactions.forEach((tx) => {
              const color =
                destinationColorMap.get(flow.name) ?? fallbackDestinationColor;
              const size = Math.max(
                5,
                Math.min(12, 5 + Math.log10(1 + Math.max(0, tx.amount))),
              );
              const timestamp = now; // 没有 timestamp，就用当前时间

              // Assign a discrete random lane within a wide band
              const laneStep =
                LANE_COUNT > 1 ? PATH_BAND_WIDTH / (LANE_COUNT - 1) : 0;
              const laneIndex = Math.floor(Math.random() * LANE_COUNT);
              const centerIndex = (LANE_COUNT - 1) / 2;
              const laneOffset = (laneIndex - centerIndex) * laneStep;

              // Distribute particles across NUM_BATCHES stable time slots so we keep ~2-3 concurrent streams
              const batchSlot = curr_idx;
              const baseBatchOffsetSec = (QUERY_TICK / 1000) * batchSlot;
              // Small stagger within the same tick to avoid overlap
              const intraTickStaggerSec = Math.random() * 0.05;
              const beginOffsetSec = baseBatchOffsetSec + intraTickStaggerSec;

              new_cats.push({
                id: tx.id,
                token: tx.token,
                amount: tx.amount,
                color,
                size,
                start: now,
                timestamp,
                laneOffset,
                beginOffsetSec,
              });
            });

            console.log(curr_idx);
            console.log(new_cats);
            const cats = new_cats;
            state.cats[curr_idx] = new_cats;
            changed = true;
          }
        });
      });
    }, TICK_MS);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [bridgeSummaries, destinationColorMap]);
  return (
    <>

      {/* <RelayL2LiveCounter /> */}

      <h1
        style={{
          position: "absolute",
          top: "3%",
          left: "15%",
          transform: "translateX(-50%)",
          fontFamily: "'Press Start 2P', cursive",
          fontSize: "20px",
          color: "#f8fafc",
          textShadow: "2px 2px 0 #38bdf8, 4px 4px 0 #1e3a8a",
          letterSpacing: "2px",
          zIndex: 20,
          textAlign: "center",
        }}
      >
        Envio Gato
      </h1>



      <div
        style={{
          position: "fixed",
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
              {bridgeProtocols.map((protocol) => (
                <radialGradient
                  id={`piexelBridgeGlow-${protocol.name}`}
                  cx="50%"
                  cy="50%"
                  r="70%"
                  key={protocol.name}
                >
                  <stop
                    offset="0%"
                    stopColor={protocol.hue}
                    stopOpacity={0.45}
                  />
                  <stop
                    offset="100%"
                    stopColor={protocol.hue}
                    stopOpacity={0.1}
                  />
                </radialGradient>
              ))}
            </defs>

            <image
              href={islandSrc}
              x={islandNode.x - 110}
              y={islandNode.y - 110}
              width={220}
              height={220}
              preserveAspectRatio="xMidYMid slice"
              style={{
                filter: "drop-shadow(0 0 20px rgba(56, 189, 248, 0.35))",
              }}
            />

            {bridgeProtocols.map((protocol) => (
              <NodeCircle
                key={`piexel-node-${protocol.name}`}
                x={protocol.node.x}
                y={protocol.node.y}
                label={protocol.node.id}
                type={protocol.node.type}
                imageSrc={
                  protocol.node.id === "Relay" ? relayNodeSrc : undefined
                }
                imageRadius={protocol.node.id === "Relay" ? 72 : undefined}
              />
            ))}

            {bridgeSummaries.map((summary, bridgeIndex) => {
              const { protocol, flows: bridgeFlows } = summary;
              const { node, hue } = protocol;
              const dx = node.x - islandNode.x;
              const dy = node.y - islandNode.y;
              const distance = Math.hypot(dx, dy) || 1;
              const offset = Math.min(
                FLOW_END_OFFSET,
                Math.max(8, distance * 0.4),
              );
              const endX = node.x - (dx / distance) * offset;
              const endY = node.y - (dy / distance) * offset;
              const path = `M${islandNode.x},${islandNode.y} L${endX},${endY}`;
              const nx = -dy / distance; // unit normal x (perpendicular to path)
              const ny = dx / distance; // unit normal y
              const pathId = `piexel-bridge-path-${protocol.name}`;
              const matchesSelection = (flow: BridgeDestinationFlow) =>
                (selectedProtocolId === "All" ||
                  flow.bridgeId === selectedProtocolId) &&
                (selectedDestination === "All" ||
                  flow.name === selectedDestination);

              const visibleFlows = bridgeFlows.filter(matchesSelection);
              const legendRowHeight = 20;
              const legendHeight = visibleFlows.length * legendRowHeight + 18;
              const legendX = node.x + 128;
              const legendY = Math.max(36, node.y - legendHeight / 2);
              const tooltipLines = visibleFlows.map(
                (flow) =>
                  `${flow.name}: $${(flow.volumeUsd / 1_000_000).toFixed(1)}M • ${flow.txPerMinute} tx/min`,
              );
              const containerWidth = 240;
              const containerHeight = legendHeight + 20;
              const containerX = legendX - 36;
              const containerY = legendY - 10;
              const containerFill = hexToRgba(hue, 0.14);
              const containerStroke = hexToRgba(hue, 0.3);
              if (visibleFlows.length === 0) {
                return null;
              }

              return (
                <g key={`piexel-${protocol.name}`}>
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={70}
                    fill={`url(#piexelBridgeGlow-${protocol.name})`}
                    opacity={0.45}
                  />
                  {/* Invisible center path (for reference / mpath if needed) */}
                  <path
                    id={pathId}
                    d={path}
                    stroke="transparent"
                    strokeWidth={4}
                    fill="none"
                    opacity={0}
                  />
                  {/* Visible wide band to suggest a thick route */}
                  <path
                    d={path}
                    stroke={hexToRgba(hue, 0.18)}
                    strokeWidth={PATH_BAND_WIDTH}
                    strokeLinecap="round"
                    fill="none"
                  />
                  <title>
                    {[`${protocol.name} bridge`]
                      .concat(tooltipLines)
                      .join("\n")}
                  </title>
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
                    {visibleFlows.map((flow, flowIndex) => {
                      const delay = bridgeIndex * 0.6 + flowIndex * 0.8;
                      const size = Math.min(12, 2 + flow.volumeUsd / 2_000_000);
                      const labelX = legendX;
                      const labelY = legendY + 22 + flowIndex * legendRowHeight;
                      const indicatorSize = 16;
                      const indicatorX = labelX - indicatorSize - 8;
                      const indicatorY = labelY - indicatorSize / 2;

                      return (
                        <g
                          key={`piexel-${protocol.name}-${flow.name}`}
                          onClick={() => {
                            setSelectedProtocolId(flow.bridgeId);
                            setSelectedDestination(flow.name);
                          }}
                          style={{ cursor: "pointer" }}
                        >
                          {baseState != undefined &&
                            baseState.cats.map((ap) => {
                              return ap.map((p, i) => {
                                const txDelay = delay + 0.15 * i;
                                console.log(txDelay);

                                const laneOffset = p.laneOffset ?? 0;
                                const lanePath = `M${islandNode.x + nx * laneOffset},${islandNode.y + ny * laneOffset} L${endX + nx * laneOffset},${endY + ny * laneOffset}`;

                                return renderCat(p, flow, txDelay, lanePath);
                              });
                            })}
                          {flow.name === "Base" ? (
                            <image
                              href={catWaitingSrc}
                              x={indicatorX}
                              y={indicatorY}
                              width={indicatorSize}
                              height={indicatorSize}
                              preserveAspectRatio="xMidYMid slice"
                              style={{
                                filter:
                                  "drop-shadow(0 2px 6px rgba(15, 23, 42, 0.6))",
                              }}
                            />
                          ) : (
                            <rect
                              x={indicatorX}
                              y={indicatorY}
                              width={indicatorSize}
                              height={indicatorSize}
                              rx={5}
                              fill={flow.color}
                              opacity={matchesSelection(flow) ? 1 : 0.6}
                            />
                          )}
                          <text
                            x={labelX}
                            y={labelY}
                            fill={
                              matchesSelection(flow) ? "#f8fafc" : "#e5e7eb"
                            }
                            fontSize={12}
                            fontWeight={matchesSelection(flow) ? 700 : 600}
                            dominantBaseline="middle"
                          >
                            {flow.name}
                            <tspan
                              dx={8}
                              fill={
                                matchesSelection(flow) ? "#e0e7ff" : "#cbd5f5"
                              }
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
                </g>
              );
            })}
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
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
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
              <div
                style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}
              >
                <span
                  style={{
                    width: "12px",
                    height: "12px",
                    borderRadius: "9999px",
                    background: activeFlow.color,
                  }}
                />
                <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 600 }}>
                  {activeFlow.name}
                </h3>
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.65rem",
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: "0.7rem",
                      color: "#94a3b8",
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      marginBottom: "0.35rem",
                    }}
                  >
                    Protocol
                  </div>
                  <div
                    style={{
                      display: "flex",
                      gap: "0.45rem",
                      flexWrap: "wrap",
                    }}
                  >
                    {protocolChipData.map((protocol) => (
                      <button
                        key={protocol.value}
                        type="button"
                        onClick={() => setSelectedProtocolId(protocol.value)}
                        style={{
                          fontSize: "0.72rem",
                          letterSpacing: "0.05em",
                          textTransform: "uppercase",
                          padding: "0.25rem 0.6rem",
                          borderRadius: "9999px",
                          border: `1px solid ${protocol.isActive ? protocol.hue : `${protocol.hue}33`}`,
                          color: protocol.hue,
                          background: protocol.isActive
                            ? `${protocol.hue}26`
                            : `${protocol.hue}1a`,
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
                  <div
                    style={{
                      fontSize: "0.7rem",
                      color: "#94a3b8",
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      marginBottom: "0.35rem",
                    }}
                  >
                    Destination
                  </div>
                  <div
                    style={{
                      display: "flex",
                      gap: "0.45rem",
                      flexWrap: "wrap",
                    }}
                  >
                    {destinationChipData.map((destination) => (
                      <button
                        key={destination.value}
                        type="button"
                        onClick={() =>
                          setSelectedDestination(destination.value)
                        }
                        style={{
                          fontSize: "0.72rem",
                          letterSpacing: "0.05em",
                          textTransform: "uppercase",
                          padding: "0.25rem 0.6rem",
                          borderRadius: "9999px",
                          border: `1px solid ${destination.isActive ? destination.color : `${destination.color}33`}`,
                          color: destination.color,
                          background: destination.isActive
                            ? `${destination.color}26`
                            : `${destination.color}1a`,
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
              <div style={{ fontSize: "0.85rem", color: "#cbd5f5" }}>
                Volume (1m window)
              </div>
              <div style={{ fontSize: "1.4rem", fontWeight: 600 }}>
                {formatMillions(activeFlow.volumeUsd)} USD
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  fontSize: "0.85rem",
                  color: "#94a3b8",
                  gap: "0.3rem",
                }}
              >
                <span>
                  {activeFlow.txCount ?? 0} tx · {activeFlow.txPerMinute} tx/min
                </span>
                <span>
                  Avg latency {formatLatency(activeFlow.avgLatencyMs)}
                </span>
                <span>
                  Last updated{" "}
                  {activeFlow.lastUpdated
                    ? new Date(activeFlow.lastUpdated).toLocaleTimeString()
                    : "—"}
                </span>
              </div>
              <div
                style={{
                  fontSize: "0.78rem",
                  color: "#cbd5f5",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                }}
              >
                Recent tx
              </div>
              <div
                style={{
                  maxHeight: "200px",
                  overflowY: "auto",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.4rem",
                }}
              >
                {activeTransactions.length > 0 ? (
                  activeTransactions.slice(0, 8).map((tx) => {
                    const explorer =
                      blockExplorerByChain[tx.chainID] ?? defaultBlockExplorer;
                    const blockNumber =
                      tx.destinationBlockNumber ?? tx.blockNumber;
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
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            color: "#f8fafc",
                            fontSize: "0.85rem",
                          }}
                        >
                          <span>Block {blockNumber.toLocaleString()}</span>
                          <span
                            style={{
                              color: tokenColors[tx.token] ?? "#f59e0b",
                            }}
                          >
                            {tx.token}
                          </span>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            fontSize: "0.78rem",
                            color: "#94a3b8",
                          }}
                        >
                          <span>{formatAmount(tx.token, tx.amount)}</span>
                          <span>{tx.from}</span>
                        </div>
                        <a
                          href={explorer.buildUrl(blockNumber)}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            fontSize: "0.75rem",
                            color: "#38bdf8",
                            textDecoration: "none",
                          }}
                        >
                          {explorer.label}
                        </a>
                      </div>
                    );
                  })
                ) : (
                  <div style={{ fontSize: "0.8rem", color: "#94a3b8" }}>
                    No recent transactions
                  </div>
                )}
              </div>
            </>
          ) : (
            <div style={{ fontSize: "0.9rem", color: "#94a3b8" }}>
              No active flows
            </div>
          )}
        </div>
      )}
    </>
  );
};
