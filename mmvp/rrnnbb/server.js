import http from "node:http";
import { URL } from "node:url";

const PORT = process.env.PORT ? Number(process.env.PORT) : 8000;

let currentBlockNumber = 20_000_000;

const CHAINS = [
  { chainID: 1, destination: "Ethereum" },
  { chainID: 10, destination: "Optimism" },
  { chainID: 42161, destination: "Arbitrum" },
  { chainID: 8453, destination: "Base" },
  { chainID: 324, destination: "zkSync" },
];

const PROTOCOLS = ["Relay", "Mayan", "Across"];
const TOKENS = ["USDC", "USDT", "ETH"];

const TOKEN_BASE_AMOUNTS = {
  USDC: 250_000,
  USDT: 220_000,
  ETH: 35,
};

const randomItem = array => array[Math.floor(Math.random() * array.length)];

const generateTransactions = blockNumber => {
  const now = Date.now();
  const destinations = CHAINS.filter(chain => chain.chainID !== 1).map(chain => chain.chainID);

  return destinations.map((chainID, idx) => {
    const token = TOKENS[idx % TOKENS.length];
    const amountBase = TOKEN_BASE_AMOUNTS[token] ?? 100_000;
    const amount = amountBase * (0.8 + Math.random() * 0.4);
    const from = randomItem(PROTOCOLS);
    return {
      id: `${blockNumber}-${idx}-${Math.random().toString(16).slice(2, 10)}`,
      chainID,
      blockNumber,
      amount,
      token,
      from,
      timestamp: now - idx * 200,
    };
  });
};

const sendJson = (res, statusCode, payload) => {
  const body = JSON.stringify(payload);
  res.writeHead(statusCode, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  });
  res.end(body);
};

const server = http.createServer((req, res) => {
  if (!req.url) {
    sendJson(res, 400, { error: "Invalid request" });
    return;
  }

  const url = new URL(req.url, `http://localhost:${PORT}`);

  if (req.method === "OPTIONS") {
    sendJson(res, 204, {});
    return;
  }

  if (req.method !== "GET") {
    sendJson(res, 405, { error: "Method Not Allowed" });
    return;
  }

  if (url.pathname === "/blockNumber") {
    sendJson(res, 200, { blockNumber: currentBlockNumber });
    return;
  }

  if (url.pathname === "/bridgeTxs") {
    const fromBlockParam = url.searchParams.get("fromBlock");
    const fromBlock = fromBlockParam ? Number(fromBlockParam) : currentBlockNumber;

    if (!Number.isFinite(fromBlock)) {
      sendJson(res, 400, { error: "Invalid fromBlock parameter" });
      return;
    }

    currentBlockNumber = Math.max(currentBlockNumber, fromBlock) + 1;
    const transactions = generateTransactions(currentBlockNumber);

    sendJson(res, 200, {
      blockNumber: currentBlockNumber,
      chainID: 0,
      transactions,
    });
    return;
  }

  sendJson(res, 404, { error: "Not Found" });
});

server.listen(PORT, () => {
  console.log(`Mock bridge API listening on http://localhost:${PORT}`);
});
