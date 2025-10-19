Frontend (htmx)

Run
- Node 18+ recommended (for built-in fetch)

Commands
- Start: `node frontend/server.js`
  - Env vars:
    - `PORT` (default: 3000)
    - `GRAPHQL_URL` (default: http://localhost:8080/v1/graphql)
    - `HASURA_ADMIN_SECRET` (default: testing)
    - `OPTIMISM_RPC_URL` (default: https://mainnet.optimism.io)

Usage
- Open http://localhost:3000
- The page uses htmx to request `/deposits` every 2 seconds.
- The server queries the local GraphQL and also reads Optimism head via JSON-RPC.
  - It tracks the last queried block and considers the range (last..head) when polling.
- The table displays the 10 most recent native deposits.
