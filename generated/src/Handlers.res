  @genType
module RelayDepository = {
  module RelayErc20Deposit = Types.MakeRegister(Types.RelayDepository.RelayErc20Deposit)
  module RelayNativeDeposit = Types.MakeRegister(Types.RelayDepository.RelayNativeDeposit)
}

@genType /** Register a Block Handler. It'll be called for every block by default. */
let onBlock: (
  Envio.onBlockOptions<Types.chain>,
  Envio.onBlockArgs<Types.handlerContext> => promise<unit>,
) => unit = (
  EventRegister.onBlock: (unknown, Internal.onBlockArgs => promise<unit>) => unit
)->Utils.magic
