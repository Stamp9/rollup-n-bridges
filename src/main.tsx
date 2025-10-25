// src/main.tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { ApolloProvider } from "@apollo/client/react";
import { apolloClient } from "./lib/apolloClient";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import App from "./App.tsx";
import { About } from "./components/About.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ApolloProvider client={apolloClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </BrowserRouter>
    </ApolloProvider>
  </StrictMode>
);
