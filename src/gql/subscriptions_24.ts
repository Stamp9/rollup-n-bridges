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



export const ALOT_OF_DATA = `
  subscription verystupidsubscriptionidea {
    RelayDepository_RelayErc20Deposit(order_by: {chain_id: asc}, 
      where: {
        _and:[
          { _or: [
            {chain_id: {_eq: 8453}}, {block_number: {_gte: 37229681}}
            {chain_id: {_eq: 42161}}, {block_number: {_gte: 392659460}}
            {chain_id: {_eq: 10}}, {block_number: {_gte: 142825130}}

          ]}
        ]
      }) {
      id
      chain_id
      block_number
      amount
    }
  }
`
