// Generic GraphQL fetcher to reuse across queries
// Ensure this module is self-contained and reads config from env.
const GRAPHQL_URL = process.env.GRAPHQL_URL || 'http://localhost:8080/v1/graphql';
const HASURA_ADMIN_SECRET = process.env.HASURA_ADMIN_SECRET || 'testing';

async function fetchGraphQL(query, variables = {}) {
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
  console.log(json);
  if (json.errors) {
    throw new Error(`GraphQL errors: ${JSON.stringify(json.errors)}`);
  }
  return json;
}

async function fetchLatestNativeDeposits(limit = 10) {
  const query = `
    query LatestNativeDeposits($limit: Int!) {
      RelayDepository_RelayNativeDeposit(limit: $limit, order_by: {block_number: desc}) {
        id
        block_number
        from
        amount
        event_id
      }
    }
  `;
  return fetchGraphQL(query, { limit });
}

async function fetchErc20Deposits(limit = 10) {
  const query = `
    query LatestNativeDeposits($limit: Int!) {
      RelayDepository_RelayErc20Deposit(limit: $limit, order_by: {block_number: desc}) {
        id
        block_number
        amount
        from
        token
      }
    }
  `

  return fetchGraphQL(query, { limit });
}


module.exports = { GRAPHQL_URL, fetchLatestNativeDeposits, fetchErc20Deposits };
