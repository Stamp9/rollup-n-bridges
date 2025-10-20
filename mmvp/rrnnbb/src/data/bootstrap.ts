import { fetchLatestBlockNumber } from './api';

// Prefetch the latest block at module load using top-level await.
// Falls back to a safe default if the indexer is unavailable.
export const initialLatestBlockNumber: number = await (async () => {
  try {
    const n = await fetchLatestBlockNumber();
    return Number.isFinite(n) && n > 0 ? n : 140_000_000;
  } catch {
    return 140_000_000;
  }
})();

