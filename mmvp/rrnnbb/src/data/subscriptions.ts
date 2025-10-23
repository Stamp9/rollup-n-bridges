import { gql } from "@apollo/client";

// =============== ERC20 Subscriptions ===============

export const ERC20_BASE_SUB = gql`
  subscription BaseRelayErc20Tx {
    RelayDepository_RelayErc20Deposit(
      where: { chain_id: { _eq: 8453 } }
      order_by: { block_number: desc }
      limit: 1
    ) {
      event_id
      chain_id
      block_number
      amount
      from
      id
      token
    }
  }
`;

export const ERC20_OPTIMISM_SUB = gql`
  subscription OptimismRelayErc20Tx {
    RelayDepository_RelayErc20Deposit(
      where: { chain_id: { _eq: 10 } }
      order_by: { block_number: desc }
      limit: 1
    ) {
      event_id
      chain_id
      block_number
      amount
      from
      id
      token
    }
  }
`;

export const ERC20_ARBITRUM_SUB = gql`
  subscription ArbitrumRelayErc20Tx {
    RelayDepository_RelayErc20Deposit(
      where: { chain_id: { _eq: 42161 } }
      order_by: { block_number: desc }
      limit: 1
    ) {
      event_id
      chain_id
      block_number
      amount
      from
      id
      token
    }
  }
`;

export const ERC20_ETHEREUM_SUB = gql`
  subscription EthereumRelayErc20Tx {
    RelayDepository_RelayErc20Deposit(
      where: { chain_id: { _eq: 1 } }
      order_by: { block_number: desc }
      limit: 1
    ) {
      event_id
      chain_id
      block_number
      amount
      from
      id
      token
    }
  }
`;

// =============== Native Subscriptions ===============

export const NATIVE_BASE_SUB = gql`
  subscription BaseRelayNativeTx {
    RelayDepository_RelayNativeDeposit(
      where: { chain_id: { _eq: 8453 } }
      order_by: { block_number: desc }
      limit: 1
    ) {
      event_id
      chain_id
      block_number
      amount
      from
      id
    }
  }
`;

export const NATIVE_OPTIMISM_SUB = gql`
  subscription OptimismRelayNativeTx {
    RelayDepository_RelayNativeDeposit(
      where: { chain_id: { _eq: 10 } }
      order_by: { block_number: desc }
      limit: 1
    ) {
      event_id
      chain_id
      block_number
      amount
      from
      id
    }
  }
`;

export const NATIVE_ARBITRUM_SUB = gql`
  subscription ArbitrumRelayNativeTx {
    RelayDepository_RelayNativeDeposit(
      where: { chain_id: { _eq: 42161 } }
      order_by: { block_number: desc }
      limit: 1
    ) {
      event_id
      chain_id
      block_number
      amount
      from
      id
    }
  }
`;

export const NATIVE_ETHEREUM_SUB = gql`
  subscription EthereumRelayNativeTx {
    RelayDepository_RelayNativeDeposit(
      where: { chain_id: { _eq: 1 } }
      order_by: { block_number: desc }
      limit: 1
    ) {
      event_id
      chain_id
      block_number
      amount
      from
      id
    }
  }
`;
