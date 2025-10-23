"use client";
import React from "react";
import { useRelay24hAutoRefresh } from "./useRelay24hCounts";
import Board from "../assets/livecounter_chains/pixelboard.png";
import { tokenMetadata } from "../data/model";
import {
  NotificationProvider,
  TransactionPopupProvider,
  useTransactionPopup
} from "@blockscout/app-sdk";


function formatTokenAmount(cat: any) {
  const symbol = cat.token || "ETH";
  // Convert from base units (wei or token smallest unit) to human units
  const decimals = tokenMetadata[symbol]?.decimals ?? 6;
  const value = cat.amount / Math.pow(10, decimals);
  // Choose precision based on magnitude
  let formatted: string;
  if (!isFinite(value)) return `0 ${symbol}`;
  if (value >= 1000) {
    formatted = value.toLocaleString(undefined, {
      maximumFractionDigits: 2,
      minimumFractionDigits: 2,
    });
  } else if (value >= 1) {
    formatted = value.toLocaleString(undefined, {
      maximumFractionDigits: 2,
    });
  } else {
    formatted = value.toLocaleString(undefined, {
      maximumFractionDigits: 6,
    });
  }

  return `${formatted} ${symbol}`;
}

export const chainIdToEtherscan: Record<number, string> = {
  1: "https://etherscan.io/txs?block=",
  10: "https://optimistic.etherscan.io/txs?block=",
  42161: "https://arbiscan.io/txs?block=",
  8453: "https://basescan.org/txs?block=",
};


function formatEtherscanLink(chain_id: any, block_number: any) {
  console.log(chainIdToEtherscan[chain_id])
  return `${chainIdToEtherscan[chain_id]}${block_number}`;
}


export const TxPanel: React.FC = ({ cat }) => {

  const { openPopup } = useTransactionPopup();

  const viewHistory = (chainId: any, address: any) => {
    openPopup({
      chainId,
      address // Optional
    });
  };
  return (

    <div
      style={{
        position: "fixed",
        bottom: "5%",
        left: "5%",
        width: 260,
        minHeight: 300,
        backgroundImage: `url(${Board})`,
        backgroundSize: "100% 100%",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        color: "#2b2b2b",
        zIndex: 10000,
        fontSize: 8,
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
        {}

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
            flexDirection: "column",
            // justifyContent: "space-between",
            fontWeight: 700,
          }}
        >
          <div
            style={{
              paddingBottom: "8px"
            }}
          >{`Transaction`}</div>
          <div>{`${cat.chainName}\n`}</div>
          {formatTokenAmount(cat)}
          <span
            onMouseDown={() => window.open(formatEtherscanLink(cat.chainId, cat.blockNumber), '_blank')}
          >
            block number: {cat.blockNumber}
          </span>
          <span
            onMouseDown={() => viewHistory(cat.chainId, cat.from)}

          >
            from: {cat.from}
          </span>

          <span style={{ paddingLeft: "18px" }}>
          </span>
        </div>
      </div>
    </div>
  );
}

