import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import './utils/upng.js';
import { App } from "./components/App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
