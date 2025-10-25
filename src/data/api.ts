export interface BridgeTx {
  id: string;
  chainID: number;
  blockNumber: number;
  destinationBlockNumber?: number;
  amount: number;
  token: string;
  from: string;
  timestamp: number;
}

export interface BridgeApiResponse {
  blockNumbers: any;
  transactions: BridgeTx[];
}

type EnvRecord = Record<string, string | undefined>;

const getProcessEnv = (): EnvRecord => {
  if (typeof globalThis !== "object") {
    return {};
  }
  const possibleProcess = (globalThis as { process?: { env?: EnvRecord } })
    .process;
  return possibleProcess?.env ?? {};
};

const maybeProcessEnv = getProcessEnv();

const getMetaEnv = (): EnvRecord => {
  const meta = (import.meta as ImportMeta | undefined)?.env;
  return (meta as EnvRecord) ?? {};
};

const metaEnv = getMetaEnv();

// GraphQL configuration (matches src/data/graphql.js)
const GRAPHQL_URL =
  metaEnv?.VITE_GRAPHQL_URL ??
  maybeProcessEnv?.GRAPHQL_URL ??
  "http://localhost:8080/v1/graphql";

const HASURA_ADMIN_SECRET =
  metaEnv?.VITE_HASURA_ADMIN_SECRET ??
  maybeProcessEnv?.HASURA_ADMIN_SECRET ??
  "testing";

const fetchGraphQL = async <TData>(
  query: string,
  variables: Record<string, unknown>,
): Promise<TData> => {
  const res = await fetch(GRAPHQL_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-hasura-admin-secret": HASURA_ADMIN_SECRET,
    },
    body: JSON.stringify({ query, variables }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`GraphQL HTTP ${res.status}: ${text}`);
  }
  const json = await res.json();
  if (json.errors) {
    throw new Error(`GraphQL errors: ${JSON.stringify(json.errors)}`);
  }
  return json.data as TData;
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
    const data = await fetchGraphQL<{
      chain_metadata: { block_height: number }[];
    }>(query, {});
    return data?.chain_metadata?.[0]?.block_height ?? 0;
  } catch {
    // Fallback for environments without the indexer running
    return 140_000_000;
  }
};

export const fetchBlockHeights = async (
): Promise<any> => {
  // Query both native and ERC20 deposits since a given block (exclusive)
  const query = `
    query BlockHeights {
      chain_metadata(order_by: {chain_id: asc}) {
        block_height
        chain_id
      }
    }
  `;

  const data = await fetchGraphQL(query, {});

  let fromBlockEth = 0;
  let fromBlockOP = 0;
  let fromBlockBase = 0;
  data?.chain_metadata.forEach(md => {
    if (md.chain_id === 1) {
      fromBlockEth = md.block_height;
    } else if (md.chain_id === 10) {
      fromBlockOP = md.block_height;
    } else if (md.chain_id === 8453) {
      fromBlockBase = md.block_height;
    }
  });

  return {
    fromBlockEth,
    fromBlockOP,
    fromBlockBase,
  };
}

export const subscribeBridgeTxsSync = async (fromBlockOP: number): Promise<any> => {
  const query = `
    subscription {
      native: RelayDepository_RelayNativeDeposit(limit: 10, order_by: {block_number: desc}, where: {block_number: {_gt: $fromBlockOP}}) {
        id
        chain_id
        block_number
        from
        amount
      }
    }
`;
}

export const fetchBridgeTxsSince = async (
  fromBlockEth: number,
  fromBlockOP: number,
  fromBlockBase: number,
): Promise<BridgeApiResponse> => {
  // console.log(`fetching with heights\n${fromBlockEth}\n${fromBlockOP}\n${fromBlockBase}\n`);
  // Query both native and ERC20 deposits since a given block (exclusive)
  const query = `
    query DepositsSince($fromBlockEth: Int!, $fromBlockOP: Int!, $fromBlockBase: Int!) {
      native: RelayDepository_RelayNativeDeposit(
        limit: 10,
        where: {
          _or: [
            {_and: {block_number: {_gt: $fromBlockEth}, chain_id: { _eq: 1}}},
            {_and: {block_number: {_gt: $fromBlockOP}, chain_id: { _eq: 10}}},
            {_and: {block_number: {_gt: $fromBlockBase}, chain_id: { _eq: 8453}}}
          ]
        }) {
        id
        chain_id
        block_number
        from
        amount
      }
      erc20: RelayDepository_RelayErc20Deposit(
        limit: 10,
        where: {
          _or: [
            {_and: {block_number: {_gt: $fromBlockEth}, chain_id: { _eq: 1}}},
            {_and: {block_number: {_gt: $fromBlockOP}, chain_id: { _eq: 10}}},
            {_and: {block_number: {_gt: $fromBlockBase}, chain_id: { _eq: 8453}}}
          ]
        }
      ) {
        id
        chain_id
        block_number
        from
        amount
        token
      }
      chain_metadata(order_by: { chain_id: asc }) {
        block_height
      }
    }
  `;

  interface DepositsSinceResult {
    native: NativeRow[];
    erc20: Erc20Row[];
    chain_metadata: { block_height: number }[];
  }

  const data = await fetchGraphQL<DepositsSinceResult>(query, {
    fromBlockEth: String(23627835),
    fromBlockOP: String(142737000),
    fromBlockBase: String(37141700),
  });

  type NativeRow = {
    id: string;
    chain_id?: number | null;
    block_number: number;
    from: string;
    amount: string | number;
  };
  type Erc20Row = {
    id: string;
    chain_id?: number | null;
    block_number: number;
    from: string;
    amount: string | number;
    token?: string | null;
  };

  const now = Date.now();
  const nativeRows: NativeRow[] = data?.native ?? [];
  const erc20Rows: Erc20Row[] = data?.erc20 ?? [];

  const nativeTxs: BridgeTx[] = nativeRows.map((r) => {
    const destinationBlockNumber = Number(r.block_number);
    return {
      id: r.id,
      chainID: r.chain_id,
      blockNumber: Number(r.block_number),
      destinationBlockNumber,
      amount: typeof r.amount === "string" ? Number(r.amount) : (r.amount ?? 0),
      token: "ETH",
      from: "Relay",
      timestamp: now,
    };
  });

  const erc20Txs: BridgeTx[] = erc20Rows.map((r) => {
    const chainID = Number(r.chain_id ?? 0) || 1;
    const destinationChainID = chainID === 1 ? 10 : chainID;
    const destinationBlockNumber = Number(r.block_number);
    return {
      id: r.id,
      chainID: r.chain_id,
      blockNumber: Number(r.block_number),
      destinationBlockNumber,
      amount: typeof r.amount === "string" ? Number(r.amount) : (r.amount ?? 0),
      // If the indexer returns a symbol, use it; otherwise default to USDC for visualization
      token: r.token && r.token.length <= 10 ? (r.token as string) : "USDC",
      from: "Relay",
      timestamp: now,
    };
  });

  const txs = [...nativeTxs, ...erc20Txs].sort(
    (a, b) => a.blockNumber - b.blockNumber,
  );
  const latestBlock =
    txs.length > 0 ? txs[txs.length - 1].blockNumber : fromBlock;
  const bridgeBlock = data?.chain_metadata?.[0]?.block_height ?? latestBlock;
  data?.chain_metadata.forEach(md => {
    if (md.chain_id === 1) {
      fromBlockEth = md.block_height;
    } else if (md.chain_id === 10) {
      fromBlockOP = md.block_height;
    } else if (md.chain_id === 8453) {
      fromBlockBase = md.block_height;
    }
  });



  return {
    blockNumbers: {
      fromBlockEth,
      fromBlockOP,
      fromBlockBase,
    },
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
