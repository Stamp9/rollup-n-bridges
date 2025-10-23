"use client";
import React from "react";
import { useRelay24hAutoRefresh } from "./useRelay24hCounts"; 
import Board from "../assets/livecounter_chains/pixelboard.png";

console.log("[TxCount24hPanel] mounted");


export const TxCount24hPanel: React.FC = () => {
  const { perChain, total } = useRelay24hAutoRefresh();

  // console.log("[24h counts render]", perChain, total);

  if (!perChain?.length) {
    return (
      <div
        style={{
          position: "fixed",
          top: "70%",
          left: "70%",
          width: 260,
          height: 200,
          backgroundImage: `url(${Board})`,
          backgroundSize: "100% 100%",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          color: "#2b2b2b",
          zIndex: 10000,
          fontSize: 12,
          padding: "48px 28px 18px 28px",
          lineHeight: 1.4,
          borderRadius: 8,
          fontFamily: "'Press Start 2P', cursive",
          marginTop: "-100px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
        }}
      >
        Loading 24h data...
      </div>
    );
  }

  return (
    <div
      style={{
        position: "fixed",
        top: "70%",
        left: "70%",
        width: 260,
        minHeight: 200,
        backgroundImage: `url(${Board})`,
        backgroundSize: "100% 100%",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        color: "#2b2b2b",
        zIndex: 10000,
        fontSize: 12,
        padding: "48px 28px 18px 28px",
        lineHeight: 1.4,
        display: "inline-block",
        borderRadius: 8,
        fontFamily: "'Press Start 2P', cursive",
        pointerEvents: "auto",
        marginTop: "-100px",
      }}
    >
      <div
        style={{
          display: "grid",
          rowGap: 6,
          paddingRight: 8,
          columnGap: 12,
          paddingLeft: 24,
          paddingTop: 24,
        }}
      >
        {perChain.map((c) => (
          <div
            key={c.id}
            style={{
              display: "flex",
            //   justifyContent: "space-between",
            }}
          >
            <span>{c.name}:</span>
            <span style={{ fontVariantNumeric: "tabular-nums" }}>
              {c.count.toLocaleString()}
            </span>
          </div>
        ))}

        <hr
          style={{
            border: 0,
            borderTop: "1px solid #cbd5e1",
            opacity: 0.6,
            margin: "8px 0",
          }}
        />

        <div
          style={{
            display: "flex",
            // justifyContent: "space-between",
            fontWeight: 700,
          }}
        >
          <span>Total</span>
          <span style={{paddingLeft: "18px" }}>
            {total.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
};
