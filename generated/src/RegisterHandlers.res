@val external require: string => unit = "require"

let registerContractHandlers = (
  ~contractName,
  ~handlerPathRelativeToRoot,
  ~handlerPathRelativeToConfig,
) => {
  try {
    require(`../${Path.relativePathToRootFromGenerated}/${handlerPathRelativeToRoot}`)
  } catch {
  | exn =>
    let params = {
      "Contract Name": contractName,
      "Expected Handler Path": handlerPathRelativeToConfig,
      "Code": "EE500",
    }
    let logger = Logging.createChild(~params)

    let errHandler = exn->ErrorHandling.make(~msg="Failed to import handler file", ~logger)
    errHandler->ErrorHandling.log
    errHandler->ErrorHandling.raiseExn
  }
}

%%private(
  let makeGeneratedConfig = () => {
    let chains = [
      {
        let contracts = [
          {
            InternalConfig.name: "RelayDepository",
            abi: Types.RelayDepository.abi,
            addresses: [
              "0x4cD00E387622C35bDDB9b4c962C136462338BC31"->Address.Evm.fromStringOrThrow
,
            ],
            events: [
              (Types.RelayDepository.RelayErc20Deposit.register() :> Internal.eventConfig),
              (Types.RelayDepository.RelayNativeDeposit.register() :> Internal.eventConfig),
            ],
            startBlock: None,
          },
        ]
        let chain = ChainMap.Chain.makeUnsafe(~chainId=1)
        {
          InternalConfig.confirmedBlockThreshold: 200,
          startBlock: 23635000,
          id: 1,
          contracts,
          sources: NetworkSources.evm(~chain, ~contracts=[{name: "RelayDepository",events: [Types.RelayDepository.RelayErc20Deposit.register(), Types.RelayDepository.RelayNativeDeposit.register()],abi: Types.RelayDepository.abi}], ~hyperSync=Some("https://1.hypersync.xyz"), ~allEventSignatures=[Types.RelayDepository.eventSignatures]->Belt.Array.concatMany, ~shouldUseHypersyncClientDecoder=true, ~rpcs=[], ~lowercaseAddresses=false)
        }
      },
      {
        let contracts = [
          {
            InternalConfig.name: "RelayDepository",
            abi: Types.RelayDepository.abi,
            addresses: [
              "0x4cD00E387622C35bDDB9b4c962C136462338BC31"->Address.Evm.fromStringOrThrow
,
            ],
            events: [
              (Types.RelayDepository.RelayErc20Deposit.register() :> Internal.eventConfig),
              (Types.RelayDepository.RelayNativeDeposit.register() :> Internal.eventConfig),
            ],
            startBlock: None,
          },
        ]
        let chain = ChainMap.Chain.makeUnsafe(~chainId=10)
        {
          InternalConfig.confirmedBlockThreshold: 0,
          startBlock: 142780800,
          id: 10,
          contracts,
          sources: NetworkSources.evm(~chain, ~contracts=[{name: "RelayDepository",events: [Types.RelayDepository.RelayErc20Deposit.register(), Types.RelayDepository.RelayNativeDeposit.register()],abi: Types.RelayDepository.abi}], ~hyperSync=Some("https://10.hypersync.xyz"), ~allEventSignatures=[Types.RelayDepository.eventSignatures]->Belt.Array.concatMany, ~shouldUseHypersyncClientDecoder=true, ~rpcs=[], ~lowercaseAddresses=false)
        }
      },
      {
        let contracts = [
          {
            InternalConfig.name: "RelayDepository",
            abi: Types.RelayDepository.abi,
            addresses: [
              "0x4cD00E387622C35bDDB9b4c962C136462338BC31"->Address.Evm.fromStringOrThrow
,
            ],
            events: [
              (Types.RelayDepository.RelayErc20Deposit.register() :> Internal.eventConfig),
              (Types.RelayDepository.RelayNativeDeposit.register() :> Internal.eventConfig),
            ],
            startBlock: None,
          },
        ]
        let chain = ChainMap.Chain.makeUnsafe(~chainId=8453)
        {
          InternalConfig.confirmedBlockThreshold: 200,
          startBlock: 37185500,
          id: 8453,
          contracts,
          sources: NetworkSources.evm(~chain, ~contracts=[{name: "RelayDepository",events: [Types.RelayDepository.RelayErc20Deposit.register(), Types.RelayDepository.RelayNativeDeposit.register()],abi: Types.RelayDepository.abi}], ~hyperSync=Some("https://8453.hypersync.xyz"), ~allEventSignatures=[Types.RelayDepository.eventSignatures]->Belt.Array.concatMany, ~shouldUseHypersyncClientDecoder=true, ~rpcs=[], ~lowercaseAddresses=false)
        }
      },
      {
        let contracts = [
          {
            InternalConfig.name: "RelayDepository",
            abi: Types.RelayDepository.abi,
            addresses: [
              "0x4cD00E387622C35bDDB9b4c962C136462338BC31"->Address.Evm.fromStringOrThrow
,
            ],
            events: [
              (Types.RelayDepository.RelayErc20Deposit.register() :> Internal.eventConfig),
              (Types.RelayDepository.RelayNativeDeposit.register() :> Internal.eventConfig),
            ],
            startBlock: None,
          },
        ]
        let chain = ChainMap.Chain.makeUnsafe(~chainId=42161)
        {
          InternalConfig.confirmedBlockThreshold: 0,
          startBlock: 0,
          id: 42161,
          contracts,
          sources: NetworkSources.evm(~chain, ~contracts=[{name: "RelayDepository",events: [Types.RelayDepository.RelayErc20Deposit.register(), Types.RelayDepository.RelayNativeDeposit.register()],abi: Types.RelayDepository.abi}], ~hyperSync=Some("https://42161.hypersync.xyz"), ~allEventSignatures=[Types.RelayDepository.eventSignatures]->Belt.Array.concatMany, ~shouldUseHypersyncClientDecoder=true, ~rpcs=[], ~lowercaseAddresses=false)
        }
      },
    ]

    Config.make(
      ~shouldRollbackOnReorg=true,
      ~shouldSaveFullHistory=false,
      ~isUnorderedMultichainMode=false,
      ~chains,
      ~enableRawEvents=false,
      ~batchSize=?Env.batchSize,
      ~preloadHandlers=false,
      ~lowercaseAddresses=false,
      ~shouldUseHypersyncClientDecoder=true,
    )
  }

  let config: ref<option<Config.t>> = ref(None)
)

let registerAllHandlers = () => {
  let configWithoutRegistrations = makeGeneratedConfig()
  EventRegister.startRegistration(
    ~ecosystem=configWithoutRegistrations.ecosystem,
    ~multichain=configWithoutRegistrations.multichain,
    ~preloadHandlers=configWithoutRegistrations.preloadHandlers,
  )

  registerContractHandlers(
    ~contractName="RelayDepository",
    ~handlerPathRelativeToRoot="src/EventHandlers.ts",
    ~handlerPathRelativeToConfig="src/EventHandlers.ts",
  )

  let generatedConfig = {
    // Need to recreate initial config one more time,
    // since configWithoutRegistrations called register for event
    // before they were ready
    ...makeGeneratedConfig(),
    registrations: Some(EventRegister.finishRegistration()),
  }
  config := Some(generatedConfig)
  generatedConfig
}

let getConfig = () => {
  switch config.contents {
  | Some(config) => config
  | None => registerAllHandlers()
  }
}

let getConfigWithoutRegistrations = makeGeneratedConfig
