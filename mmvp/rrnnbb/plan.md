IMPORTANT: do not touch ../../generated

The goal is to create a UI that visualizes the deposits that go from various Ethereum and its L2 chains into Relay Hub.

This project currently uses an indexer known as envio where its endpoint can be found at `http://localhost:8080/v1/graphql`. `src/data/graphql.js` contains the necessary queries to fetch relevant data from that endpoint.

`src/data/api.ts` currently uses some placeholders like `API_BASE`. These placeholders needs to change to use the graphql calls. Specifically, look at `BridgeTx` and `BridgeApiResponse`, and look at how `fetchBridgeTxsSince` is used. It takes in a block number as input, and for that, let's use 140000000 as input (even if we know it doesn't return anything for Ethereum - let's ignore that for now).

As a user, the flow should look like this.

Upon opening our website, the client should:

1. cache the current block number of Optimism's tip,
2. query `fetchBridgeTxsSince` with the block number every 3 seconds, and re-cache the new latest block number in the client's session storage.
3. Repeat 2.

Now, your task is to:

1. replace the current `fetchBridgeTxsSince` to use the new graphql endpoint
2. accomplish the 3 steps found above in the client flow.
