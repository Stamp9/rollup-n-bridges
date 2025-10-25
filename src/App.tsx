import { useState } from "react";

import { PiexelBridgeOverview } from "./components/PiexelBridgeOverview";

type PageView = "network" | "bridge" | "piexel";

export default function App() {
  const [page, setPage] = useState<PageView>("piexel");

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#020617",
        color: "#e2e8f0",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <header
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "0.75rem",
          padding: "1.5rem 1rem 0.5rem",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: "1rem",
            alignItems: "center",
            justifyContent: "center",
            flexWrap: "wrap",
            color: "#94a3b8",
            fontSize: "0.85rem",
          }}
        />
        <div
          style={{
            display: "flex",
            gap: "0.5rem",
            flexWrap: "wrap",
            justifyContent: "center",
            paddingTop: "0.25rem",
            alignItems: "center",
          }}
        />
        <div
          style={{
            display: "flex",
            gap: "0.5rem",
            flexWrap: "wrap",
            justifyContent: "center",
            paddingTop: "0.5rem",
            alignItems: "center",
          }}
        />
      </header>

      <main
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "1.5rem",
        }}
      >
        {page === "piexel" && <PiexelBridgeOverview />}
      </main>
    </div>
  );
}