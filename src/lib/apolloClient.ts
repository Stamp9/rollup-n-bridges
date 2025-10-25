import { ApolloClient, InMemoryCache, split, HttpLink } from "@apollo/client";
import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { createClient } from "graphql-ws";
import { getMainDefinition } from "@apollo/client/utilities";

const HTTP_URL =   "http://localhost:8080/v1/graphql";
const WS_URL =  "ws://localhost:8080/v1/graphql";
const ADMIN_SECRET = "testing";

const httpLink = new HttpLink({
  uri: HTTP_URL,
  headers: { "x-hasura-admin-secret": ADMIN_SECRET },
});

const wsLink = new GraphQLWsLink(
  createClient({
    url: WS_URL,
    connectionParams: {
      headers: { "x-hasura-admin-secret": ADMIN_SECRET },
    },
    on: {
    connected: () => console.log("[Apollo WS] ✅ connected to", WS_URL),
    closed: (e) => console.log("[Apollo WS] ❌ closed", e),
    error: (e) => console.error("[Apollo WS] ⚠️ error", e),
  },
  })
);

const splitLink = split(
  ({ query }) => {
    const def = getMainDefinition(query);
    return def.kind === "OperationDefinition" && def.operation === "subscription";
  },
  wsLink,
  httpLink
);

export const apolloClient = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache(),
});
