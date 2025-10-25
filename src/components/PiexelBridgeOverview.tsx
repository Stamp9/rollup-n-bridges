import { useEffect, useState, useRef } from "react";
import { useSubscription } from "@apollo/client/react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { CustomBlockscoutProvider } from "./PixelBlockscoutProvider";

import PixelBox from "../assets/pixelbox.png";
import temBgSrc from "../assets/bg_new.png";
import Islands from "../assets/islands.gif";
import ABRuningSrc from "../assets/cattie3.gif";
import OPcatRunningSrc from "../assets/cattie2.gif";
import EthereumRunningSrc from "../assets/doggo2.gif";
import BasecatRunningSrc from "../assets/cattie1.gif";
import SeagulSrc from "../assets/seagul.png";
import ahhhh from '../assets/seagullsound.mp3'

import Fries from "../assets/rnb.png";


import { RelayL2LiveCounter } from "./RelayL2LiveCount";
import { TxPanel } from "./TxPanel";
import { TxCount24hPanel } from "./TxCount24hPanel";


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

const TX_DURATION_MS = 7_000;
const svgWidth = 900;
const svgHeight = 620;

const islandNode = { id: "Island", type: "L1" as const, x: 220, y: 320 };


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
  txHash: string;
  from: string;
};


export function PiexelBridgeOverview() {
  const audio = new Audio(ahhhh)

  const [particles, setParticles] = useState<ActiveParticle[]>([]);
  const [activeCat, setActiveCat] = useState<ActiveParticle | null>(null);
  const seenEventIds = useRef<Set<string>>(new Set());
  const [showTxPanel, setShowTxPanel] = useState(false);
  const [info, setInfo] = useState("");
  const navigate = useNavigate();



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
      txHash: tx.tx_hash ?? "",
      from: tx.from ?? "Unknown",
    };
    console.log("New blocknumber:", p.blockNumber);

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
      Arbitrum: -10,
      Base: 0,
      Optimism: 10,
      Ethereum: 15,
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
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          backgroundImage: `url(${temBgSrc})`,
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center center",
          zIndex: 0,
        }}
      />

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


      <RelayL2LiveCounter setInfo={setInfo} />

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
        onClick={() => {
          audio.play();
          setShowTxPanel((prev) => !prev);
        }}
        style={{
          position: "fixed",
          bottom: "3%",
          right: "2%",
          width: "128px",
          height: "128px",
          backgroundImage: `url(${SeagulSrc})`,
          backgroundSize: "contain",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          cursor: "pointer",
          zIndex: 1002,
          imageRendering: "pixelated",
          transition: "transform 0.1s ease",
        }}
        onMouseEnter={(e) => {

          setInfo("Tx 24hr stats");
          e.currentTarget.style.transform = "scale(1.1)";
        }}
        onMouseLeave={(e) => {
          setInfo("");
          e.currentTarget.style.transform = "scale(1.0)";
        }}
        title={showTxPanel ? "Hide 24h TX Panel" : "Show 24h TX Panel"}
      />

      <div
        onClick={() => navigate("/about")}
        style={{
          position: "fixed",
          bottom: "3%",
          right: "10%",
          width: "48px",
          height: "48px",
          backgroundImage: `url(${Fries})`,
          backgroundSize: "contain",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          cursor: "pointer",
          zIndex: 1002,
          imageRendering: "pixelated",
          transition: "transform 0.1s ease",
        }}
        onMouseEnter={(e) => {
          setInfo("About");
          e.currentTarget.style.transform = "scale(1.1)";
        }
        }
        onMouseLeave={(e) => {
          setInfo("");
          e.currentTarget.style.transform = "scale(1.0)";
        }}
        title="Go to About"
      />




      {/* Scene */}


      <svg
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        preserveAspectRatio="xMidYMid meet"
        style={{ width: "100%", height: "auto", background: "transparent", zIndex: 20, position: "fixed" }}
      >

        <image
          href={Islands}
          x={islandNode.x - 110}
          y={islandNode.y - 110}
          width={600}
          height={300}
          preserveAspectRatio="xMidYMid slice"
          style={{
            filter: "drop-shadow(0 0 20px rgba(56, 189, 248, 0.35))",
            zIndex: 1000,
          }}
        />
        <g>
          <rect
            x={islandNode.x - 50}
            y={islandNode.y - 50}
            width={200}
            height={220}
            fill="red"
            fillOpacity={0}
            pointerEvents="all"
            onMouseOver={() => setInfo("Ethereum Island")}
            onMouseOut={() => setInfo("")}
          />
          <rect
            x={islandNode.x + 250}
            y={islandNode.y - 50}
            width={200}
            height={220}
            fill="blue"
            fillOpacity={0}
            pointerEvents="all"
            onMouseOver={() => setInfo("Relay Hub")}
            onMouseOut={() => setInfo("")}
          />
        </g>
        {particles.map(renderCat)}
      </svg >


      {info !== "" && (
        <div>
          <div
            style={{
              backgroundImage: `url(${PixelBox})`,
              backgroundSize: "100% 100%",
              backgroundRepeat: "no-repeat",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "4px 10px",
              textAlign: "center",
              bottom: "5%",
              marginRight: "8px",
              position: "fixed",
              width: 120,
              minHeight: 40,
              maxHeight: 120,
              backgroundPosition: "center",
              zIndex: 1000,
              color: "white",
              fontSize: 12,
              lineHeight: 1.4,
              borderRadius: 8,
              fontFamily: "'Press Start 2P', cursive",
              pointerEvents: "auto",
            }}
          >
            <strong>{info}</strong>
          </div>
        </div>
      )
      }

    </>
  );
}
