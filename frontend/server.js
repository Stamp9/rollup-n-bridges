// Minimal server to serve an htmx page and an HTML fragment endpoint
// that proxies the local Envio/Hasura GraphQL at http://localhost:8080/v1/graphql

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;
const GRAPHQL_URL = process.env.GRAPHQL_URL || 'http://localhost:8080/v1/graphql';
const HASURA_ADMIN_SECRET = process.env.HASURA_ADMIN_SECRET || 'testing';
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

async function fetchLatestNativeDeposits(limit = 10) {
  const query = `
    query LatestNativeDeposits($limit: Int!) {
      RelayDepository_RelayNativeDeposit(limit: $limit, order_by: {id: desc}) {
        id
        from
        amount
        event_id
      }
    }
  `;

  const res = await fetch(GRAPHQL_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-hasura-admin-secret': HASURA_ADMIN_SECRET,
    },
    body: JSON.stringify({ query, variables: { limit } }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`GraphQL HTTP ${res.status}: ${text}`);
  }
  const json = await res.json();
  if (json.errors) {
    throw new Error(`GraphQL errors: ${JSON.stringify(json.errors)}`);
  }
  return json.data?.RelayDepository_RelayNativeDeposit ?? [];
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
          const latest = await fetchLatestNativeDeposits(10);
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
        const windowItems = await fetchLatestNativeDeposits(windowLimit);
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
  console.log(`Using GraphQL at ${GRAPHQL_URL}`);
});
