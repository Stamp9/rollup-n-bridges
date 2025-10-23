// src/hooks/useRelay24hAutoRefresh.ts
import { useEffect, useState } from "react";
import { useQuery } from "@apollo/client/react";



import {
  RELAY_LATEST_BLOCK,
  RELAY_NATIVE_24,
  RELAY_ERC20_24,
} from "../data/subscriptions_24";

interface ChainMeta {
  chain_id: number;
  block_height: number;
}
interface LatestBlocksData {
  chain_metadata: ChainMeta[];
}

const CHAINS = [
  { name: "Ethereum", id: 1, avgBlockTime: 12 },
  { name: "Optimism", id: 10, avgBlockTime: 2 },
  { name: "Base", id: 8453, avgBlockTime: 2 },
  { name: "Arbitrum", id: 42161, avgBlockTime: 0.25 },
];

export function useRelay24hAutoRefresh() {
  const { data: metaData } = useQuery<LatestBlocksData>(RELAY_LATEST_BLOCK);
  const [counts, setCounts] = useState<{ perChain: any[]; total: number }>({
    perChain: [],
    total: 0,
  });


  

  async function fetchCount(queryText:string, chainId: number, minBlock: number): Promise<number> {
    try {
      const res = await fetch("http://localhost:8080/v1/graphql", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-hasura-admin-secret": "testing",
        },
        body: JSON.stringify({
          query: queryText,
          variables: { chainId, minBlock },
        }),
      });

      

      if (!res.ok) {
        console.error(`[fetchCount] HTTP ${res.status} ${res.statusText}`);
        return 0;
      }
      

      const json = await res.json();
      // console.log("Fetch Count Raw Response:", json);



      if (!json || !json.data) {
        console.error("[fetchCount] Empty response:", json);
        return 0;
      }
      if (json.errors) {
        console.error("[fetchCount] GraphQL errors:", json.errors);
        return 0;
      }
      const key = Object.keys(json.data)[0];
      // console.log("Fetch Count Response:", json);

      const count = json.data?.[key]?.aggregate?.count ?? 0;

      // console.log(`[fetchCount] chain ${chainId} → ${count} (minBlock=${minBlock})`);
      return count;
    } catch (err) {
      console.error("[fetchCount Exception]", err);
      return 0;
    }

  }

  async function refresh24hCounts() {
    if (!metaData?.chain_metadata) return;
    

    const latest: Record<number, number> = Object.fromEntries(
      metaData.chain_metadata.map((m) => [m.chain_id, m.block_height]),
    );
    console.log("[latest blocks]", latest);

    const minBlock: Record<number, number> = {};
    CHAINS.forEach((c) => {
      const blocks24h = Math.floor((24 * 3600) / c.avgBlockTime);
      minBlock[c.id] = (latest[c.id] ?? 0) - blocks24h;
    });
    console.log("[minBlock computed]", minBlock);

    const perChain = await Promise.all(
      CHAINS.map(async (c) => {
        const [erc20Count, nativeCount] = await Promise.all([
          fetchCount(RELAY_ERC20_24, c.id, minBlock[c.id]),
          fetchCount(RELAY_NATIVE_24, c.id, minBlock[c.id]),
        ]);
        console.log(`[chain ${c.name}] ERC20=${erc20Count}, Native=${nativeCount}`);
        return { ...c, count: erc20Count + nativeCount };
      }),
    );

    const total = perChain.reduce((s, x) => s + x.count, 0);
    // console.log("[24h updated]", perChain);
    setCounts({ perChain, total });
  }

  // refresh every 20 seconds
  useEffect(() => {
    refresh24hCounts(); // initial load
    const t = setInterval(refresh24hCounts, 20_000);
    return () => clearInterval(t);
  }, [metaData]);

  return counts;
}
