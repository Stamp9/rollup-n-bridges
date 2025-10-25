/* TypeScript file generated from Handlers.res by genType. */

/* eslint-disable */
/* tslint:disable */

const HandlersJS = require('./Handlers.res.js');

import type {HandlerTypes_eventConfig as Types_HandlerTypes_eventConfig} from './Types.gen';

import type {RelayDepository_RelayErc20Deposit_eventFilters as Types_RelayDepository_RelayErc20Deposit_eventFilters} from './Types.gen';

import type {RelayDepository_RelayErc20Deposit_event as Types_RelayDepository_RelayErc20Deposit_event} from './Types.gen';

import type {RelayDepository_RelayNativeDeposit_eventFilters as Types_RelayDepository_RelayNativeDeposit_eventFilters} from './Types.gen';

import type {RelayDepository_RelayNativeDeposit_event as Types_RelayDepository_RelayNativeDeposit_event} from './Types.gen';

import type {chain as Types_chain} from './Types.gen';

import type {contractRegistrations as Types_contractRegistrations} from './Types.gen';

import type {fnWithEventConfig as Types_fnWithEventConfig} from './Types.gen';

import type {genericContractRegisterArgs as Internal_genericContractRegisterArgs} from 'envio/src/Internal.gen';

import type {genericContractRegister as Internal_genericContractRegister} from 'envio/src/Internal.gen';

import type {genericHandlerArgs as Internal_genericHandlerArgs} from 'envio/src/Internal.gen';

import type {genericHandlerWithLoader as Internal_genericHandlerWithLoader} from 'envio/src/Internal.gen';

import type {genericHandler as Internal_genericHandler} from 'envio/src/Internal.gen';

import type {genericLoaderArgs as Internal_genericLoaderArgs} from 'envio/src/Internal.gen';

import type {genericLoader as Internal_genericLoader} from 'envio/src/Internal.gen';

import type {handlerContext as Types_handlerContext} from './Types.gen';

import type {loaderContext as Types_loaderContext} from './Types.gen';

import type {onBlockArgs as Envio_onBlockArgs} from 'envio/src/Envio.gen';

import type {onBlockOptions as Envio_onBlockOptions} from 'envio/src/Envio.gen';

export const RelayDepository_RelayErc20Deposit_contractRegister: Types_fnWithEventConfig<Internal_genericContractRegister<Internal_genericContractRegisterArgs<Types_RelayDepository_RelayErc20Deposit_event,Types_contractRegistrations>>,Types_HandlerTypes_eventConfig<Types_RelayDepository_RelayErc20Deposit_eventFilters>> = HandlersJS.RelayDepository.RelayErc20Deposit.contractRegister as any;

export const RelayDepository_RelayErc20Deposit_handler: Types_fnWithEventConfig<Internal_genericHandler<Internal_genericHandlerArgs<Types_RelayDepository_RelayErc20Deposit_event,Types_handlerContext,void>>,Types_HandlerTypes_eventConfig<Types_RelayDepository_RelayErc20Deposit_eventFilters>> = HandlersJS.RelayDepository.RelayErc20Deposit.handler as any;

export const RelayDepository_RelayErc20Deposit_handlerWithLoader: <loaderReturn>(_1:Internal_genericHandlerWithLoader<Internal_genericLoader<Internal_genericLoaderArgs<Types_RelayDepository_RelayErc20Deposit_event,Types_loaderContext>,loaderReturn>,Internal_genericHandler<Internal_genericHandlerArgs<Types_RelayDepository_RelayErc20Deposit_event,Types_handlerContext,loaderReturn>>,Types_RelayDepository_RelayErc20Deposit_eventFilters>) => void = HandlersJS.RelayDepository.RelayErc20Deposit.handlerWithLoader as any;

export const RelayDepository_RelayNativeDeposit_contractRegister: Types_fnWithEventConfig<Internal_genericContractRegister<Internal_genericContractRegisterArgs<Types_RelayDepository_RelayNativeDeposit_event,Types_contractRegistrations>>,Types_HandlerTypes_eventConfig<Types_RelayDepository_RelayNativeDeposit_eventFilters>> = HandlersJS.RelayDepository.RelayNativeDeposit.contractRegister as any;

export const RelayDepository_RelayNativeDeposit_handler: Types_fnWithEventConfig<Internal_genericHandler<Internal_genericHandlerArgs<Types_RelayDepository_RelayNativeDeposit_event,Types_handlerContext,void>>,Types_HandlerTypes_eventConfig<Types_RelayDepository_RelayNativeDeposit_eventFilters>> = HandlersJS.RelayDepository.RelayNativeDeposit.handler as any;

export const RelayDepository_RelayNativeDeposit_handlerWithLoader: <loaderReturn>(_1:Internal_genericHandlerWithLoader<Internal_genericLoader<Internal_genericLoaderArgs<Types_RelayDepository_RelayNativeDeposit_event,Types_loaderContext>,loaderReturn>,Internal_genericHandler<Internal_genericHandlerArgs<Types_RelayDepository_RelayNativeDeposit_event,Types_handlerContext,loaderReturn>>,Types_RelayDepository_RelayNativeDeposit_eventFilters>) => void = HandlersJS.RelayDepository.RelayNativeDeposit.handlerWithLoader as any;

/** Register a Block Handler. It'll be called for every block by default. */
export const onBlock: (_1:Envio_onBlockOptions<Types_chain>, _2:((_1:Envio_onBlockArgs<Types_handlerContext>) => Promise<void>)) => void = HandlersJS.onBlock as any;

export const RelayDepository: { RelayNativeDeposit: {
  handlerWithLoader: <loaderReturn>(_1:Internal_genericHandlerWithLoader<Internal_genericLoader<Internal_genericLoaderArgs<Types_RelayDepository_RelayNativeDeposit_event,Types_loaderContext>,loaderReturn>,Internal_genericHandler<Internal_genericHandlerArgs<Types_RelayDepository_RelayNativeDeposit_event,Types_handlerContext,loaderReturn>>,Types_RelayDepository_RelayNativeDeposit_eventFilters>) => void; 
  handler: Types_fnWithEventConfig<Internal_genericHandler<Internal_genericHandlerArgs<Types_RelayDepository_RelayNativeDeposit_event,Types_handlerContext,void>>,Types_HandlerTypes_eventConfig<Types_RelayDepository_RelayNativeDeposit_eventFilters>>; 
  contractRegister: Types_fnWithEventConfig<Internal_genericContractRegister<Internal_genericContractRegisterArgs<Types_RelayDepository_RelayNativeDeposit_event,Types_contractRegistrations>>,Types_HandlerTypes_eventConfig<Types_RelayDepository_RelayNativeDeposit_eventFilters>>
}; RelayErc20Deposit: {
  handlerWithLoader: <loaderReturn>(_1:Internal_genericHandlerWithLoader<Internal_genericLoader<Internal_genericLoaderArgs<Types_RelayDepository_RelayErc20Deposit_event,Types_loaderContext>,loaderReturn>,Internal_genericHandler<Internal_genericHandlerArgs<Types_RelayDepository_RelayErc20Deposit_event,Types_handlerContext,loaderReturn>>,Types_RelayDepository_RelayErc20Deposit_eventFilters>) => void; 
  handler: Types_fnWithEventConfig<Internal_genericHandler<Internal_genericHandlerArgs<Types_RelayDepository_RelayErc20Deposit_event,Types_handlerContext,void>>,Types_HandlerTypes_eventConfig<Types_RelayDepository_RelayErc20Deposit_eventFilters>>; 
  contractRegister: Types_fnWithEventConfig<Internal_genericContractRegister<Internal_genericContractRegisterArgs<Types_RelayDepository_RelayErc20Deposit_event,Types_contractRegistrations>>,Types_HandlerTypes_eventConfig<Types_RelayDepository_RelayErc20Deposit_eventFilters>>
} } = HandlersJS.RelayDepository as any;
