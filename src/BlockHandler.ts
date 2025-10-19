import { onBlock } from "generated";

[
  {
    name: "OP",
    chain: 10 as const,
    startBlock: 119534316,
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
