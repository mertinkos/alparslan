import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { initIntroScreen } from "./intro-screen";

const root = document.getElementById("root");
if (root) {
  createRoot(root).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}

// Intro overlay runs after a tick so the React tree has mounted and the
// overlay can hide/show #root accordingly.
setTimeout(initIntroScreen, 100);
