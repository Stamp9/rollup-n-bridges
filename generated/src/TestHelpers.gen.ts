/* TypeScript file generated from TestHelpers.res by genType. */

/* eslint-disable */
/* tslint:disable */

const TestHelpersJS = require('./TestHelpers.res.js');

import type {RelayDepository_RelayErc20Deposit_event as Types_RelayDepository_RelayErc20Deposit_event} from './Types.gen';

import type {RelayDepository_RelayNativeDeposit_event as Types_RelayDepository_RelayNativeDeposit_event} from './Types.gen';

import type {t as Address_t} from 'envio/src/Address.gen';

import type {t as TestHelpers_MockDb_t} from './TestHelpers_MockDb.gen';

/** The arguements that get passed to a "processEvent" helper function */
export type EventFunctions_eventProcessorArgs<event> = {
  readonly event: event; 
  readonly mockDb: TestHelpers_MockDb_t; 
  readonly chainId?: number
};

export type EventFunctions_eventProcessor<event> = (_1:EventFunctions_eventProcessorArgs<event>) => Promise<TestHelpers_MockDb_t>;

export type EventFunctions_MockBlock_t = {
  readonly hash?: string; 
  readonly number?: number; 
  readonly timestamp?: number
};

export type EventFunctions_MockTransaction_t = { readonly hash?: string };

export type EventFunctions_mockEventData = {
  readonly chainId?: number; 
  readonly srcAddress?: Address_t; 
  readonly logIndex?: number; 
  readonly block?: EventFunctions_MockBlock_t; 
  readonly transaction?: EventFunctions_MockTransaction_t
};

export type RelayDepository_RelayErc20Deposit_createMockArgs = {
  readonly from?: Address_t; 
  readonly token?: Address_t; 
  readonly amount?: bigint; 
  readonly id?: string; 
  readonly mockEventData?: EventFunctions_mockEventData
};

export type RelayDepository_RelayNativeDeposit_createMockArgs = {
  readonly from?: Address_t; 
  readonly amount?: bigint; 
  readonly id?: string; 
  readonly mockEventData?: EventFunctions_mockEventData
};

export const MockDb_createMockDb: () => TestHelpers_MockDb_t = TestHelpersJS.MockDb.createMockDb as any;

export const Addresses_mockAddresses: Address_t[] = TestHelpersJS.Addresses.mockAddresses as any;

export const Addresses_defaultAddress: Address_t = TestHelpersJS.Addresses.defaultAddress as any;

export const RelayDepository_RelayErc20Deposit_processEvent: EventFunctions_eventProcessor<Types_RelayDepository_RelayErc20Deposit_event> = TestHelpersJS.RelayDepository.RelayErc20Deposit.processEvent as any;

export const RelayDepository_RelayErc20Deposit_createMockEvent: (args:RelayDepository_RelayErc20Deposit_createMockArgs) => Types_RelayDepository_RelayErc20Deposit_event = TestHelpersJS.RelayDepository.RelayErc20Deposit.createMockEvent as any;

export const RelayDepository_RelayNativeDeposit_processEvent: EventFunctions_eventProcessor<Types_RelayDepository_RelayNativeDeposit_event> = TestHelpersJS.RelayDepository.RelayNativeDeposit.processEvent as any;

export const RelayDepository_RelayNativeDeposit_createMockEvent: (args:RelayDepository_RelayNativeDeposit_createMockArgs) => Types_RelayDepository_RelayNativeDeposit_event = TestHelpersJS.RelayDepository.RelayNativeDeposit.createMockEvent as any;

export const Addresses: { mockAddresses: Address_t[]; defaultAddress: Address_t } = TestHelpersJS.Addresses as any;

export const RelayDepository: { RelayNativeDeposit: { processEvent: EventFunctions_eventProcessor<Types_RelayDepository_RelayNativeDeposit_event>; createMockEvent: (args:RelayDepository_RelayNativeDeposit_createMockArgs) => Types_RelayDepository_RelayNativeDeposit_event }; RelayErc20Deposit: { processEvent: EventFunctions_eventProcessor<Types_RelayDepository_RelayErc20Deposit_event>; createMockEvent: (args:RelayDepository_RelayErc20Deposit_createMockArgs) => Types_RelayDepository_RelayErc20Deposit_event } } = TestHelpersJS.RelayDepository as any;

export const MockDb: { createMockDb: () => TestHelpers_MockDb_t } = TestHelpersJS.MockDb as any;
