import { useEffect, useState } from "react";

import { useSubscription } from "@apollo/client/react";
import islandSrc from "../assets/ethereum.png";
import temBgSrc from "../assets/bg.png";
import catWaitingSrc from "../assets/cat_wating.png";
import OPcatRunningSrc from "../assets/cattie2.gif";
import BasecatRunningSrc from "../assets/cattie1.gif";
import relayNodeSrc from "../assets/relay.png";

import { tokenColors } from "../data/model";
import { RelayL2LiveCounter } from "./RelayL2LiveCount";
import { TxCount24hPanel } from "./TxCount24hPanel";
import { NodeCircle } from "./NodeCircle";
import {
  RELAY_ERC20_TX_SUBSCRIPTION,
  RELAY_NATIVE_SUBSCRIPTION,
} from "../data/subscriptions";

const TX_DURATION_MS = 7_000;

// Amount of time between each query to the Envio indexer.
export const QUERY_TICK = 3_000;

const islandNode = { id: "Island", type: "L1" as const, x: 220, y: 320 };

const bridgeProtocols = [
  {
    name: "Relay",
    hue: "#38bdf8",
    node: { id: "Relay", type: "Bridge" as const, x: 540, y: 320 },
  },
] as const;

const svgWidth = 900;
const svgHeight = 620;

const fallbackDestinationColor = "#64748b";

function renderCat(p: any, flow: any, txDelay: any, lanePath: any) {
  const catSrc =
    flow.name === "Base"
      ? BasecatRunningSrc
      : flow.name === "Optimism"
      ? OPcatRunningSrc
      : catWaitingSrc;

  const minSize = 6;
  const maxSize = 12;
  const baseScale = Math.log10(Math.max(1, p.amount + 1));
  const normalized = Math.min(1, baseScale / 6);
  const catSize = minSize + (maxSize - minSize) * normalized;

  return (
    <image
      key={`cat--${p.id}-${p.start}`}
      href={catSrc}
      x={0}
      y={0}
      width={catSize * 4.8}
      height={catSize * 3.2}
      preserveAspectRatio="xMidYMid meet"
      style={{
        transform: `translate(${-p.size * 1.2}px, ${-p.size * 1.1}px)`,
      }}
    >
      <animateMotion
        dur={`${TX_DURATION_MS / 1000}s`}
        repeatCount="indefinite"
        path={lanePath}
        rotate="auto"
        begin={`${txDelay}s`}
      />
    </image>
  );
}

export function PiexelBridgeOverview() {
   const { data: nativeData } = useSubscription(RELAY_NATIVE_SUBSCRIPTION);
   const { data: ercData } = useSubscription(RELAY_ERC20_TX_SUBSCRIPTION);

   useEffect(() => {
     if (nativeData) console.log("[🔔 New Native Tx]", nativeData);
     if (ercData) console.log("[🔔 New ERC20 Tx]", ercData);
   }, [nativeData, ercData]);

   type ActiveParticle = {
     id: string;
     token?: string;
     amount: number;
     color: string;
     size: number;
     start: number;
     timestamp: number;
     chainId?: number;
     chainName?: string;
     beginOffsetSec: number;
   };

   const TICK_MS = QUERY_TICK;
   const MAX_ACTIVE = 24;

   const [particles, setParticles] = useState<ActiveParticle[]>([]);

   const stableHash = (s: string) =>
     [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) | 0, 0) >>> 0;

   const chainIdToName = (chainId?: number) =>
     chainId === 10 ? "Optimism" : chainId === 8453 ? "Base" : "Unknown";

   const colorForTx = (token?: string, fallback = fallbackDestinationColor) =>
     (token && tokenColors[token]) || fallback;

   useEffect(() => {
     const pushFromRelayNative = (raw: any) => {
       const tx = raw?.RelayDepository_RelayNativeDeposit?.[0];
       if (!tx) return;
       const id =
         tx.id ?? tx.event_id ?? `${tx.chain_id}-${tx.block_number}-${Date.now()}`;
       const amount = Number(tx.amount ?? 0);
       const chainId = Number(tx.chain_id ?? 0);
       const beginOffsetSec =
         ((stableHash(String(id)) % 1000) / 1000) * (TX_DURATION_MS / 1000);
       const p: ActiveParticle = {
         id,
         amount,
         color: colorForTx("ETH"),
         size: Math.max(6, Math.log10(Math.max(1, amount + 1)) * 4),
         start: Date.now(),
         timestamp: Date.now(),
         chainId,
         chainName: chainIdToName(chainId),
         beginOffsetSec,
       };
       setParticles((prev) => [p, ...prev].slice(0, MAX_ACTIVE));
     };

     const pushFromRelayErc20 = (raw: any) => {
       const tx = raw?.RelayDepository_RelayErc20Deposit?.[0];
       if (!tx) return;
       const id =
         tx.id ?? tx.event_id ?? `${tx.chain_id}-${tx.block_number}-${Date.now()}`;
       const amount = Number(tx.amount ?? 0);
       const chainId = Number(tx.chain_id ?? 0);
       const beginOffsetSec =
         ((stableHash(String(id)) % 1000) / 1000) * (TX_DURATION_MS / 1000);
       const token = tx.token ?? "ERC20";
       const p: ActiveParticle = {
         id,
         token,
         amount,
         color: colorForTx(token),
         size: Math.max(6, Math.log10(Math.max(1, amount + 1)) * 4),
         start: Date.now(),
         timestamp: Date.now(),
         chainId,
         chainName: chainIdToName(chainId),
         beginOffsetSec,
       };
       setParticles((prev) => [p, ...prev].slice(0, MAX_ACTIVE));
     };

     if (nativeData) pushFromRelayNative(nativeData);
     if (ercData) pushFromRelayErc20(ercData);
   }, [nativeData, ercData]);

   useEffect(() => {
     const tick = () => {
       const now = Date.now();
       setParticles((prev) => prev.filter((p) => p.start + TX_DURATION_MS > now));
     };
     const id = window.setInterval(tick, TICK_MS);
     return () => window.clearInterval(id);
   }, []);

   const relayNode = bridgeProtocols.find((b) => b.node.id === "Relay")!.node;
   const lanePath = `M ${islandNode.x} ${islandNode.y} L ${relayNode.x} ${relayNode.y}`;

   return (
     <>
       <div className="fixed top-4 right-4 z-[10000] pointer-events-auto">
         <TxCount24hPanel />
       </div>

       <RelayL2LiveCounter />

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
           pointerEvents: "none",
         }}
       >
         <h1
           style={{
             fontFamily: "'Press Start 2P', cursive",
             fontSize: "20px",
             color: "#f8fafc",
             textShadow: "2px 2px 0 #38bdf8, 4px 4px 0 #1e3a8a",
             letterSpacing: "2px",
             textAlign: "center",
           }}
         >
           Envio Gato
         </h1>
       </header>

       <div
         style={{
           position: "fixed",
           width: "100%",
           margin: 0,
           padding: 0,
           boxSizing: "border-box",
           display: "flex",
           justifyContent: "center",
           backgroundImage: `url(${temBgSrc})`,
           backgroundSize: "100% 100%",
           backgroundPosition: "center",
           backgroundRepeat: "no-repeat",
         }}
       >
         <div
           style={{
             display: "flex",
             justifyContent: "center",
             width: "100%",
             maxWidth: "1200px",
             padding: "2.5rem 2rem",
           }}
         >
           <svg
             viewBox={`0 0 ${svgWidth} ${svgHeight}`}
             preserveAspectRatio="xMidYMid meet"
             style={{ width: "100%", height: "auto", background: "transparent" }}
           >
             <defs>
               {bridgeProtocols.map((protocol) => (
                 <radialGradient
                   id={`piexelBridgeGlow-${protocol.name}`}
                   cx="50%"
                   cy="50%"
                   r="70%"
                   key={protocol.name}
                 >
                   <stop offset="0%" stopColor={protocol.hue} stopOpacity={0.45} />
                   <stop offset="100%" stopColor={protocol.hue} stopOpacity={0.1} />
                 </radialGradient>
               ))}
             </defs>

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

             {bridgeProtocols.map((protocol) => (
               <NodeCircle
                 key={`piexel-node-${protocol.name}`}
                 x={protocol.node.x}
                 y={protocol.node.y}
                 label={protocol.node.id}
                 type={protocol.node.type}
                 imageSrc={protocol.node.id === "Relay" ? relayNodeSrc : undefined}
                 imageRadius={protocol.node.id === "Relay" ? 72 : undefined}
               />
             ))}

             {particles.map((p) =>
               renderCat(p, { name: p.chainName ?? "Unknown" }, p.beginOffsetSec, lanePath),
             )}
           </svg>
         </div>
       </div>
     </>
   );
}
