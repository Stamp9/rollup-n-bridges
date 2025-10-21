import type { MutableRefObject } from "react";

import BasecatRunningSrc from "../assets/cattie1.gif";
import OPcatRunningSrc from "../assets/cattie2.gif";
import catWaitingSrc from "../assets/cat_wating.png";
import islandSrc from "../assets/ethereum.png";
import relayNodeSrc from "../assets/relay.png";
import { NodeCircle } from "./NodeCircle";
import { FLOW_END_OFFSET, bridgeProtocols, islandNode, svgHeight, svgWidth } from "./bridgeOverviewConfig";
import type { BridgeDestinationFlow, BridgeSummary } from "./hooks/useBridgeSummaries";
import type { ActiveParticle } from "./hooks/useBridgeQueues";

const CAT_SIZE_MIN = 6;
const CAT_SIZE_MAX = 12;

const getCatAsset = (destinationName: string) => {
  if (destinationName === "Base") {
    return BasecatRunningSrc;
  }
  if (destinationName === "Optimism") {
    return OPcatRunningSrc;
  }
  return catWaitingSrc;
};

type BridgeCanvasProps = {
  bridgeSummaries: BridgeSummary[];
  selectedProtocolId: string;
  selectedDestination: string;
  onSelectFlow: (bridgeId: string, destination: string) => void;
  queuesRef: MutableRefObject<Map<string, { active: ActiveParticle[] }>>;
  getFlowKey: (bridgeId: string, destination: string) => string;
  txDurationMs: number;
};

const matchesSelection = (
  flow: BridgeDestinationFlow,
  selectedProtocolId: string,
  selectedDestination: string,
) =>
  (selectedProtocolId === "All" || flow.bridgeId === selectedProtocolId) &&
  (selectedDestination === "All" || flow.name === selectedDestination);

export const BridgeCanvas: React.FC<BridgeCanvasProps> = ({
  bridgeSummaries,
  selectedProtocolId,
  selectedDestination,
  onSelectFlow,
  queuesRef,
  getFlowKey,
  txDurationMs,
}) => (
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
      x={islandNode.x - 110}
      y={islandNode.y - 110}
      width={220}
      height={220}
      preserveAspectRatio="xMidYMid slice"
      style={{ filter: "drop-shadow(0 0 20px rgba(56, 189, 248, 0.35))" }}
    />

    {bridgeProtocols.map(protocol => (
      <NodeCircle
        key={`piexel-node-${protocol.name}`}
        x={protocol.node.x}
        y={protocol.node.y}
        label={protocol.node.id}
        type={protocol.node.type}
        imageSrc={protocol.node.id === "Relay" ? relayNodeSrc : undefined}
        imageRadius={protocol.node.id === "Relay" ? 72 : undefined}
      />
    ))}

    {bridgeSummaries.map((summary, bridgeIndex) => {
      const { protocol, flows: bridgeFlows } = summary;
      const { node } = protocol;
      const dx = node.x - islandNode.x;
      const dy = node.y - islandNode.y;
      const distance = Math.hypot(dx, dy) || 1;
      const offset = Math.min(FLOW_END_OFFSET, Math.max(8, distance * 0.4));
      const endX = node.x - (dx / distance) * offset;
      const endY = node.y - (dy / distance) * offset;
      const path = `M${islandNode.x},${islandNode.y} L${endX},${endY}`;
      const pathId = `piexel-bridge-path-${protocol.name}`;

      const visibleFlows = bridgeFlows.filter(flow => matchesSelection(flow, selectedProtocolId, selectedDestination));
      if (visibleFlows.length === 0) {
        return null;
      }

      // const legendRowHeight = 20;
      // const legendHeight = visibleFlows.length * legendRowHeight + 18;
      // const legendX = node.x + 128;
      // const legendY = Math.max(36, node.y - legendHeight / 2);
      // const containerWidth = 240;
      // const containerHeight = legendHeight + 20;
      // const containerX = legendX - 36;
      // const containerY = legendY - 10;
      // const containerFill = hexToRgba(hue, 0.14);
      // const containerStroke = hexToRgba(hue, 0.3);
      // const tooltipLines = visibleFlows.map(
      //   flow => `${flow.name}: $${(flow.volumeUsd / 1_000_000).toFixed(1)}M • ${flow.txPerMinute} tx/min`,
      // );

      return (
        <g key={`piexel-${protocol.name}`}>
          <circle cx={node.x} cy={node.y} r={70} fill={`url(#piexelBridgeGlow-${protocol.name})`} opacity={0.45} />
          <path id={pathId} d={path} stroke="transparent" strokeWidth={4} fill="none" opacity={0} />
          {/* <title>{[`${protocol.name} bridge`].concat(tooltipLines).join("\n")}</title> */}
          <>
            {/* <rect
              x={containerX}
              y={containerY}
              width={containerWidth}
              height={containerHeight}
              rx={18}
              fill={containerFill}
              stroke={containerStroke}
              strokeWidth={1.2}
            /> */}
            {visibleFlows.map((flow, flowIndex) => {
              const delay = bridgeIndex * 0.6 + flowIndex * 0.8;
              const queueKey = getFlowKey(flow.bridgeId, flow.name);
              const activeParticles = queuesRef.current.get(queueKey)?.active ?? [];

              return (
                <g
                  key={`piexel-${protocol.name}-${flow.name}`}
                  onClick={() => onSelectFlow(flow.bridgeId, flow.name)}
                  style={{ cursor: "pointer" }}
                >
                  {activeParticles.map((particle, particleIndex) => {
                    const txDelay = delay + 0.15 * particleIndex;
                    const catSrc = getCatAsset(flow.name);
                    const baseScale = Math.log10(Math.max(1, particle.amount + 1));
                    const normalized = Math.min(1, baseScale / 6);
                    const catSize = CAT_SIZE_MIN + (CAT_SIZE_MAX - CAT_SIZE_MIN) * normalized;

                    return (
                      <image
                        key={`cat-${particle.id}-${particle.start}`}
                        href={catSrc}
                        x={0}
                        y={0}
                        width={catSize * 4.8}
                        height={catSize * 3.2}
                        preserveAspectRatio="xMidYMid meet"
                        style={{ transform: `translate(${-particle.size * 1.2}px, ${-particle.size * 1.1}px)` }}
                      >
                        
                        <animateMotion
                          dur={`${txDurationMs / 1000}s`}
                          repeatCount="indefinite"
                          path={path}
                          rotate="auto"
                          begin={`${txDelay}s`}
                        />
                      </image>
                    );
                  })}

                </g>
              );
            })}
          </>
        </g>
      );
    })}
  </svg>
);
