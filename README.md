# rollup-n-bridges
scamulator

## Envio Indexer

*Please refer to the [documentation website](https://docs.envio.dev) for a thorough guide on all [Envio](https://envio.dev) indexer features*

### Run

```bash
pnpm dev
```

Visit http://localhost:8080 to see the GraphQL Playground, local password is `testing`.

### HTMX Frontend (deposits last 24h)

This repo includes a small, separate Express server that serves an HTMX page listing deposits from the last 24 hours. It does not modify anything under `generated/` and reuses the indexer’s DB config.

Start it:

```bash
node web/server.js  # FRONTEND_PORT=8081 by default
```

Open http://localhost:8081/ to view the table (auto-refreshes every 10s).

- The frontend queries Hasura GraphQL at `http://localhost:8080/v1/graphql` by default.
  - Set `GRAPHQL_ENDPOINT` to override.
  - Set `HASURA_ADMIN_SECRET` (defaults to `testing`).
  - Amounts are formatted using `AMOUNT_DECIMALS` (default `18`). If your asset uses a different number of decimals, set this env var (e.g., `AMOUNT_DECIMALS=6`). The raw on-chain value is available as a tooltip on the amount.

### Generate files from `config.yaml` or `schema.graphql`

```bash
pnpm codegen
```

### Pre-requisites

- [Node.js (use v18 or newer)](https://nodejs.org/en/download/current)
- [pnpm (use v8 or newer)](https://pnpm.io/installation)
- [Docker desktop](https://www.docker.com/products/docker-desktop/)
