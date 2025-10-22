import { fetchBlockHeights } from "./api";

// Prefetch the latest block at module load using top-level await.
// Falls back to a safe default if the indexer is unavailable.
export const initialBlockHeights: number = await (async () => {
  try {
    return await fetchBlockHeights();
  } catch {
    return 140_000_000;
  }
})();
