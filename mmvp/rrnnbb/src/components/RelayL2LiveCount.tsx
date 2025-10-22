// src/components/RelayL2LiveCounter.tsx
import React, { useEffect, useRef, useState } from "react";
import { useSubscription } from "@apollo/client/react";
import { RELAY_ERC20_TX_SUBSCRIPTION } from "../data/subscriptions";
import { RELAY_NATIVE_SUBSCRIPTION } from "../data/subscriptions";


import BaseIcon from "../assets/livecounter_chains/base.png";
import OptimismIcon from "../assets/livecounter_chains/op.png";
import ArbitrumIcon from "../assets/livecounter_chains/arb.png";
import  EthIcon from "../assets/livecounter_chains/eth.png";
import Board from "../assets/livecounter_chains/pixelboard.png";
import { data } from "framer-motion/client";

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
  token: string;
  amount: string;
}

interface RelayErc20Data {
  RelayDepository_RelayErc20Deposit: RelayDepositEvent[];
}

interface RelayNativeData {
  RelayDepository_RelayNativeDeposit: RelayDepositEvent[];
}

export const RelayL2LiveCounter: React.FC = () => {
  const { data: erc20Data } = useSubscription<RelayErc20Data>(
    RELAY_ERC20_TX_SUBSCRIPTION
  );
  const { data: nativeData } = useSubscription<RelayNativeData>(
    RELAY_NATIVE_SUBSCRIPTION
  );



  const [counts, setCounts] = useState<Record<string, number>>({
    Arbitrum: 0,
    Base: 0,
    Optimism: 0,
    Scroll: 0,
  });

  const lastEventId = useRef<string | null>(null);

 
  useEffect(() => {
    const erc20Tx = erc20Data?.RelayDepository_RelayErc20Deposit?.[0];
    const nativeTx = nativeData?.RelayDepository_RelayNativeDeposit?.[0];

    const newTx =
      erc20Tx && nativeTx
        ? erc20Tx.block_number > nativeTx.block_number
          ? erc20Tx
          : nativeTx
        : erc20Tx || nativeTx;

    if (!newTx) return;

    if (lastEventId.current === newTx.event_id) return;
    lastEventId.current = newTx.event_id;

    const chain = CHAINS.find((c) => c.id === newTx.chain_id);
    if (!chain) return;

    
    console.log(newTx, "New TX on", chain.name);

    setCounts((prev) => ({
      ...prev,
      [chain.name]: (prev[chain.name] || 0) + 1,
    }));
  }, [erc20Data, nativeData]);

  return (
    <div
      style={{
        position: "fixed",
        top: "5%",
        left: "70%",
        width: "260px",
        height: "auto",
        minHeight: "120px",
        backgroundImage: `url(${Board})`,
        backgroundSize: "100% 100%",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        // border: "2px solid #fff",
        color: "#2b2b2b",
        zIndex: 9999,
        fontSize: "12px",
        justifyContent: "center",
        padding: "24px 28px 18px 28px",
        paddingTop: "48px",
        lineHeight: "1.4",
        display: "inline-block",
        borderRadius: "8px",
        fontFamily: "'Press Start 2P', cursive",
      }}
    >
      {/* <div style={{ fontWeight: "bold", marginBottom: "4px", marginTop:"16px", fontSize: "12px", textAlign: "center" }}>
         Live TX
      </div> */}

      {
        CHAINS.map((chain) => (
          <div
            key={chain.name}
            style={{ display: "flex", alignItems: "center", marginBottom: "4px" }}
          >
            <img
              src={chain.icon}
              alt={chain.name}
              style={{ width: "20px", height: "20px", marginRight: "6px", paddingLeft: "24px" }}
            />
            {chain.name}: <strong>{counts[chain.name] || 0}</strong>
          </div>
        ))
      }

      
    </div>
  );
};
