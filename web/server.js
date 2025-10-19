#!/usr/bin/env node
// Lightweight HTMX frontend server for deposits (last 24h)
// Does not touch or modify the generated/ indexer. Uses Hasura GraphQL.

const path = require('path');
const express = require('express');

const app = express();
const PORT = process.env.FRONTEND_PORT || 8081; // avoid 8080 which is used by Hasura locally
const GRAPHQL_ENDPOINT = process.env.GRAPHQL_ENDPOINT || 'http://localhost:8080/v1/graphql';
const HASURA_ADMIN_SECRET = process.env.HASURA_ADMIN_SECRET || 'testing';
const AMOUNT_DECIMALS = Number(process.env.AMOUNT_DECIMALS || 18);

app.use(express.static(path.join(__dirname, 'public')));

async function gql(query, variables) {
  const resp = await fetch(GRAPHQL_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-hasura-admin-secret': HASURA_ADMIN_SECRET,
    },
    body: JSON.stringify({ query, variables }),
  });
  const text = await resp.text();
  let json;
  try { json = JSON.parse(text); } catch { json = { parseError: text }; }
  if (!resp.ok) {
    const msg = json?.errors ? JSON.stringify(json.errors) : text;
    throw new Error(`GraphQL HTTP ${resp.status}: ${msg}`);
  }
  if (json.errors) {
    throw new Error(JSON.stringify(json.errors));
  }
  return json.data;
}

async function findHistoryFieldName() {
  // Discover the exact history field name via introspection
  const data = await gql(`{ __schema { queryType { fields { name } } } }`, {});
  const fields = data?.__schema?.queryType?.fields?.map(f => f.name) || [];
  const candidates = fields.filter(n => /deposited/i.test(n) && /history/i.test(n));
  const exact = candidates.find(n => n === 'ERC1967Proxy_Deposited_history');
  return exact || candidates[0] || null;
}

app.get('/rows', async (req, res) => {
  try {
    const nowSec = Math.floor(Date.now() / 1000);
    const sinceSec = nowSec - 24 * 60 * 60;

    // Prefer history table if tracked in GraphQL
    let rows = [];
    const historyField = await findHistoryFieldName();
    if (historyField) {
      const data = await gql(
        `query($since: Int!, $limit: Int!) {
          ${historyField}(
            limit: $limit
          ) {
            id
            block_number
            _depositor
            _pool
            _commitment
            _amount
          }
        }`,
        { since: sinceSec, limit: 500 }
      );
      rows = data?.[historyField] ?? [];
    }

    // Fallback: recent entities (no 24h filter if history not available)
    if (!rows.length) {
      const data = await gql(
        `query($limit: Int!) {
          ERC1967Proxy_Deposited(order_by: { id: desc }, limit: $limit) {
            id
            block_number
            _depositor
            _pool
            _commitment
            _amount
          }
        }`,
        { limit: 200 }
      );
      rows = (data?.ERC1967Proxy_Deposited || []).map(r => ({ ...r, entity_history_block_timestamp: null }));
    }

    const fmt = (v) => (v == null ? '' : typeof v === 'bigint' ? v.toString() : String(v));
    const short = (s) => {
      const str = fmt(s);
      if (str.length <= 12) return str;
      return str.slice(0, 6) + '…' + str.slice(-4);
    };
    const toBigIntLike = (x) => {
      if (typeof x === 'bigint') return x;
      if (typeof x === 'number') return BigInt(Math.trunc(x));
      if (typeof x === 'string') return x === '' ? 0n : BigInt(x);
      return 0n;
    };
    const formatUnits = (bi, decimals) => {
      try {
        const d = Number.isFinite(decimals) ? Math.max(0, Math.min(36, Math.floor(decimals))) : 18;
        const neg = bi < 0n;
        const abs = neg ? -bi : bi;
        const base = 10n ** BigInt(d);
        const intPart = abs / base;
        const frac = abs % base;
        let fracStr = frac.toString().padStart(d, '0');
        // trim trailing zeros
        fracStr = fracStr.replace(/0+$/, '');
        const out = (neg ? '-' : '') + intPart.toString() + (fracStr ? '.' + fracStr : '');
        return out;
      } catch {
        return fmt(bi);
      }
    };

    const html = rows
      .map((r) => {
        const ts = Number(r.entity_history_block_timestamp);
        const dateStr = Number.isFinite(ts) ? new Date(ts * 1000).toISOString() : '';
        const amountHuman = formatUnits(toBigIntLike(r._amount), AMOUNT_DECIMALS);
        return (
          '<tr>' +
          `<td>${r.block_number}</td>` +
          `<td><code>${short(r._depositor)}</code></td>` +
          `<td><code>${short(r._pool)}</code></td>` +
          `<td><code>${fmt(r._commitment)}</code></td>` +
          `<td><code title="${fmt(r._amount)}">${amountHuman}</code></td>` +
          '</tr>'
        );
      })
      .join('');

    res.set('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
  } catch (e) {
    const msg = (e && e.message) ? e.message : String(e);
    const safe = msg.replace(/</g, '&lt;').replace(/>/g, '&gt;');
    // Return 200 so HTMX swaps the error text into the table
    res.status(200).send(`<tr><td colspan="6">Failed to load rows: <code>${safe}</code></td></tr>`);
  }
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`HTMX deposits frontend listening on http://localhost:${PORT}`);
});
