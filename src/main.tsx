import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import './utils/upng.js';
import { Compressor } from "./components/Compressor";

createRoot(document.getElementById("internal-root-extension-container")!).render(
  <StrictMode>
    <Compressor />
  </StrictMode>
);
