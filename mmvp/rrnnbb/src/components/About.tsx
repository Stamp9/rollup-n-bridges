// src/pages/About.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import bg from "../assets/bg.png"; 
import Board from "../assets/aboout_bg.png";

export const About: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div
      style={{
        width: "100%",
        height: "100vh",
        backgroundImage: `url(${bg})`,
        backgroundSize: "100% 100%",
        backgroundPosition: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        color: "#f8fafc",
        textAlign: "center",
        fontFamily: "'Press Start 2P', cursive",
      }}
    >

      <div
        style={{
          backgroundImage: `url(${Board})`,
          backgroundSize: "100% 100%",
          backgroundRepeat: "repeat",
          backgroundPosition: "center",
          marginTop: "80px",
          padding: "40px 32px",
          borderRadius: "12px",
          maxWidth: "600px",
          boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
        }}
      >
        <h1
            style={{
            color: "#38bdf8",
            fontSize: "24px",
            textShadow: "2px 2px 0 #1e3a8a, 4px 4px 0 #1e40af",
            marginBottom: "1.5rem",
            padding: "1 rem 0.5rem 0.5rem 0.5rem",
            }}
        >
            About Envio Gato 🐈‍⬛
        </h1>

        <p
            style={{
            maxWidth: "600px",
            lineHeight: "1.6",
            fontSize: "12px",
            marginBottom: "2rem",
            color: "#152b6bff",
            textAlign: "left",
            marginLeft: "2.5rem",
            marginRight: "2.5rem",
            }}
        >
            Envio Gato is a ETHGlobal Online Hackathon project.
            It is real-time visualization of bridge transactions through Relay.
            <br />
            Each cat represents a live transaction running across the bridge!
            <br />
            Built with Envio and Inspired by TxCity.
            <br />
        </p>
        <p
            style={{
            maxWidth: "600px",
            lineHeight: "1.6",
            fontSize: "12px",
            marginBottom: "2rem",
            color: "#ef9c58ff",
            textAlign: "left",
            marginLeft: "2.5rem",
            marginRight: "2.5rem",
            }}
        >
            We are proud that we draw all the pixel art ourselves(including the one you are looking at now)!
        </p>

        <p 
        style={{
            maxWidth: "600px",
            lineHeight: "1.6",
            fontSize: "12px",
            marginBottom: "2rem",
            color: "#152b6bff",
            textAlign: "left",
            marginLeft: "2.5rem",
            marginRight: "2.5rem",
            }}>

        Some pics
        <br />
        The Masterpiece:
        <br />
        Our Pixel Art Collections:
      </p>

      <button
        onClick={() => navigate("/")}
        style={{
          background: "rgba(56,189,248,0.15)",
          border: "1px solid #38bdf8",
          color: "#38bdf8",
          fontSize: "10px",
          padding: "12px 24px",
          borderRadius: "8px",
          cursor: "pointer",
          fontFamily: "'Press Start 2P', cursive",
          letterSpacing: "1px",
        }}
      >
        ← Back to cats
      </button>

      </div>
      
      <p>
        Created by <a href="https://github.com/Stamp9/rollup-n-bridges" target="_blank" rel="noopener noreferrer" style={{ color: "#38bdf8", textDecoration: "underline" }}>RnB</a>
      </p>

      
    </div>
  );
};
