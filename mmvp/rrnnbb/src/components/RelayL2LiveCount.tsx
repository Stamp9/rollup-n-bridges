// src/components/RelayL2LiveCounter.tsx
import React, { useEffect, useRef, useState } from "react";
import { useSubscription } from "@apollo/client/react";
import {
  ERC20_BASE_SUB,
  ERC20_OPTIMISM_SUB,
  ERC20_ARBITRUM_SUB,
  ERC20_ETHEREUM_SUB,
  NATIVE_BASE_SUB,
  NATIVE_OPTIMISM_SUB,
  NATIVE_ARBITRUM_SUB,
  NATIVE_ETHEREUM_SUB,
} from "../data/subscriptions";

import BaseIcon from "../assets/livecounter_chains/base.png";
import OptimismIcon from "../assets/livecounter_chains/op.png";
import ArbitrumIcon from "../assets/livecounter_chains/arb.png";
import EthIcon from "../assets/livecounter_chains/eth.png";
import PixelBox from "../assets/pixelbox.png";

const CHAINS = [
  { name: "Arbitrum", id: 42161, icon: ArbitrumIcon },
  { name: "Base", id: 8453, icon: BaseIcon },
  { name: "Optimism", id: 10, icon: OptimismIcon },
  { name: "Ethereum", id: 1, icon: EthIcon },
];

interface RelayDepositEvent {
  event_id: string;
  chain_id: number;
  block_number: number;
  amount: string;
}

export const RelayL2LiveCounter: React.FC = () => {
  const subs = {
    Base: {
      erc20: useSubscription(ERC20_BASE_SUB),
      native: useSubscription(NATIVE_BASE_SUB),
    },
    Optimism: {
      erc20: useSubscription(ERC20_OPTIMISM_SUB),
      native: useSubscription(NATIVE_OPTIMISM_SUB),
    },
    Arbitrum: {
      erc20: useSubscription(ERC20_ARBITRUM_SUB),
      native: useSubscription(NATIVE_ARBITRUM_SUB),
    },
    Ethereum: {
      erc20: useSubscription(ERC20_ETHEREUM_SUB),
      native: useSubscription(NATIVE_ETHEREUM_SUB),
    },
  };

  const [counts, setCounts] = useState<Record<string, number>>({
    Arbitrum: 0,
    Base: 0,
    Optimism: 0,
    Ethereum: 0,
  });

  const seenEventIds = useRef<Set<string>>(new Set());
  const [started, setStarted] = useState(false);

  const handleTx = (chainName: string, tx: RelayDepositEvent | undefined) => {
    if (!tx || seenEventIds.current.has(tx.event_id)) return;
    seenEventIds.current.add(tx.event_id);
    setCounts((prev) => ({
      ...prev,
      [chainName]: (prev[chainName] || 0) + 1,
    }));
  };

  useEffect(() => {
    const anyData =
      subs.Base.erc20.data ||
      subs.Base.native.data ||
      subs.Optimism.erc20.data ||
      subs.Optimism.native.data ||
      subs.Arbitrum.erc20.data ||
      subs.Arbitrum.native.data ||
      subs.Ethereum.erc20.data ||
      subs.Ethereum.native.data;

    if (!started && anyData) {
      console.log("[⏸️ Skip initial historical data]");
      setStarted(true);
      return;
    }

    if (started) {
      (Object.entries(subs) as [string, any][]).forEach(([chainName, { erc20, native }]) => {
        const e = erc20.data?.RelayDepository_RelayErc20Deposit?.[0];
        const n = native.data?.RelayDepository_RelayNativeDeposit?.[0];
        if (e) handleTx(chainName, e);
        if (n) handleTx(chainName, n);
      });
    }
  }, [
    started,
    subs.Base,
    subs.Optimism,
    subs.Arbitrum,
    subs.Ethereum,
  ]);

  return (
    <div
      style={{
        position: "fixed",
        top: "5%",
        right: "5%",
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "2px 24px",
        zIndex: 1000,
        fontFamily: "'Press Start 2P', cursive",
        fontSize: "10px",
        color: "white",
      }}
    >
      {CHAINS.map((chain) => (
        <div
          key={chain.name}
          style={{
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "140px",
            height: "42px",
          }}
        >
          <img
            src={chain.icon}
            alt={chain.name}
            style={{
              position: "absolute",
              left: "-24px",
              width: "22px",
              height: "22px",
              filter: "drop-shadow(1px 1px 1px rgba(0,0,0,0.3))",
            }}
          />

          <div
            style={{
              backgroundImage: `url(${PixelBox})`,
              backgroundSize: "100% 100%",
              backgroundRepeat: "no-repeat",
              width: "80%",
              height: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "right",
              padding: "4px 10px",
              marginRight: "8px",
            }}
          >
            <strong>{counts[chain.name] || 0}</strong>
          </div>
        </div>
      ))}
    </div>
  );
};
