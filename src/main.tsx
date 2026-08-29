import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import Home from "../app/page";
import "../app/globals.css";

const root = document.getElementById("root");

if (!root) {
  throw new Error("앱을 표시할 root 요소를 찾을 수 없습니다.");
}

createRoot(root).render(
  <StrictMode>
    <Home />
  </StrictMode>,
);
