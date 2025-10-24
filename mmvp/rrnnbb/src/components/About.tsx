// src/pages/About.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import bg from "../assets/bg.png";
import Board from "../assets/aboout_bg.png";
import masterpiece from "../assets/masterpiece.jpeg";
import btnIdle from "../assets/aboout_button.png"; 
import pixelworks from "../assets/pixel_rnb.png";

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
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          marginTop: "80px",
          padding: "40px 32px",
          borderRadius: "12px",
          width: "min(90vw, 680px)",
          maxWidth: "680px",
          maxHeight: "70vh",
          overflow: "hidden",
          boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <h1
          style={{
            color: "#38bdf8",
            fontSize: "24px",
            textShadow: "2px 2px 0 #1e3a8a, 4px 4px 0 #1e40af",
            marginBottom: "1.5rem",
            padding: "1rem 0.5rem 0.5rem 0.5rem", 
          }}
        >
          About Envio Gato 🐈‍⬛
        </h1>

        <div
          style={{
            overflowY: "auto",
            padding: "0 8px 8px 8px",
            WebkitOverflowScrolling: "touch",
            textAlign: "left",
          }}
        >
          <p
            style={{
              lineHeight: "1.6",
              fontSize: "12px",
              marginBottom: "2rem",
              color: "#152b6bff",
              marginLeft: "2.5rem",
              marginRight: "2.5rem",
            }}
          >
            Envio Gato is a ETHOnline Hackathon project. 
            <br />
            It is real-time visualization of bridge transactions through Relay. Each cat represents a live transaction running across the bridge!
           
            
            <br />
            Built with <a href="https://envio.dev/">Envio</a> and inspired by <a href="https://txcity.io/v/eth-btc">TxCity</a>.
          </p>

          <p
            style={{
              lineHeight: "1.6",
              fontSize: "12px",
              marginBottom: "2rem",
              color: "#ef9c58ff",
              marginLeft: "2.5rem",
              marginRight: "2.5rem",
            }}
          >
            We are proud that we draw all the pixel art ourselves (including the
            one you are looking at now)!
          </p>

          <div
            style={{
              marginLeft: "2.5rem",
              marginRight: "2.5rem",
              marginBottom: "1rem",
              color: "#152b6bff",
              fontSize: "12px",
            }}
          >
            <div style={{ marginBottom: "0.5rem" }}>The Masterpiece:</div>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                margin: "0 0 1.5rem 0",
              }}
            >
              <img
                src={masterpiece}
                alt="The Masterpiece"
                loading="lazy"
                style={{
                  maxWidth: "100%",
                  width: "min(520px, 100%)",
                  height: "auto",
                  borderRadius: "8px",
                  boxShadow: "0 6px 18px rgba(0,0,0,0.35)",
                  imageRendering: "pixelated",
                  border: "1px solid rgba(255,255,255,0.12)",
                }}
              />
            </div>

            <div style={{ marginBottom: "0.5rem" }}>Our Pixel Art Collections:</div>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                margin: "0 0 1.5rem 0",
              }}
            >
              <img
                src={pixelworks}
                alt="The Pixel Works"
                loading="lazy"
                style={{
                  maxWidth: "100%",
                  width: "min(520px, 100%)",
                  height: "auto",
                  borderRadius: "8px",
                  boxShadow: "0 6px 18px rgba(0,0,0,0.35)",
                  imageRendering: "pixelated",
                  border: "1px solid rgba(255,255,255,0.12)",
                }}
              />
            </div>

            <p>
            And Ben wants to say:
            </p>
          </div>

          <div style={{ display: "flex", justifyContent: "center", marginBottom: "12px" }}>
            <button
              onClick={() => navigate("/")}
              aria-label="Back to cats"
              style={{
                background: "transparent",
                border: "none",
                padding: 0,
                cursor: "pointer",
                outlineOffset: 4,
              }}
            >
              <div
                style={{
                  position: "relative",
                  display: "inline-block",
                  lineHeight: 0,
                  transition: "transform 80ms ease-out, filter 80ms ease-out",
                }}
                onMouseOver={(e) =>
                  (e.currentTarget.style.transform = "translateY(-1px)")
                }
                onMouseOut={(e) =>
                  (e.currentTarget.style.transform = "translateY(0)")
                }
                onMouseDown={(e) =>
                  (e.currentTarget.style.transform =
                    "translateY(0) scale(0.98)")
                }
                onMouseUp={(e) =>
                  (e.currentTarget.style.transform = "translateY(-1px)")
                }
              >
                <img
                  src={btnIdle}
                  alt="" 
                  style={{
                    display: "block",
                    width: 160,
                    height: "auto",
                    imageRendering: "pixelated",
                  }}
                />
                <span
                  style={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: "'Press Start 2P', cursive",
                    fontSize: 24,
                    fontWeight: "bold",
                    letterSpacing: "1px",
                    color: "#212425ff",
                    pointerEvents: "none",
                    userSelect: "none",
                    padding: "0 8px",
                    textAlign: "center",
                  }}
                >
                  Back
                </span>
              </div>
            </button>
          </div>
        </div>
      </div>

      <p style={{ marginTop: "12px" }}>
        Built happily by{" "}
        <a
          href="https://github.com/Stamp9/rollup-n-bridges"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "#faab0eff", textDecoration: "underline" }}
        >
          RnB
        </a>
      </p>
    </div>
  );
};
