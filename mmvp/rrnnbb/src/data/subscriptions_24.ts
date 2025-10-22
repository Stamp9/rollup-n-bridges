import { gql } from "@apollo/client";

export const RELAY_LATEST_BLOCK = gql`
  query LatestBlocks {
    chain_metadata {
      chain_id
      block_height
    }
}`;

export const RELAY_NATIVE_24 = `
  query dailyNativeCount($chainId: Int, $minBlock: Int) {
    RelayDepository_RelayNativeDeposit_aggregate(where: {block_number: {_gte: $minBlock}, chain_id: {_eq: $chainId}}) {
      aggregate {
        count(columns: event_id, distinct: false)
      }
    }
  }`;

export const RELAY_ERC20_24 = `
  query dailyERC20Count($chainId: Int, $minBlock: Int) {
    RelayDepository_RelayErc20Deposit_aggregate(where: {block_number: {_gte: $minBlock}, chain_id: {_eq: $chainId}}) {
      aggregate {
        count(columns: event_id, distinct: false)
      }
    }
  }`;

