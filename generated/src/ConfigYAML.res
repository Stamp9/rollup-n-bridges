
type hyperSyncConfig = {endpointUrl: string}
type hyperFuelConfig = {endpointUrl: string}

@genType.opaque
type rpcConfig = {
  syncConfig: InternalConfig.sourceSync,
}

@genType
type syncSource = HyperSync(hyperSyncConfig) | HyperFuel(hyperFuelConfig) | Rpc(rpcConfig)

@genType.opaque
type aliasAbi = Ethers.abi

type eventName = string

type contract = {
  name: string,
  abi: aliasAbi,
  addresses: array<string>,
  events: array<eventName>,
}

type configYaml = {
  syncSource,
  startBlock: int,
  confirmedBlockThreshold: int,
  contracts: dict<contract>,
  lowercaseAddresses: bool,
}

let publicConfig = ChainMap.fromArrayUnsafe([
  {
    let contracts = Js.Dict.fromArray([
      (
        "RelayDepository",
        {
          name: "RelayDepository",
          abi: Types.RelayDepository.abi,
          addresses: [
            "0x4cD00E387622C35bDDB9b4c962C136462338BC31",
          ],
          events: [
            Types.RelayDepository.RelayErc20Deposit.name,
            Types.RelayDepository.RelayNativeDeposit.name,
          ],
        }
      ),
    ])
    let chain = ChainMap.Chain.makeUnsafe(~chainId=1)
    (
      chain,
      {
        confirmedBlockThreshold: 200,
        syncSource: HyperSync({endpointUrl: "https://1.hypersync.xyz"}),
        startBlock: 0,
        contracts,
        lowercaseAddresses: false
      }
    )
  },
  {
    let contracts = Js.Dict.fromArray([
      (
        "RelayDepository",
        {
          name: "RelayDepository",
          abi: Types.RelayDepository.abi,
          addresses: [
            "0x4cD00E387622C35bDDB9b4c962C136462338BC31",
          ],
          events: [
            Types.RelayDepository.RelayErc20Deposit.name,
            Types.RelayDepository.RelayNativeDeposit.name,
          ],
        }
      ),
    ])
    let chain = ChainMap.Chain.makeUnsafe(~chainId=10)
    (
      chain,
      {
        confirmedBlockThreshold: 0,
        syncSource: HyperSync({endpointUrl: "https://10.hypersync.xyz"}),
        startBlock: 0,
        contracts,
        lowercaseAddresses: false
      }
    )
  },
  {
    let contracts = Js.Dict.fromArray([
      (
        "RelayDepository",
        {
          name: "RelayDepository",
          abi: Types.RelayDepository.abi,
          addresses: [
            "0x4cD00E387622C35bDDB9b4c962C136462338BC31",
          ],
          events: [
            Types.RelayDepository.RelayErc20Deposit.name,
            Types.RelayDepository.RelayNativeDeposit.name,
          ],
        }
      ),
    ])
    let chain = ChainMap.Chain.makeUnsafe(~chainId=8453)
    (
      chain,
      {
        confirmedBlockThreshold: 200,
        syncSource: HyperSync({endpointUrl: "https://8453.hypersync.xyz"}),
        startBlock: 0,
        contracts,
        lowercaseAddresses: false
      }
    )
  },
])

@genType
let getGeneratedByChainId: int => configYaml = chainId => {
  let chain = ChainMap.Chain.makeUnsafe(~chainId)
  if !(publicConfig->ChainMap.has(chain)) {
    Js.Exn.raiseError(
      "No chain with id " ++ chain->ChainMap.Chain.toString ++ " found in config.yaml",
    )
  }
  publicConfig->ChainMap.get(chain)
}
