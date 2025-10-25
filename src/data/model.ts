export type NodeType = "L1" | "Bridge" | "L2";

export interface GraphNode {
  id: string;
  type: NodeType;
  x: number;
  y: number;
}

export interface TokenFlow {
  symbol: string;
  tokenAddress?: string;
  volumeUsd: number;
  txPerMinute: number;
  avgLatencyMs: number;
  txCount?: number;
  rawAmount?: string;
  lastUpdated?: number;
}

import type { BridgeTx } from "./api";

export interface Link {
  id: string;
  source: string;
  target: string;
  blockNumber: number;
  tokens: TokenFlow[];
  lastUpdated: number;
  transactions?: BridgeTx[];
}

export interface LinkTemplate {
  id: string;
  source: string;
  target: string;
  tokens: string[];
  baselineVolumeUsd: number; // total baseline across all tokens
  tokenMix?: Record<string, number>;
}

export interface Layer2Destination {
  name: string;
  color: string;
  baseShare: number;
}

export interface Layer2Flow {
  name: string;
  color: string;
  volumeUsd: number;
  txPerMinute: number;
  avgLatencyMs: number;
  txCount: number;
  lastUpdated: number;
}

export const tokenColors: Record<string, string> = {
  USDC: "#ffd166",
  USDT: "#06d6a0",
  ETH: "#f97316",
};

export const tokenMetadata: Record<
  string,
  { decimals: number; coingeckoId: string }
> = {
  USDC: { decimals: 6, coingeckoId: "usd-coin" },
  USDT: { decimals: 6, coingeckoId: "tether" },
  ETH: { decimals: 18, coingeckoId: "ethereum" },
};

export const nodes: GraphNode[] = [
  { id: "Ethereum", type: "L1", x: 100, y: 300 },
  { id: "Relay", type: "Bridge", x: 360, y: 200 },
  // { id: "Across", type: "Bridge", x: 360, y: 360 },
  // { id: "Mayan", type: "Bridge", x: 360, y: 520 },
  { id: "Arbitrum", type: "L2", x: 720, y: 180 },
  { id: "Base", type: "L2", x: 720, y: 300 },
  { id: "Optimism", type: "L2", x: 720, y: 400 },
  { id: "zkSync", type: "L2", x: 720, y: 520 },
];

export const linkTemplates: LinkTemplate[] = [
  {
    id: "ethereum-relay",
    source: "Ethereum",
    target: "Relay",
    tokens: ["USDC", "USDT", "ETH"],
    baselineVolumeUsd: 72_000_000,
    tokenMix: { USDC: 0.45, USDT: 0.35, ETH: 0.2 },
  },
  {
    id: "ethereum-across",
    source: "Ethereum",
    target: "Across",
    tokens: ["USDC", "USDT", "ETH"],
    baselineVolumeUsd: 58_000_000,
    tokenMix: { USDC: 0.4, USDT: 0.4, ETH: 0.2 },
  },
  {
    id: "relay-arbitrum",
    source: "Relay",
    target: "Arbitrum",
    tokens: ["USDC", "USDT", "ETH"],
    baselineVolumeUsd: 64_000_000,
    tokenMix: { USDC: 0.5, USDT: 0.3, ETH: 0.2 },
  },
  {
    id: "relay-base",
    source: "Relay",
    target: "Base",
    tokens: ["USDC", "USDT", "ETH"],
    baselineVolumeUsd: 39_000_000,
    tokenMix: { USDC: 0.45, USDT: 0.35, ETH: 0.2 },
  },
  {
    id: "relay-optimism",
    source: "Relay",
    target: "Optimism",
    tokens: ["USDC", "USDT", "ETH"],
    baselineVolumeUsd: 46_000_000,
    tokenMix: { USDC: 0.47, USDT: 0.33, ETH: 0.2 },
  },
  {
    id: "relay-zksync",
    source: "Relay",
    target: "zkSync",
    tokens: ["USDC", "USDT", "ETH"],
    baselineVolumeUsd: 22_000_000,
    tokenMix: { USDC: 0.4, USDT: 0.35, ETH: 0.25 },
  },
  {
    id: "across-arbitrum",
    source: "Across",
    target: "Arbitrum",
    tokens: ["USDC", "USDT", "ETH"],
    baselineVolumeUsd: 44_000_000,
    tokenMix: { USDC: 0.45, USDT: 0.35, ETH: 0.2 },
  },
  {
    id: "across-base",
    source: "Across",
    target: "Base",
    tokens: ["USDC", "USDT", "ETH"],
    baselineVolumeUsd: 31_000_000,
    tokenMix: { USDC: 0.4, USDT: 0.35, ETH: 0.25 },
  },
  {
    id: "across-optimism",
    source: "Across",
    target: "Optimism",
    tokens: ["USDC", "USDT", "ETH"],
    baselineVolumeUsd: 36_000_000,
    tokenMix: { USDC: 0.43, USDT: 0.35, ETH: 0.22 },
  },
  {
    id: "across-zksync",
    source: "Across",
    target: "zkSync",
    tokens: ["USDC", "USDT", "ETH"],
    baselineVolumeUsd: 19_000_000,
    tokenMix: { USDC: 0.35, USDT: 0.4, ETH: 0.25 },
  },
  {
    id: "ethereum-mayan",
    source: "Ethereum",
    target: "Mayan",
    tokens: ["USDC", "USDT", "ETH"],
    baselineVolumeUsd: 40_000_000,
    tokenMix: { USDC: 0.4, USDT: 0.35, ETH: 0.25 },
  },
  {
    id: "mayan-arbitrum",
    source: "Mayan",
    target: "Arbitrum",
    tokens: ["USDC", "USDT", "ETH"],
    baselineVolumeUsd: 32_000_000,
    tokenMix: { USDC: 0.45, USDT: 0.35, ETH: 0.2 },
  },
  {
    id: "mayan-base",
    source: "Mayan",
    target: "Base",
    tokens: ["USDC", "USDT", "ETH"],
    baselineVolumeUsd: 24_000_000,
    tokenMix: { USDC: 0.42, USDT: 0.33, ETH: 0.25 },
  },
  {
    id: "mayan-optimism",
    source: "Mayan",
    target: "Optimism",
    tokens: ["USDC", "USDT", "ETH"],
    baselineVolumeUsd: 28_000_000,
    tokenMix: { USDC: 0.4, USDT: 0.35, ETH: 0.25 },
  },
  {
    id: "mayan-zksync",
    source: "Mayan",
    target: "zkSync",
    tokens: ["USDC", "USDT", "ETH"],
    baselineVolumeUsd: 18_000_000,
    tokenMix: { USDC: 0.35, USDT: 0.4, ETH: 0.25 },
  },
];

export const layer2Destinations: Layer2Destination[] = [
  { name: "Base", color: "#3a86ff", baseShare: 0.28 },
  { name: "Arbitrum", color: "#ff006e", baseShare: 0.34 },
  { name: "Optimism", color: "#fb5607", baseShare: 0.24 },
  { name: "zkSync", color: "#8338ec", baseShare: 0.14 },
];
