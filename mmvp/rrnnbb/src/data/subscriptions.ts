import { gql } from "@apollo/client";

export const RELAY_ERC20_TX_SUBSCRIPTION = gql`
  subscription Base_tx {
  RelayDepository_RelayErc20Deposit(limit: 1, order_by: {block_number: desc}) {
    event_id
    chain_id
    from
    id
    block_number
    amount
    __typename
  }
  
}`;

export const RELAY_NATIVE_SUBSCRIPTION = gql`
  subscription NativeTx {
    RelayDepository_RelayNativeDeposit(limit: 1, order_by: {block_number: desc}) {
      event_id
      chain_id
      from
      id
      block_number
      amount
      __typename
    }
  }`;
