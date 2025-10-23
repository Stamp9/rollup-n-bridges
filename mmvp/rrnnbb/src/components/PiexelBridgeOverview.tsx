import { useEffect, useState, useRef } from "react";
import { useSubscription } from "@apollo/client/react";
import { motion } from "framer-motion";
import { CustomBlockscoutProvider } from "./PixelBlockscoutProvider";

import islandSrc from "../assets/ethereum.png";
import temBgSrc from "../assets/bg.png";
import ABRuningSrc from "../assets/cattie3.gif";
import OPcatRunningSrc from "../assets/cattie2.gif";
import EthereumRunningSrc from "../assets/doggo2.gif";
import BasecatRunningSrc from "../assets/cattie1.gif";
import relayNodeSrc from "../assets/relay.png";
import SeagulSrc from "../assets/seagul.png";

import {
  NotificationProvider,
  TransactionPopupProvider,
} from "@blockscout/app-sdk";

import { RelayL2LiveCounter } from "./RelayL2LiveCount";
import { TxPanel } from "./PopupCard";
import { TxCount24hPanel } from "./TxCount24hPanel";
import { NodeCircle } from "./NodeCircle";

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

const TX_DURATION_MS = 7_000;
const svgWidth = 900;
const svgHeight = 620;

const islandNode = { id: "Island", type: "L1" as const, x: 220, y: 320 };
const relayNode = { id: "Relay", type: "Bridge" as const, x: 540, y: 320 };
const fallbackDestinationColor = "#64748b";


export const chainNameToCat: Record<string, string> = {
  Ethereum: EthereumRunningSrc,
  Optimism: OPcatRunningSrc,
  Arbitrum: ABRuningSrc,
  Base: BasecatRunningSrc,
};


type ActiveParticle = {
  id: string;
  chainName: string;
  start: number;
  amount: number;
  blockNumber: number;
  chainId: number;
  from: string;
};


export function PiexelBridgeOverview() {
  const [particles, setParticles] = useState<ActiveParticle[]>([]);
  const [activeCat, setActiveCat] = useState<ActiveParticle | null>(null);
  const seenEventIds = useRef<Set<string>>(new Set());
  const [showTxPanel, setShowTxPanel] = useState(false);


  /** 🧩 Generic handler for new events */
  const handleIncoming = (chainName: string, data: any) => {
    const e = data?.RelayDepository_RelayErc20Deposit?.[0];
    const n = data?.RelayDepository_RelayNativeDeposit?.[0];
    const tx = e || n;
    if (!tx) return;

    if (seenEventIds.current.has(tx.event_id)) return;
    seenEventIds.current.add(tx.event_id);

    const id = `${tx.event_id}-${Date.now()}`;
    const p = {
        id,
        chainName,
        start: Date.now(),
        amount: Number(tx.amount ?? 0),
        blockNumber: tx.block_number ?? 0,
        chainId: tx.chain_id ?? 0,
        from: tx.from ?? "Unknown",
  };

    setParticles((prev) => [...prev, p]);
    console.log(`[🐾 New TX ${chainName}]`, tx);
  };

  /** 🛰️ Use Apollo `onData` callback for every new push */
  useSubscription(ERC20_BASE_SUB, {
    onData: ({ data }) => handleIncoming("Base", data.data),
  });
  useSubscription(ERC20_OPTIMISM_SUB, {
    onData: ({ data }) => handleIncoming("Optimism", data.data),
  });
  useSubscription(ERC20_ARBITRUM_SUB, {
    onData: ({ data }) => handleIncoming("Arbitrum", data.data),
  });
  useSubscription(ERC20_ETHEREUM_SUB, {
    onData: ({ data }) => handleIncoming("Ethereum", data.data),
  });
  useSubscription(NATIVE_BASE_SUB, {
    onData: ({ data }) => handleIncoming("Base", data.data),
  });
  useSubscription(NATIVE_OPTIMISM_SUB, {
    onData: ({ data }) => handleIncoming("Optimism", data.data),
  });
  useSubscription(NATIVE_ARBITRUM_SUB, {
    onData: ({ data }) => handleIncoming("Arbitrum", data.data),
  });
  useSubscription(NATIVE_ETHEREUM_SUB, {
    onData: ({ data }) => handleIncoming("Ethereum", data.data),
  });

  /** Auto-remove old cats */
  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      setParticles((prev) => prev.filter((p) => now - p.start < TX_DURATION_MS));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  /** 🐈 Render animated cat */
  const renderCat = (p: ActiveParticle) => {
    const catSrc = chainNameToCat[p.chainName] ?? BasecatRunningSrc;
    const duration = TX_DURATION_MS / 1000;

    // Multi-lane offset for each chain
    const yOffset = {
      Base: 0,
      Optimism: 10,
      Arbitrum: -20,
      Ethereum: 20,
    }[p.chainName] ?? 0;

    return (
      <motion.image
        key={p.id}
        href={catSrc}
        width={60}
        height={40}
        x={0}
        y={320 + yOffset}
        initial={{ x: 220, opacity: 0 }}
        animate={{ x: 540, opacity: [0, 1, 0.9, 0] }}
        transition={{ duration, ease: "easeInOut" }}
        onMouseOver={() => setActiveCat(p)}
        style={{
          transformOrigin: "center",
          filter: "drop-shadow(0 0 3px rgba(255,255,255,0.6))",
          cursor: "pointer",
        }}
      />
    );
  };

  return (
      <>
        {/* Panels */}
        {showTxPanel && (
          <div className="fixed top-4 right-4 z-[10000] pointer-events-auto">
            <TxCount24hPanel />
          </div>
        )}
        <CustomBlockscoutProvider>
        <div className="fixed bottom-4 left-4 z-[10000] pointer-events-auto">
          {activeCat ? <TxPanel 
            cat={{ ...activeCat }} /> : null}
        </div>
      </CustomBlockscoutProvider>


        <RelayL2LiveCounter />

        {/* Title */}
        <header
          style={{
            position: "absolute",
            top: "2%",
            left: "20%",
            transform: "translateX(-50%)",
            width: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 30,
          }}
        >
          <h1
            style={{
              fontFamily: "'Press Start 2P', cursive",
              fontSize: "20px",
              color: "#f8fafc",
              textShadow: "2px 2px 0 #38bdf8, 4px 4px 0 #1e3a8a",
              letterSpacing: "2px",
            }}
          >
            Envio Gato
          </h1>
        </header>

        {/* 🐦 Pixel Seagull toggle button */}
        <div
          onClick={() => setShowTxPanel((prev) => !prev)}
          style={{
            position: "fixed",
            bottom: "24px",
            right: "24px",
            width: "128px",
            height: "128px",
            backgroundImage: `url(${SeagulSrc})`,
            backgroundSize: "contain",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
            cursor: "pointer",
            zIndex: 11000,
            imageRendering: "pixelated",
            transition: "transform 0.1s ease",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.1)")}
          onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1.0)")}
          title={showTxPanel ? "Hide 24h TX Panel" : "Show 24h TX Panel"}
        />


        {/* Scene */}
        <div
          style={{
            position: "fixed",
            width: "100%",
            height: "100%",
            display: "flex",
            justifyContent: "center",
            backgroundImage: `url(${temBgSrc})`,
            backgroundSize: "100% 100%",
            backgroundPosition: "center",
          }}
        >
          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            preserveAspectRatio="xMidYMid meet"
            style={{ width: "100%", height: "auto", background: "transparent" }}
          >
            <image
              href={islandSrc}
              x={islandNode.x - 110}
              y={islandNode.y - 110}
              width={220}
              height={220}
              preserveAspectRatio="xMidYMid slice"
              style={{
                filter: "drop-shadow(0 0 20px rgba(56, 189, 248, 0.35))",
              }}
            />

            <NodeCircle
              x={relayNode.x}
              y={relayNode.y}
              label={relayNode.id}
              type={relayNode.type}
              imageSrc={relayNodeSrc}
              imageRadius={72}
            />

            {particles.map(renderCat)}
          </svg>
        </div>

      </>
  );
}


