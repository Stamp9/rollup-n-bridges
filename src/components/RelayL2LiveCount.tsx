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
} from "../gql/subscriptions";

import BaseIconStatic from "../assets/livecounter_chains/base.png";
import BaseIconRunning from "../assets/cattie1.gif";
import OptimismIconStatic from "../assets/livecounter_chains/op.png";
import OptimismIconRunning from "../assets/cattie2.gif";
import ArbitrumIconStatic from "../assets/livecounter_chains/arb.png";
import ArbitrumIconRunning from "../assets/cattie3.gif";
import EthIconStatic from "../assets/livecounter_chains/eth.png";
import EthIconRunning from "../assets/doggo2.gif";
import PixelBox from "../assets/pixelbox.png";

const CHAINS = [
  {
    name: "Arbitrum",
    id: 42161,
    iconStatic: ArbitrumIconStatic,
    iconRunning: ArbitrumIconRunning,
  },
  {
    name: "Base",
    id: 8453,
    iconStatic: BaseIconStatic,
    iconRunning: BaseIconRunning,
  },
  {
    name: "Optimism",
    id: 10,
    iconStatic: OptimismIconStatic,
    iconRunning: OptimismIconRunning,
  },
  {
    name: "Ethereum",
    id: 1,
    iconStatic: EthIconStatic,
    iconRunning: EthIconRunning,
  },
];

interface RelayDepositEvent {
  event_id: string;
  chain_id: number;
  block_number: number;
  amount: string;
}

const Cat = ({ iconStatic, iconRunning, name, setInfo }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <img
      onMouseOver={() => {
        setHovered(true);
        setInfo(name);
      }}
      onMouseOut={() => {
        setHovered(false);
        setInfo("");
      }}
      src={hovered ? iconRunning : iconStatic}
      alt={name}
      style={{
        position: "absolute",
        left: "-24px",
        width: "22px",
        height: "22px",
        filter: "drop-shadow(1px 1px 1px rgba(0,0,0,0.3))",
      }}
    />
  );
};

export const RelayL2LiveCounter: React.FC = ({ setInfo }) => {
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
      (Object.entries(subs) as [string, any][]).forEach(
        ([chainName, { erc20, native }]) => {
          const e = erc20.data?.RelayDepository_RelayErc20Deposit?.[0];
          const n = native.data?.RelayDepository_RelayNativeDeposit?.[0];
          if (e) handleTx(chainName, e);
          if (n) handleTx(chainName, n);
        },
      );
    }
  }, [started, subs.Base, subs.Optimism, subs.Arbitrum, subs.Ethereum]);

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
          onMouseOver={() => console.log("meow")}
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
          <Cat
            iconRunning={chain.iconRunning}
            iconStatic={chain.iconStatic}
            name={chain.name}
            setInfo={setInfo}
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
