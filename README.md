## Envio Indexer

*Please refer to the [documentation website](https://docs.envio.dev) for a thorough guide on all [Envio](https://envio.dev) indexer features*

### Run

```bash
pnpm dev
```

Visit http://localhost:8080 to see the GraphQL Playground, local password is `testing`.

### Minimal Frontend (Latest Deposits)

This repo includes a tiny static frontend that queries the local Envio GraphQL server and lists the 10 latest Optimism bridge deposits.

Run it locally:

```bash
pnpm frontend
```

Open http://localhost:5173 and set the GraphQL endpoint if needed (defaults to `http://localhost:8080/graphql`). If your Envio server uses a different path, try `http://localhost:8080/v1/graphql`.

Notes:
- Start the Envio dev server first (`pnpm dev`).
- The page auto-loads the latest 10 `L2StandardBridge_DepositFinalized` events and shows From/To/L1 Token/L2 Token/Amount.

### Summary Endpoint

The static server also exposes a JSON summary for the latest block’s deposits:

- `GET http://localhost:5173/deposits-summary?endpoint=<HASURA_GRAPHQL_URL>&auth-key=<HEADER_KEY>&auth-val=<HEADER_VAL>&limit=100`

Response shape:

```
{
  "blockNumber": 12345678,
  "groups": [
    { "l1Token": "0x...", "l2Token": "0x...", "count": 3, "totalAmount": "1234567890000000000" }
  ]
}
```

Notes:
- `totalAmount` is in base units (for ERC20) or wei for ETH-like tokens if they appear in `DepositFinalized`.
- This endpoint currently summarizes `L2StandardBridge_DepositFinalized` only.

### Generate files from `config.yaml` or `schema.graphql`

```bash
pnpm codegen
```

### Pre-requisites

- [Node.js (use v18 or newer)](https://nodejs.org/en/download/current)
- [pnpm (use v8 or newer)](https://pnpm.io/installation)
- [Docker desktop](https://www.docker.com/products/docker-desktop/)
