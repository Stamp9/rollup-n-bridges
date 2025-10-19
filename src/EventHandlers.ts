/*
 * Please refer to https://docs.envio.dev for a thorough guide on all Envio indexer features
 */
import {
  ERC1967Proxy,
  ERC1967Proxy_Deposited,
  ERC1967Proxy_FeesWithdrawn,
  ERC1967Proxy_RootUpdated,
  ERC1967Proxy_WithdrawalRelayed,
} from "generated";

ERC1967Proxy.Deposited.handler(async ({ event, context }) => {
  const entity: ERC1967Proxy_Deposited = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    block_number: event.block.number,
    _depositor: event.params._depositor,
    _pool: event.params._pool,
    _commitment: event.params._commitment,
    _amount: event.params._amount,
  };

  context.ERC1967Proxy_Deposited.set(entity);
});

ERC1967Proxy.FeesWithdrawn.handler(async ({ event, context }) => {
  const entity: ERC1967Proxy_FeesWithdrawn = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    block_number: event.block.number,
    _asset: event.params._asset,
    _recipient: event.params._recipient,
    _amount: event.params._amount,
  };

  context.ERC1967Proxy_FeesWithdrawn.set(entity);
});

ERC1967Proxy.RootUpdated.handler(async ({ event, context }) => {
  const entity: ERC1967Proxy_RootUpdated = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    block_number: event.block.number,
    _root: event.params._root,
    _ipfsCID: event.params._ipfsCID,
    _timestamp: event.params._timestamp,
  };

  context.ERC1967Proxy_RootUpdated.set(entity);
});

ERC1967Proxy.WithdrawalRelayed.handler(async ({ event, context }) => {
  const entity: ERC1967Proxy_WithdrawalRelayed = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    block_number: event.block.number,
    _relayer: event.params._relayer,
    _recipient: event.params._recipient,
    _asset: event.params._asset,
    _amount: event.params._amount,
    _feeAmount: event.params._feeAmount,
  };

  context.ERC1967Proxy_WithdrawalRelayed.set(entity);
});
