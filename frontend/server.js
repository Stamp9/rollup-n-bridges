// Minimal static file server (no deps) to avoid file:// CORS issues
// Usage: node frontend/server.js
const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

const root = __dirname;
const port = process.env.PORT || 5173;

const mime = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
};

function sendHtml(res, status, html) {
  res.writeHead(status, {
    'content-type': 'text/html; charset=utf-8',
    'cache-control': 'no-store, max-age=0, must-revalidate',
    'pragma': 'no-cache'
  });
  res.end(html);
}

function sendJson(res, status, obj) {
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store, max-age=0, must-revalidate',
    'pragma': 'no-cache'
  });
  res.end(JSON.stringify(obj));
}

function postGraphQL(endpoint, headers, body) {
  return new Promise((resolve, reject) => {
    const url = new URL(endpoint);
    const isHttps = url.protocol === 'https:';
    const opts = {
      method: 'POST',
      hostname: url.hostname,
      port: url.port || (isHttps ? 443 : 80),
      path: url.pathname + (url.search || ''),
      headers: {
        'content-type': 'application/json',
        ...headers,
      },
    };
    const mod = isHttps ? https : http;
    const req = mod.request(opts, (resp) => {
      let data = '';
      resp.on('data', (d) => (data += d));
      resp.on('end', () => {
        try {
          const json = JSON.parse(data || '{}');
          resolve({ status: resp.statusCode, json });
        } catch (e) {
          reject(e);
        }
      });
    });
    req.on('error', reject);
    req.write(JSON.stringify(body));
    req.end();
  });
}

async function handleDeposits(urlObj, res) {
  const endpoint = urlObj.searchParams.get('endpoint') || 'http://localhost:8080/v1/graphql';
  const authKey = urlObj.searchParams.get('auth-key') || 'x-hasura-admin-secret';
  const authVal = urlObj.searchParams.get('auth-val') || 'testing';
  const latestBlockOnly = ['1', 'true', 'yes'].includes((urlObj.searchParams.get('latestBlock') || '').toLowerCase());
  const fetchLimit = Math.max(10, Math.min(200, parseInt(urlObj.searchParams.get('limit') || '50', 10) || 50));
  const sort = (urlObj.searchParams.get('sort') || '').toLowerCase();
  const dir = (urlObj.searchParams.get('dir') || 'desc').toLowerCase();

  const headers = {};
  if (authKey && authVal) headers[authKey] = authVal;

  const fields = 'id from to l1Token l2Token amount';
  const limitVar = { limit: fetchLimit };
  const queries = [
    { q: `query($limit:Int!){ L2StandardBridge_DepositFinalized(limit:$limit, order_by:{id:desc}){ ${fields} } }`, path: 'L2StandardBridge_DepositFinalized' },
  ];

  let items = [];
  let lastError;
  for (const { q, path } of queries) {
    try {
      const resp = await postGraphQL(endpoint, headers, { query: q, variables: limitVar });
      const data = resp.json && resp.json.data;
      if (resp.status === 200 && data && Array.isArray(data[path])) {
        items = data[path];
        break;
      }
      if (resp.json && resp.json.errors) lastError = resp.json.errors.map(e => e.message).join('; ');
    } catch (e) {
      lastError = e.message;
    }
  }

  if (!items.length && lastError) {
    sendHtml(res, 200, `<tr><td colspan="6" class="small">Failed to load deposits: ${escapeHtml(lastError)}</td></tr>`);
    return;
  }

  if (latestBlockOnly && items.length > 0) {
    // Extract block number from id: `${chainId}_${blockNumber}_{logIndex}`
    const blocks = items.map(it => {
      const parts = String(it.id).split('_');
      return parts.length >= 3 ? parseInt(parts[1], 10) : NaN;
    }).filter(n => Number.isFinite(n));
    if (blocks.length) {
      const maxBlock = Math.max(...blocks);
      items = items.filter(it => {
        const parts = String(it.id).split('_');
        const bn = parts.length >= 3 ? parseInt(parts[1], 10) : NaN;
        return bn === maxBlock;
      });
    }
  }

  // Parse block number from id: chain_block_logIndex
  const parsed = items.map(it => {
    const parts = String(it.id).split('_');
    const blockNumber = parts.length >= 3 ? parseInt(parts[1], 10) : NaN;
    return { ...it, __blockNumber: Number.isFinite(blockNumber) ? blockNumber : null };
  });

  // Optional sorting
  let toRender = parsed;
  if (sort === 'block') {
    toRender = parsed.slice().sort((a, b) => {
      const av = a.__blockNumber ?? -Infinity;
      const bv = b.__blockNumber ?? -Infinity;
      return dir === 'asc' ? av - bv : bv - av;
    });
  }

  const rows = toRender.map((it) => `
    <tr>
      <td class="mono">${escapeHtml(it.id)}</td>
      <td class="mono">${escapeHtml(it.from)}</td>
      <td class="mono">${escapeHtml(it.to)}</td>
      <td class="mono">${escapeHtml(it.l1Token || '')}</td>
      <td class="mono">${escapeHtml(it.l2Token || '')}</td>
      <td>${escapeHtml(String(it.amount))}</td>
      <td class="mono">${it.__blockNumber != null ? escapeHtml(it.__blockNumber) : ''}</td>
    </tr>
  `).join('');

  sendHtml(res, 200, rows || '<tr><td colspan="7" class="small">No deposits found.</td></tr>');
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

const server = http.createServer((req, res) => {
  const urlObj = new URL(req.url, `http://localhost:${port}`);
  const urlPath = decodeURIComponent(urlObj.pathname);

  if (urlPath === '/deposits') {
    handleDeposits(urlObj, res);
    return;
  }

  if (urlPath === '/deposits-summary') {
    handleDepositsSummary(urlObj, res);
    return;
  }

  let filePath = path.join(root, urlPath);
  if (urlPath === '/' || !path.extname(urlPath)) {
    filePath = path.join(root, 'index.html');
  }
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
      res.end('Not found');
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { 'content-type': mime[ext] || 'application/octet-stream' });
    res.end(data);
  });
});

async function handleDepositsSummary(urlObj, res) {
  const endpoint = urlObj.searchParams.get('endpoint') || 'http://localhost:8080/v1/graphql';
  const authKey = urlObj.searchParams.get('auth-key') || 'x-hasura-admin-secret';
  const authVal = urlObj.searchParams.get('auth-val') || 'testing';
  const fetchLimit = Math.max(10, Math.min(500, parseInt(urlObj.searchParams.get('limit') || '100', 10) || 100));
  const format = (urlObj.searchParams.get('format') || 'html').toLowerCase();

  const headers = {};
  if (authKey && authVal) headers[authKey] = authVal;

  const fields = 'id from to l1Token l2Token amount';
  const queries = [
    { q: `query($limit:Int!){ L2StandardBridge_DepositFinalized(limit:$limit, order_by:{id:desc}){ ${fields} } }`, path: 'L2StandardBridge_DepositFinalized' },
    { q: `query($limit:Int!){ L2StandardBridge_DepositFinalizeds(limit:$limit, order_by:{id:desc}){ ${fields} } }`, path: 'L2StandardBridge_DepositFinalizeds' },
    { q: `query($limit:Int!){ l2StandardBridge_depositFinalizeds(limit:$limit, orderBy:id, orderDirection:desc){ ${fields} } }`, path: 'l2StandardBridge_depositFinalizeds' },
  ];

  let items = [];
  let lastError;
  for (const { q, path } of queries) {
    try {
      const resp = await postGraphQL(endpoint, headers, { query: q, variables: { limit: fetchLimit } });
      const data = resp.json && resp.json.data;
      if (resp.status === 200 && data && Array.isArray(data[path])) {
        items = data[path];
        break;
      }
      if (resp.json && resp.json.errors) lastError = resp.json.errors.map(e => e.message).join('; ');
    } catch (e) {
      lastError = e.message;
    }
  }

  if (!items.length) {
    if (format === 'json') {
      sendJson(res, 200, { blockNumber: null, groups: [], error: lastError || null });
    } else {
      sendHtml(res, 200, '<tr><td colspan="7" class="small">No deposits found.</td></tr>');
    }
    return;
  }

  // Determine latest block number from id = chain_block_logIndex
  const blockNums = items.map(it => {
    const parts = String(it.id).split('_');
    return parts.length >= 3 ? parseInt(parts[1], 10) : NaN;
  }).filter(n => Number.isFinite(n));

  if (!blockNums.length) {
    if (format === 'json') {
      sendJson(res, 200, { blockNumber: null, groups: [], error: 'Could not parse block numbers from ids' });
    } else {
      sendHtml(res, 200, '<tr><td colspan="7" class="small">Could not parse block numbers from ids.</td></tr>');
    }
    return;
  }

  const maxBlock = Math.max(...blockNums);
  const latest = items.filter(it => {
    const parts = String(it.id).split('_');
    const bn = parts.length >= 3 ? parseInt(parts[1], 10) : NaN;
    return bn === maxBlock;
  });
  console.log(latest);

  // Group by token pair (l1Token|l2Token) and sum BigInt amounts
  const map = new Map();
  for (const it of latest) {
    const key = `${it.l1Token}|${it.l2Token}`;
    const prev = map.get(key) || { l1Token: it.l1Token, l2Token: it.l2Token, count: 0, totalAmount: 0n };
    let amt;
    try { amt = BigInt(it.amount); } catch { amt = 0n; }
    prev.count += 1;
    prev.totalAmount = prev.totalAmount + amt;
    map.set(key, prev);
  }

  if (format === 'json') {
    const groups = Array.from(map.values()).map(g => ({
      l1Token: g.l1Token,
      l2Token: g.l2Token,
      count: g.count,
      totalAmount: g.totalAmount.toString(),
    }));
    sendJson(res, 200, { blockNumber: maxBlock, groups });
  } else {
    // HTML row mode: render individual deposits of the latest block, like /deposits
    const latestRows = latest.map(it => `
      <tr>
        <td class="mono">${escapeHtml(it.id)}</td>
        <td class="mono">${escapeHtml(it.from)}</td>
        <td class="mono">${escapeHtml(it.to)}</td>
        <td class="mono">${escapeHtml(it.l1Token || '')}</td>
        <td class="mono">${escapeHtml(it.l2Token || '')}</td>
        <td>${escapeHtml(String(it.amount))}</td>
        <td class="mono">${escapeHtml(maxBlock)}</td>
      </tr>
    `).join('');
    sendHtml(res, 200, latestRows || '<tr><td colspan="7" class="small">No deposits found.</td></tr>');
  }
}

server.listen(port, () => {
  console.log(`Static server on http://localhost:${port}`);
});
