/* TypeScript file generated from Types.res by genType. */

/* eslint-disable */
/* tslint:disable */

import type {HandlerContext as $$handlerContext} from './Types.ts';

import type {HandlerWithOptions as $$fnWithEventConfig} from './bindings/OpaqueTypes.ts';

import type {LoaderContext as $$loaderContext} from './Types.ts';

import type {RelayDepository_RelayErc20Deposit_t as Entities_RelayDepository_RelayErc20Deposit_t} from '../src/db/Entities.gen';

import type {RelayDepository_RelayNativeDeposit_t as Entities_RelayDepository_RelayNativeDeposit_t} from '../src/db/Entities.gen';

import type {SingleOrMultiple as $$SingleOrMultiple_t} from './bindings/OpaqueTypes';

import type {entityHandlerContext as Internal_entityHandlerContext} from 'envio/src/Internal.gen';

import type {eventOptions as Internal_eventOptions} from 'envio/src/Internal.gen';

import type {genericContractRegisterArgs as Internal_genericContractRegisterArgs} from 'envio/src/Internal.gen';

import type {genericContractRegister as Internal_genericContractRegister} from 'envio/src/Internal.gen';

import type {genericEvent as Internal_genericEvent} from 'envio/src/Internal.gen';

import type {genericHandlerArgs as Internal_genericHandlerArgs} from 'envio/src/Internal.gen';

import type {genericHandlerWithLoader as Internal_genericHandlerWithLoader} from 'envio/src/Internal.gen';

import type {genericHandler as Internal_genericHandler} from 'envio/src/Internal.gen';

import type {genericLoaderArgs as Internal_genericLoaderArgs} from 'envio/src/Internal.gen';

import type {genericLoader as Internal_genericLoader} from 'envio/src/Internal.gen';

import type {logger as Envio_logger} from 'envio/src/Envio.gen';

import type {noEventFilters as Internal_noEventFilters} from 'envio/src/Internal.gen';

import type {t as Address_t} from 'envio/src/Address.gen';

export type id = string;
export type Id = id;

export type contractRegistrations = { readonly log: Envio_logger; readonly addRelayDepository: (_1:Address_t) => void };

export type entityLoaderContext<entity,indexedFieldOperations> = {
  readonly get: (_1:id) => Promise<(undefined | entity)>; 
  readonly getOrThrow: (_1:id, message:(undefined | string)) => Promise<entity>; 
  readonly getWhere: indexedFieldOperations; 
  readonly getOrCreate: (_1:entity) => Promise<entity>; 
  readonly set: (_1:entity) => void; 
  readonly deleteUnsafe: (_1:id) => void
};

export type loaderContext = $$loaderContext;

export type entityHandlerContext<entity> = Internal_entityHandlerContext<entity>;

export type handlerContext = $$handlerContext;

export type relayDepository_RelayErc20Deposit = Entities_RelayDepository_RelayErc20Deposit_t;
export type RelayDepository_RelayErc20Deposit = relayDepository_RelayErc20Deposit;

export type relayDepository_RelayNativeDeposit = Entities_RelayDepository_RelayNativeDeposit_t;
export type RelayDepository_RelayNativeDeposit = relayDepository_RelayNativeDeposit;

export type eventIdentifier = {
  readonly chainId: number; 
  readonly blockTimestamp: number; 
  readonly blockNumber: number; 
  readonly logIndex: number
};

export type entityUpdateAction<entityType> = "Delete" | { TAG: "Set"; _0: entityType };

export type entityUpdate<entityType> = {
  readonly eventIdentifier: eventIdentifier; 
  readonly entityId: id; 
  readonly entityUpdateAction: entityUpdateAction<entityType>
};

export type entityValueAtStartOfBatch<entityType> = 
    "NotSet"
  | { TAG: "AlreadySet"; _0: entityType };

export type updatedValue<entityType> = {
  readonly latest: entityUpdate<entityType>; 
  readonly history: entityUpdate<entityType>[]; 
  readonly containsRollbackDiffChange: boolean
};

export type inMemoryStoreRowEntity<entityType> = 
    { TAG: "Updated"; _0: updatedValue<entityType> }
  | { TAG: "InitialReadFromDb"; _0: entityValueAtStartOfBatch<entityType> };

export type Transaction_t = {};

export type Block_t = {
  readonly number: number; 
  readonly timestamp: number; 
  readonly hash: string
};

export type AggregatedBlock_t = {
  readonly hash: string; 
  readonly number: number; 
  readonly timestamp: number
};

export type AggregatedTransaction_t = {};

export type eventLog<params> = Internal_genericEvent<params,Block_t,Transaction_t>;
export type EventLog<params> = eventLog<params>;

export type SingleOrMultiple_t<a> = $$SingleOrMultiple_t<a>;

export type HandlerTypes_args<eventArgs,context> = { readonly event: eventLog<eventArgs>; readonly context: context };

export type HandlerTypes_contractRegisterArgs<eventArgs> = Internal_genericContractRegisterArgs<eventLog<eventArgs>,contractRegistrations>;

export type HandlerTypes_contractRegister<eventArgs> = Internal_genericContractRegister<HandlerTypes_contractRegisterArgs<eventArgs>>;

export type HandlerTypes_loaderArgs<eventArgs> = Internal_genericLoaderArgs<eventLog<eventArgs>,loaderContext>;

export type HandlerTypes_loader<eventArgs,loaderReturn> = Internal_genericLoader<HandlerTypes_loaderArgs<eventArgs>,loaderReturn>;

export type HandlerTypes_handlerArgs<eventArgs,loaderReturn> = Internal_genericHandlerArgs<eventLog<eventArgs>,handlerContext,loaderReturn>;

export type HandlerTypes_handler<eventArgs,loaderReturn> = Internal_genericHandler<HandlerTypes_handlerArgs<eventArgs,loaderReturn>>;

export type HandlerTypes_loaderHandler<eventArgs,loaderReturn,eventFilters> = Internal_genericHandlerWithLoader<HandlerTypes_loader<eventArgs,loaderReturn>,HandlerTypes_handler<eventArgs,loaderReturn>,eventFilters>;

export type HandlerTypes_eventConfig<eventFilters> = Internal_eventOptions<eventFilters>;

export type fnWithEventConfig<fn,eventConfig> = $$fnWithEventConfig<fn,eventConfig>;

export type handlerWithOptions<eventArgs,loaderReturn,eventFilters> = fnWithEventConfig<HandlerTypes_handler<eventArgs,loaderReturn>,HandlerTypes_eventConfig<eventFilters>>;

export type contractRegisterWithOptions<eventArgs,eventFilters> = fnWithEventConfig<HandlerTypes_contractRegister<eventArgs>,HandlerTypes_eventConfig<eventFilters>>;

<<<<<<< HEAD
export type RelayDepository_chainId = 1 | 10 | 8453;
=======
export type RelayDepository_chainId = 1 | 10;
>>>>>>> d465ecf (merge relay stuff)

export type RelayDepository_RelayErc20Deposit_eventArgs = {
  readonly from: Address_t; 
  readonly token: Address_t; 
  readonly amount: bigint; 
  readonly id: string
};

export type RelayDepository_RelayErc20Deposit_block = Block_t;

export type RelayDepository_RelayErc20Deposit_transaction = Transaction_t;

export type RelayDepository_RelayErc20Deposit_event = {
  /** The parameters or arguments associated with this event. */
  readonly params: RelayDepository_RelayErc20Deposit_eventArgs; 
  /** The unique identifier of the blockchain network where this event occurred. */
  readonly chainId: RelayDepository_chainId; 
  /** The address of the contract that emitted this event. */
  readonly srcAddress: Address_t; 
  /** The index of this event's log within the block. */
  readonly logIndex: number; 
  /** The transaction that triggered this event. Configurable in `config.yaml` via the `field_selection` option. */
  readonly transaction: RelayDepository_RelayErc20Deposit_transaction; 
  /** The block in which this event was recorded. Configurable in `config.yaml` via the `field_selection` option. */
  readonly block: RelayDepository_RelayErc20Deposit_block
};

export type RelayDepository_RelayErc20Deposit_loaderArgs = Internal_genericLoaderArgs<RelayDepository_RelayErc20Deposit_event,loaderContext>;

export type RelayDepository_RelayErc20Deposit_loader<loaderReturn> = Internal_genericLoader<RelayDepository_RelayErc20Deposit_loaderArgs,loaderReturn>;

export type RelayDepository_RelayErc20Deposit_handlerArgs<loaderReturn> = Internal_genericHandlerArgs<RelayDepository_RelayErc20Deposit_event,handlerContext,loaderReturn>;

export type RelayDepository_RelayErc20Deposit_handler<loaderReturn> = Internal_genericHandler<RelayDepository_RelayErc20Deposit_handlerArgs<loaderReturn>>;

export type RelayDepository_RelayErc20Deposit_contractRegister = Internal_genericContractRegister<Internal_genericContractRegisterArgs<RelayDepository_RelayErc20Deposit_event,contractRegistrations>>;

export type RelayDepository_RelayErc20Deposit_eventFilter = {};

export type RelayDepository_RelayErc20Deposit_eventFilters = Internal_noEventFilters;

export type RelayDepository_RelayNativeDeposit_eventArgs = {
  readonly from: Address_t; 
  readonly amount: bigint; 
  readonly id: string
};

export type RelayDepository_RelayNativeDeposit_block = Block_t;

export type RelayDepository_RelayNativeDeposit_transaction = Transaction_t;

export type RelayDepository_RelayNativeDeposit_event = {
  /** The parameters or arguments associated with this event. */
  readonly params: RelayDepository_RelayNativeDeposit_eventArgs; 
  /** The unique identifier of the blockchain network where this event occurred. */
  readonly chainId: RelayDepository_chainId; 
  /** The address of the contract that emitted this event. */
  readonly srcAddress: Address_t; 
  /** The index of this event's log within the block. */
  readonly logIndex: number; 
  /** The transaction that triggered this event. Configurable in `config.yaml` via the `field_selection` option. */
  readonly transaction: RelayDepository_RelayNativeDeposit_transaction; 
  /** The block in which this event was recorded. Configurable in `config.yaml` via the `field_selection` option. */
  readonly block: RelayDepository_RelayNativeDeposit_block
};

export type RelayDepository_RelayNativeDeposit_loaderArgs = Internal_genericLoaderArgs<RelayDepository_RelayNativeDeposit_event,loaderContext>;

export type RelayDepository_RelayNativeDeposit_loader<loaderReturn> = Internal_genericLoader<RelayDepository_RelayNativeDeposit_loaderArgs,loaderReturn>;

export type RelayDepository_RelayNativeDeposit_handlerArgs<loaderReturn> = Internal_genericHandlerArgs<RelayDepository_RelayNativeDeposit_event,handlerContext,loaderReturn>;

export type RelayDepository_RelayNativeDeposit_handler<loaderReturn> = Internal_genericHandler<RelayDepository_RelayNativeDeposit_handlerArgs<loaderReturn>>;

export type RelayDepository_RelayNativeDeposit_contractRegister = Internal_genericContractRegister<Internal_genericContractRegisterArgs<RelayDepository_RelayNativeDeposit_event,contractRegistrations>>;

export type RelayDepository_RelayNativeDeposit_eventFilter = {};

export type RelayDepository_RelayNativeDeposit_eventFilters = Internal_noEventFilters;

export type chainId = number;

<<<<<<< HEAD
export type chain = 1 | 10 | 8453;
=======
export type chain = 1 | 10;
>>>>>>> d465ecf (merge relay stuff)
