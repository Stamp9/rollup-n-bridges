import { useMemo } from "react";

import temBgSrc from "../assets/tem_bg.png";
import { BridgeCanvas } from "./BridgeCanvas";
import { BridgeDetailsPanel } from "./BridgeDetailsPanel";
import {
  bridgeProtocols,
  fallbackDestinationColor,
} from "./bridgeOverviewConfig";
import {
  type BridgeDestinationFlow,
  type BridgeSummary,
  sortTransactions,
} from "./hooks/useBridgeSummaries";
import { useBridgeQueues } from "./hooks/useBridgeQueues";

interface PiexelBridgeOverviewProps {
  detailsOpen: boolean;
  onCloseDetails: () => void;
  bridgeSummaries: BridgeSummary[];
  flattenedFlows: BridgeDestinationFlow[];
  destinationColorMap: Map<string, string>;
  selectedProtocolId: string;
  selectedDestination: string;
  onSelectProtocol: (protocolId: string) => void;
  onSelectDestination: (destination: string) => void;
}

export const PiexelBridgeOverview: React.FC<PiexelBridgeOverviewProps> = ({
  detailsOpen,
  onCloseDetails,
  bridgeSummaries,
  flattenedFlows,
  destinationColorMap,
  selectedProtocolId,
  selectedDestination,
  onSelectProtocol,
  onSelectDestination,
}) => {
  const allDestinations = useMemo(() => {
    const set = new Set<string>();
    flattenedFlows.forEach(flow => set.add(flow.name));
    return ["All", ...Array.from(set)];
  }, [flattenedFlows]);

  const protocolOptions = useMemo(() => ["All", ...bridgeProtocols.map(protocol => protocol.name)], []);

  const selectedFlows = useMemo(() => {
    return flattenedFlows.filter(flow => {
      const matchesProtocol = selectedProtocolId === "All" || flow.bridgeId === selectedProtocolId;
      const matchesDestination = selectedDestination === "All" || flow.name === selectedDestination;
      return matchesProtocol && matchesDestination;
    });
  }, [flattenedFlows, selectedProtocolId, selectedDestination]);

  const activeFlow = useMemo<BridgeDestinationFlow | null>(() => {
    if (selectedFlows.length === 0) {
      return null;
    }
    if (selectedFlows.length === 1) {
      return selectedFlows[0];
    }

    const totalVolume = selectedFlows.reduce((sum, flow) => sum + flow.volumeUsd, 0);
    const totalTxCount = selectedFlows.reduce((sum, flow) => sum + (flow.txCount ?? 0), 0);
    const totalTxPerMinute = selectedFlows.reduce((sum, flow) => sum + flow.txPerMinute, 0);
    const latencyWeightedSum = selectedFlows.reduce(
      (sum, flow) => sum + (flow.avgLatencyMs ?? 0) * (flow.txCount ?? 0),
      0,
    );
    const lastUpdated = selectedFlows.reduce((max, flow) => Math.max(max, flow.lastUpdated ?? 0), 0);
    const transactions = sortTransactions(selectedFlows.flatMap(flow => flow.transactions ?? []));

    const name = selectedDestination === "All"
      ? selectedProtocolId === "All"
        ? "All Destinations"
        : `${selectedProtocolId} · All Destinations`
      : selectedDestination;

    const color = selectedDestination !== "All"
      ? destinationColorMap.get(selectedDestination) ?? fallbackDestinationColor
      : fallbackDestinationColor;

    const avgLatencyMs = totalTxCount > 0 ? latencyWeightedSum / totalTxCount : selectedFlows[0]?.avgLatencyMs ?? 0;

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
  }, [selectedFlows, selectedDestination, selectedProtocolId, destinationColorMap]);

  const protocolChipData = useMemo(
    () =>
      protocolOptions.map(option => {
        if (option === "All") {
          return { label: "All Bridges", hue: "#38bdf8", value: "All", isActive: selectedProtocolId === "All" };
        }
        const protocol = bridgeProtocols.find(p => p.name === option)!;
        return {
          label: protocol.name,
          hue: protocol.hue,
          value: protocol.name,
          isActive: selectedProtocolId === protocol.name,
        };
      }),
    [protocolOptions, selectedProtocolId],
  );

  const destinationChipData = useMemo(
    () =>
      allDestinations.map(option => {
        if (option === "All") {
          return { label: "All L2", color: "#38bdf8", value: "All", isActive: selectedDestination === "All" };
        }
        return {
          label: option,
          color: destinationColorMap.get(option) ?? fallbackDestinationColor,
          value: option,
          isActive: selectedDestination === option,
        };
      }),
    [allDestinations, destinationColorMap, selectedDestination],
  );

  const { queuesRef, getFlowKey, TX_DURATION_MS } = useBridgeQueues({ bridgeSummaries, destinationColorMap });

  const activeBridgeLabel = selectedProtocolId === "All" ? "All Bridges" : selectedProtocolId;
  const activeTransactions = activeFlow?.transactions ?? [];

  const handleSelectFlow = (bridgeId: string, destination: string) => {
    onSelectProtocol(bridgeId);
    onSelectDestination(destination);
  };

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
          <BridgeCanvas
            bridgeSummaries={bridgeSummaries}
            selectedProtocolId={selectedProtocolId}
            selectedDestination={selectedDestination}
            onSelectFlow={handleSelectFlow}
            queuesRef={queuesRef}
            getFlowKey={getFlowKey}
            txDurationMs={TX_DURATION_MS}
          />
        </div>
      </div>

      {detailsOpen && (
          <BridgeDetailsPanel
            activeBridgeLabel={activeBridgeLabel}
            activeFlow={activeFlow}
            activeTransactions={activeTransactions}
            protocolChipData={protocolChipData}
            destinationChipData={destinationChipData}
            onSelectProtocol={onSelectProtocol}
            onSelectDestination={onSelectDestination}
            onCloseDetails={onCloseDetails}
        />
      )}
    </>
  );
};
