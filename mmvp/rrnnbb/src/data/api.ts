export interface BridgeTx {
  id: string;
  chainID: number;
  blockNumber: number;
  amount: number;
  token: string;
  from: string;
  timestamp: number;
}

export interface BridgeApiResponse {
  blockNumber: number;
  chainID: number;
  transactions: BridgeTx[];
}

const API_BASE = "http://localhost:8000";

export const fetchLatestBlockNumber = async (): Promise<number> => {
  const res = await fetch(`${API_BASE}/blockNumber`);
  if (!res.ok) {
    throw new Error(`Failed to fetch latest block number: ${res.status}`);
  }
  const data = await res.json();
  return data.blockNumber ?? data.block_number ?? 0;
};

export const fetchBridgeTxsSince = async (fromBlock: number): Promise<BridgeApiResponse> => {
  const res = await fetch(`${API_BASE}/bridgeTxs?fromBlock=${fromBlock}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch bridge transactions: ${res.status}`);
  }
  const data = await res.json();
  return {
    blockNumber: data.blockNumber ?? data.block_number ?? fromBlock,
    chainID: data.chainID ?? data.chain_id ?? 0,
    transactions: data.transactions ?? [],
  };
};

export const tokenPriceUsd: Record<string, number> = {
  USDC: 1,
  USDT: 1,
  ETH: 3_400,
};

export const mapTxToVolume = (tx: BridgeTx): number => {
  const price = tokenPriceUsd[tx.token] ?? 1;
  return tx.amount * price;
};
