import { layer2Destinations } from "../data/model";

export const islandNode = { id: "Island", type: "L1" as const, x: 220, y: 320 };

export const bridgeProtocols = [
  { name: "Relay", hue: "#38bdf8", node: { id: "Relay", type: "Bridge" as const, x: 560, y: 320 } },
  { name: "Across", hue: "#a855f7", node: { id: "Across", type: "Bridge" as const, x: 540, y: 120 } },
  { name: "Mayan", hue: "#f97316", node: { id: "Mayan", type: "Bridge" as const, x: 540, y: 500 } },
] as const;

export const svgWidth = 900;
export const svgHeight = 620;

export const SIDE_PANEL_OPEN_WIDTH = 260;
export const FLOW_END_OFFSET = 30;

export const fallbackDestinationColor = "#64748b";

export const baseDestinationColorMap = new Map(layer2Destinations.map(dest => [dest.name, dest.color]));

export const blockExplorerByChain: Record<number, { buildUrl: (blockNumber: number) => string; label: string }> = {
  1: {
    buildUrl: blockNumber => `https://etherscan.io/block/${blockNumber}`,
    label: "View on Etherscan",
  },
  10: {
    buildUrl: blockNumber => `https://explorer.optimism.io/block/${blockNumber}`,
    label: "View on Optimism Explorer",
  },
  8453: {
    buildUrl: blockNumber => `https://base.blockscout.com/block/${blockNumber}`,
    label: "View on Blockscout",
  },
};

export const defaultBlockExplorer = blockExplorerByChain[1];

export const hexToRgba = (hex: string, alpha: number) => {
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
