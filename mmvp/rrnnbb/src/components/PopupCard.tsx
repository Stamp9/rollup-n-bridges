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


interface TxPanelProps {
  cat: {
    id: string;
    start: number;
    chainName: string;
    amount: number;
    blockNumber: number;
    chainId: number;
    from: string;
  };
}


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

const truncateAddress = (address?: string): string =>
  !address
    ? "Unknown"
    : address.length < 10
    ? address
    : `${address.slice(0, 6)}...${address.slice(-4)}`;





export const TxPanel: React.FC<TxPanelProps> = ({ cat }) => {

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
        top: "30%",
        left: "70%",
        width: 260,
        minHeight: 180,
        backgroundImage: `url(${Board})`,
        backgroundSize: "100% 100%",
        backgroundRepeat: "no-repeat",
        color: "#2b2b2b",
        fontFamily: "'Press Start 2P', cursive",
        fontSize: 9,
        lineHeight: 1.6,
        borderRadius: 10,
        padding: "48px 20px 30px 20px",
        zIndex: 9999,
        pointerEvents: "auto",
        userSelect: "none",
        textAlign: "left",
        // Optional helpers
        // border: "1px dashed red",
      }}
    >
      <div
        style={{
          fontSize: 12,
          color: "#1e293b",
          fontWeight: "bold",
          marginBottom: 10,
          marginTop: 16,
          textShadow: "0 1px #fff",
          letterSpacing: "0.5px",
          paddingLeft: 60,
        }}
      >
        TX DETAILS
      </div>

      

      <div style={{ margin: "4px 0", color: "#374151",  paddingLeft: 20, }}>
        Chain: <span style={{ color: "#000" }}>{cat.chainName}</span>
      </div>

      <div
        style={{
          color: "#000",
          borderRadius: 6,
          paddingLeft: 20,
          fontWeight: "bold",
          display: "block",
          width: "fit-content",
        }}
      >
        {formatTokenAmount(cat)}
      </div>

      <div
        onMouseDown={() =>
          window.open(formatEtherscanLink(cat.chainId, cat.blockNumber), "_blank")
        }
        style={{
          cursor: "pointer",
          color: "#2563eb",
          textDecoration: "underline",
          margin: "6px 0",
          paddingLeft: 20,
          transition: "opacity 0.2s",
        }}
        onMouseEnter={(e) => ((e.currentTarget.style.opacity = "0.7"))}
        onMouseLeave={(e) => ((e.currentTarget.style.opacity = "1"))}
      >
        Block: #{cat.blockNumber}
      </div>

      <div
        onMouseDown={() => viewHistory(cat.chainId, cat.from)}
        style={{
          cursor: "pointer",
          color: "#7c3aed",
          textDecoration: "underline",
          wordBreak: "break-all",
          margin: "6px 0",
          paddingLeft: 20,
          transition: "opacity 0.2s",
        }}
        onMouseEnter={(e) => ((e.currentTarget.style.opacity = "0.7"))}
        onMouseLeave={(e) => ((e.currentTarget.style.opacity = "1"))}
      >
        From: {truncateAddress(cat.from)}
      </div>
    </div>

  );
};