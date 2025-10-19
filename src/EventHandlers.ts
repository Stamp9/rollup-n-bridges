/*
 * Please refer to https://docs.envio.dev for a thorough guide on all Envio indexer features
 */
import {
  RelayDepository,
  RelayDepository_RelayErc20Deposit,
  RelayDepository_RelayNativeDeposit,
} from "generated";

RelayDepository.RelayErc20Deposit.handler(async ({ event, context }) => {
  const entity: RelayDepository_RelayErc20Deposit = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    chain_id: event.chainId,
    block_number: event.block.number,
    from: event.params.from,
    token: event.params.token,
    amount: event.params.amount,
    event_id: event.params.id,
  };

  context.RelayDepository_RelayErc20Deposit.set(entity);
});

RelayDepository.RelayNativeDeposit.handler(async ({ event, context }) => {
  const entity: RelayDepository_RelayNativeDeposit = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    chain_id: event.chainId,
    block_number: event.block.number,
    from: event.params.from,
    amount: event.params.amount,
    event_id: event.params.id,
  };

  context.RelayDepository_RelayNativeDeposit.set(entity);
});
