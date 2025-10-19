ALL THE ASSETS ARE PLACEHOLDER

# Rollup & Bridge Monitor

An interactive React + TypeScript dashboard for visualising bridging activity across L2 networks. The UI animates transaction flow between bridge protocols and layer-2 destinations, and offers multiple overview modes for exploring the data.

## Key Features

- Real-time data loop powered by `useBridgeData`, polling a local mock API for bridge transactions.
- Animated network graph that shows token throughput between bridges and rollups with per-token tooltips.
- Two detail views — **Bridge Overview** and the playful **Piexel Bridge Overview** — with sortable flow summaries and transaction timelines.
- Protocol and destination filters to focus the visualisation on specific bridges or chains.
- Mock data generator (`server.js`) that simulates block production and token transfers for rapid prototyping.

## Architecture

- **Front end**: React 19 + Vite + TypeScript, with motion effects from `framer-motion`.
- **Data layer**: `src/data/useBridgeData.ts` polls `http://localhost:8000`, aggregates transactions into `Link` objects and layer-2 flow summaries, and keeps a rolling history window.
- **Visualisation components**: `NetworkGraph`, `BridgeOverview`, `PiexelBridgeOverview`, `TokenParticle`, and `NodeCircle` render the network, side panels, and animated particles.
- **Mock API**: `server.js` exposes `/blockNumber` and `/bridgeTxs` endpoints and fabricates transactions on each poll loop.

## Getting Started

### Prerequisites

- Node.js 20+ (tested with npm).
- npm (bundled with Node) or a compatible package manager.

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```
2. In a separate terminal start the mock API:
   ```bash
   npm run mock:api
   ```
   The UI expects the API at `http://localhost:8000`. To target another host or port, update `API_BASE` in `src/data/api.ts`.
3. Launch the Vite dev server:
   ```bash
   npm run dev
   ```
4. Open `http://localhost:5173` in your browser.

### Available Scripts

- `npm run dev` — start the development server with hot module reloading.
- `npm run build` — type-check and generate a production build.
- `npm run preview` — serve the built app locally for smoke testing.
- `npm run lint` — run ESLint across the project.
- `npm run mock:api` — start the local bridge transaction generator.

## Project Structure

```
.
├── src/
│   ├── assets/               # static images used in the Piexel view
│   ├── components/           # graph, overview, and particle visualisations
│   ├── data/                 # mock API client, aggregators, and models
│   ├── App.tsx               # top-level layout and view switching
│   └── main.tsx              # React bootstrap
├── public/                   # static assets served by Vite
├── server.js                 # local mock API for bridge data
├── vite.config.ts            # Vite configuration
└── package.json
```

## Extending the Prototype

- Replace `server.js` with a real RPC or data service by adapting the fetch helpers in `src/data/api.ts`.
- Tune `DEFAULT_HISTORY_WINDOW_MS` in `src/data/useBridgeData.ts` to change how much history is visualised.
- Add new layer-2 destinations or bridge protocols via `src/data/model.ts` and corresponding component layouts.
- Integrate additional analytics (e.g. latency or fee charts) by augmenting the aggregated data returned from `buildAggregatedData`.
