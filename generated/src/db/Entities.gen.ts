/* TypeScript file generated from Entities.res by genType. */

/* eslint-disable */
/* tslint:disable */

export type id = string;

export type whereOperations<entity,fieldType> = { readonly eq: (_1:fieldType) => Promise<entity[]>; readonly gt: (_1:fieldType) => Promise<entity[]> };

export type RelayDepository_RelayErc20Deposit_t = {
  readonly amount: bigint; 
  readonly block_number: number; 
  readonly event_id: string; 
  readonly from: string; 
  readonly id: id; 
  readonly token: string
};

export type RelayDepository_RelayErc20Deposit_indexedFieldOperations = {};

export type RelayDepository_RelayNativeDeposit_t = {
  readonly amount: bigint; 
  readonly block_number: number; 
  readonly event_id: string; 
  readonly from: string; 
  readonly id: id
};

export type RelayDepository_RelayNativeDeposit_indexedFieldOperations = {};
