/*
 * Please refer to https://docs.envio.dev for a thorough guide on all Envio indexer features
 */
import {
  L2StandardBridge,
  L2StandardBridge_DepositFinalized,
  L2StandardBridge_ERC20BridgeFinalized,
  L2StandardBridge_ERC20BridgeInitiated,
  L2StandardBridge_ETHBridgeFinalized,
  L2StandardBridge_ETHBridgeInitiated,
  L2StandardBridge_Initialized,
  L2StandardBridge_WithdrawalInitiated,
  onBlock,
} from "generated";

L2StandardBridge.DepositFinalized.handler(async ({ event, context }) => {
  const entity: L2StandardBridge_DepositFinalized = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    timestamp: event.block.timestamp,
    block_number: event.block.number,
    l1Token: event.params.l1Token,
    l2Token: event.params.l2Token,
    from: event.params.from,
    to: event.params.to,
    amount: event.params.amount,
    extraData: event.params.extraData,
  };

  context.L2StandardBridge_DepositFinalized.set(entity);
});

L2StandardBridge.ERC20BridgeFinalized.handler(async ({ event, context }) => {
  const entity: L2StandardBridge_ERC20BridgeFinalized = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    timestamp: event.block.timestamp,
    block_number: event.block.number,
    localToken: event.params.localToken,
    remoteToken: event.params.remoteToken,
    from: event.params.from,
    to: event.params.to,
    amount: event.params.amount,
    extraData: event.params.extraData,
  };

  context.L2StandardBridge_ERC20BridgeFinalized.set(entity);
});

L2StandardBridge.ERC20BridgeInitiated.handler(async ({ event, context }) => {
  const entity: L2StandardBridge_ERC20BridgeInitiated = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    timestamp: event.block.timestamp,
    block_number: event.block.number,
    localToken: event.params.localToken,
    remoteToken: event.params.remoteToken,
    from: event.params.from,
    to: event.params.to,
    amount: event.params.amount,
    extraData: event.params.extraData,
  };

  context.L2StandardBridge_ERC20BridgeInitiated.set(entity);
});

L2StandardBridge.ETHBridgeFinalized.handler(async ({ event, context }) => {
  const entity: L2StandardBridge_ETHBridgeFinalized = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    from: event.params.from,
    to: event.params.to,
    amount: event.params.amount,
    extraData: event.params.extraData,
  };

  context.L2StandardBridge_ETHBridgeFinalized.set(entity);
});

L2StandardBridge.ETHBridgeInitiated.handler(async ({ event, context }) => {
  const entity: L2StandardBridge_ETHBridgeInitiated = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    timestamp: event.block.timestamp,
    block_number: event.block.number,
    from: event.params.from,
    to: event.params.to,
    amount: event.params.amount,
    extraData: event.params.extraData,
  };

  context.L2StandardBridge_ETHBridgeInitiated.set(entity);
});

L2StandardBridge.Initialized.handler(async ({ event, context }) => {
  const entity: L2StandardBridge_Initialized = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    version: event.params.version,
  };

  context.L2StandardBridge_Initialized.set(entity);
});

L2StandardBridge.WithdrawalInitiated.handler(async ({ event, context }) => {
  const entity: L2StandardBridge_WithdrawalInitiated = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    timestamp: event.block.timestamp,
    block_number: event.block.number,
    l1Token: event.params.l1Token,
    l2Token: event.params.l2Token,
    from: event.params.from,
    to: event.params.to,
    amount: event.params.amount,
    extraData: event.params.extraData,
  };

  context.L2StandardBridge_WithdrawalInitiated.set(entity);
});


[
  {
    name: "OP",
    chain: 10 as const,
    startBlock: 142602610,
    interval: (60 * 60) / 2, // Every 60 minutes (2s block time)
  },
].forEach(({ chain, startBlock, interval }) => {
  onBlock(
    {
      name: "HourlyPrice",
      chain,
      startBlock,
      interval,
    },
    async ({ block, context }) => {
      context.log.info(`Processing block ${block.number}`);
    }
    
  );
});
