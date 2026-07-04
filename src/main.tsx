import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

// Self-hosted fonts (no Google CDN dependency).
import "@fontsource/cormorant-garamond/300.css";
import "@fontsource/cormorant-garamond/400.css";
import "@fontsource/cormorant-garamond/500.css";
import "@fontsource/cormorant-garamond/400-italic.css";
import "@fontsource/space-grotesk/300.css";
import "@fontsource/space-grotesk/400.css";
import "@fontsource/space-grotesk/500.css";

import "./index.css";
import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// PWA: registrar el service worker solo en producción. En dev y en el e2e de
// Playwright NO se registra (import.meta.env.PROD es false), para no cachear el
// dev server ni interferir con los tests. El SW y el manifest se sirven bajo el
// base "/Dare/" (BASE_URL), igual que el resto de assets.
if (import.meta.env.PROD && "serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`).catch(() => {
      /* sin SW la app funciona igual, solo sin offline/instalación fiable */
    });
  });
}
