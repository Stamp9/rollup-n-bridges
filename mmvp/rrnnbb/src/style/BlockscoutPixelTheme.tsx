import { createGlobalStyle } from "styled-components";

export const BlockscoutPixelTheme = createGlobalStyle`
  /* 🎨 Pixel theme for Blockscout popups — scoped */
  .blockscout-theme [class*="blockscout-popup-container"],
  .blockscout-theme div[data-testid*="transaction-popup"] {
    background: repeating-linear-gradient(
      45deg,
      #f8fafc,
      #f8fafc 8px,
      #f1f5f9 8px,
      #f1f5f9 16px
    ) !important;
    border: 3px solid #38bdf8 !important;
    border-radius: 10px !important;
    box-shadow: 0 0 16px rgba(56,189,248,0.35) !important;
    color: #1e293b !important;
    font-family: 'Press Start 2P', cursive !important;
    text-transform: uppercase;
    image-rendering: pixelated;
  }

  .blockscout-theme h1,
  .blockscout-theme h2,
  .blockscout-theme h3,
  .blockscout-theme h4 {
    color: #0f172a !important;
    text-shadow: 1px 1px 0 #38bdf8, 2px 2px 0 #1e3a8a;
    font-family: 'Press Start 2P', cursive !important;
  }

  .blockscout-theme a {
    color: #2563eb !important;
    text-decoration: underline !important;
  }

    .blockscout-theme button {
    background-color: #38bdf8 !important;             /* flat cyan tone */
    border: 3px solid #1e3a8a !important;             /* thick dark border */
    box-shadow:
        0 0 0 2px #f8fafc,                             /* white outline for contrast */
        4px 4px 0 #1e3a8a !important;                  /* solid pixel shadow */
    color: #0f172a !important;                       /* dark text for contrast */
    padding: 8px 14px !important;
    border-radius: 0 !important;                     /* ⬅️ no rounded edges */
    font-family: 'Press Start 2P', cursive !important;
    font-size: 10px !important;
    letter-spacing: 1px;
    text-transform: uppercase;
    image-rendering: pixelated;
    cursor: pointer;
    transition: transform 0.05s ease, box-shadow 0.05s ease;
    }

    .blockscout-theme button:hover {
    transform: translate(-2px, -2px);                /* “pop up” effect */
    box-shadow:
        0 0 0 2px #f8fafc,
        6px 6px 0 #1e3a8a !important;
    }

  .blockscout-theme button:hover {
    transform: translateY(-2px);
  }

  .blockscout-theme span,
  .blockscout-theme p {
    font-size: 12px !important;
    color: #374151 !important;
    font-family: 'Press Start 2P', cursive !important;
  }

  .blockscout-theme [class*="popup"] {
    filter: drop-shadow(0 0 6px rgba(56,189,248,0.4));
  }
`;
