module ContractType = {
  @genType
  type t = 
    | @as("RelayDepository") RelayDepository

  let name = "CONTRACT_TYPE"
  let variants = [
    RelayDepository,
  ]
  let config = Internal.makeEnumConfig(~name, ~variants)
}

module EntityType = {
  @genType
  type t = 
    | @as("RelayDepository_RelayErc20Deposit") RelayDepository_RelayErc20Deposit
    | @as("RelayDepository_RelayNativeDeposit") RelayDepository_RelayNativeDeposit
    | @as("dynamic_contract_registry") DynamicContractRegistry

  let name = "ENTITY_TYPE"
  let variants = [
    RelayDepository_RelayErc20Deposit,
    RelayDepository_RelayNativeDeposit,
    DynamicContractRegistry,
  ]
  let config = Internal.makeEnumConfig(~name, ~variants)
}

let allEnums = ([
  ContractType.config->Internal.fromGenericEnumConfig,
  EntityType.config->Internal.fromGenericEnumConfig,
])
