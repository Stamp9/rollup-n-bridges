// Minimal server to serve an htmx page and an HTML fragment endpoint
// that proxies the local Envio/Hasura GraphQL at http://localhost:8080/v1/graphql

const http = require('http');
const fs = require('fs');
const path = require('path');

const graphql = require('./graphql.js');

const fetchLatestNativeDeposits = graphql.fetchLatestNativeDeposits;

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;
const OPTIMISM_RPC_URL = process.env.OPTIMISM_RPC_URL || 'https://mainnet.optimism.io';

const indexPath = path.join(__dirname, 'index.html');

// Track the last block number we queried up to.
let lastQueriedBlock = 0;

/** Renders a table body with rows for each deposit */
function renderDepositsRows(deposits) {
  if (!deposits || deposits.length === 0) {
    return '<tr><td colspan="4">No deposits found.</td></tr>';
  }
  return deposits.map((d) => {
    const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
    return `
      <tr>
        <td><code>${esc(d.id)}</code></td>
        <td><code>${esc(d.from)}</code></td>
        <td>${esc(d.amount)}</td>
        <td><code>${esc(d.event_id)}</code></td>
      </tr>
    `;
  }).join('');
}

function parseBlockFromId(id) {
  try {
    const parts = String(id).split('_');
    if (parts.length >= 3) return Number(parts[1]);
  } catch (_) {}
  return NaN;
}

async function getOptimismHead() {
  const res = await fetch(OPTIMISM_RPC_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'eth_blockNumber', params: [] }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`OP RPC HTTP ${res.status}: ${text}`);
  }
  const json = await res.json();
  if (json.error) throw new Error(`OP RPC error: ${JSON.stringify(json.error)}`);
  return Number.parseInt(json.result, 16);
}

const server = http.createServer(async (req, res) => {
  try {
    if (req.method === 'GET' && (req.url === '/' || req.url === '/index.html')) {
      const html = fs.readFileSync(indexPath);
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(html);
      return;
    }

    if (req.method === 'GET' && req.url === '/deposits') {
      try {
        let headBlock = 0;
        try {
          headBlock = await getOptimismHead();
        } catch (_) {
          headBlock = 0;
        }

        if (lastQueriedBlock === 0) {
          const json = await graphql.fetchErc20Deposits(10);
          const latest = json.data?.RelayDepository_RelayNativeDeposit ?? [];
          const maxFromData = latest
            .map((d) => parseBlockFromId(d.id))
            .filter((n) => Number.isFinite(n))
            .reduce((a, b) => Math.max(a, b), 0);
          lastQueriedBlock = Math.max(maxFromData, headBlock || 0);
          const rows = renderDepositsRows(latest);
          res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
          res.end(rows);
          return;
        }

        const windowLimit = 100;
        const json = await graphql.fetchLatestNativeDeposits(windowLimit);
        const windowItems = json.data?.RelayDepository_RelayNativeDeposit ?? [];
        const rangeStart = lastQueriedBlock;
        const rangeEnd = headBlock || rangeStart;
        const inRange = windowItems.filter((d) => {
          const bn = parseBlockFromId(d.id);
          return Number.isFinite(bn) && bn > rangeStart && bn <= rangeEnd;
        });

        if (headBlock) lastQueriedBlock = headBlock;

        const latestForDisplay = windowItems.slice(0, 10);
        const rows = renderDepositsRows(latestForDisplay);
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(rows);
      } catch (e) {
        res.writeHead(500, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(`<tr><td colspan=\"4\">Failed to load deposits: ${String(e.message || e)}</td></tr>`);
      }
      return;
    }

    // 404 fallback
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Not Found');
  } catch (e) {
    res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Internal Server Error');
  }
});

server.listen(PORT, () => {
  console.log(`Frontend listening on http://localhost:${PORT}`);
  console.log(`Using GraphQL at ${graphql.GRAPHQL_URL}`);
});
