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

// Placeholder REST base (unused now that we read via GraphQL)
const API_BASE = "http://localhost:8000";

// GraphQL configuration (matches src/data/graphql.js)
const GRAPHQL_URL = (typeof process !== 'undefined' && process.env?.GRAPHQL_URL) || 'http://localhost:8080/v1/graphql';
const HASURA_ADMIN_SECRET = (typeof process !== 'undefined' && process.env?.HASURA_ADMIN_SECRET) || 'testing';

const fetchGraphQL = async (query: string, variables: Record<string, unknown>) => {
  const res = await fetch(GRAPHQL_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-hasura-admin-secret': HASURA_ADMIN_SECRET,
    },
    body: JSON.stringify({ query, variables }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`GraphQL HTTP ${res.status}: ${text}`);
  }
  const json = await res.json();
  if (json.errors) {
    throw new Error(`GraphQL errors: ${JSON.stringify(json.errors)}`);
  }
  return json.data as any;
};

// Not strictly required for the plan; keeping a lightweight fallback
export const fetchLatestBlockNumber = async (): Promise<number> => {
  // Attempt to read the latest observed deposit block across tables as a proxy
  const query = `
    query BlockHeight {
      chain_metadata {
        block_height
      }
    }
  `;
  try {
    const data = await fetchGraphQL(query, {});
    console.log(data);
    return data?.chain_metadata?.[0]?.block_height ?? 0;
  } catch {
    // Fallback for environments without the indexer running
    return 140_000_000;
  }
};

export const fetchBridgeTxsSince = async (fromBlock: number): Promise<BridgeApiResponse> => {
  console.log("fetching with ", fromBlock );
  // Query both native and ERC20 deposits since a given block (exclusive)
  const query = `
    query DepositsSince($fromBlock: Int!) {
      native: RelayDepository_RelayNativeDeposit(
        limit: 5
        where: { block_number: { _gt: $fromBlock } }
        order_by: { block_number: asc }
      ) {
        id
        block_number
        from
        amount
      }
      erc20: RelayDepository_RelayErc20Deposit(
        limit: 5
        where: { block_number: { _gt: $fromBlock } }
        order_by: { block_number: asc }
      ) {
        id
        block_number
        from
        amount
        token
      }
      chain_metadata {
        block_height
      }
    }
  `;

  const data = await fetchGraphQL(query, { fromBlock: String(fromBlock) });

  type NativeRow = { id: string; block_number: number; from: string; amount: string | number };
  type Erc20Row = { id: string; block_number: number; from: string; amount: string | number; token?: string | null };

  const now = Date.now();
  const nativeRows: NativeRow[] = data?.native ?? [];
  const erc20Rows: Erc20Row[] = data?.erc20 ?? [];

  const nativeTxs: BridgeTx[] = nativeRows.map((r) => ({
    id: r.id,
    chainID: 10, // Optimism as destination per plan focus
    blockNumber: Number(r.block_number),
    amount: typeof r.amount === 'string' ? Number(r.amount) : (r.amount ?? 0),
    token: 'ETH',
    from: 'Relay',
    timestamp: now,
  }));

  const erc20Txs: BridgeTx[] = erc20Rows.map((r) => ({
    id: r.id,
    chainID: 10, // Optimism
    blockNumber: Number(r.block_number),
    amount: typeof r.amount === 'string' ? Number(r.amount) : (r.amount ?? 0),
    // If the indexer returns a symbol, use it; otherwise default to USDC for visualization
    token: (r.token && r.token.length <= 10) ? (r.token as string) : 'USDC',
    from: 'Relay',
    timestamp: now,
  }));

  const txs = [...nativeTxs, ...erc20Txs].sort((a, b) => a.blockNumber - b.blockNumber);
  const latestBlock = txs.length > 0 ? txs[txs.length - 1].blockNumber : fromBlock;

  return {
    blockNumber: data?.chain_metadata?.[0].block_height,
    chainID: 10,
    transactions: txs,
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
