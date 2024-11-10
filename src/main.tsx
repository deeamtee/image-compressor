import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Compressor } from "./components/Compressor";
import "./index.css";
import './i18n'

createRoot(document.getElementById("internal-root-extension-container")!).render(
  <StrictMode>
    <Compressor />
  </StrictMode>
);
