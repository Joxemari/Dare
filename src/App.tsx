import { useState, useEffect } from "react";
import { useDare } from "./lib/useDare";
import { Splash } from "./screens/Splash";
import { Onboarding } from "./screens/Onboarding";
import { Dream } from "./screens/Dream";
import { Reentry } from "./screens/Reentry";
import { Home } from "./screens/Home";
import { Card } from "./screens/Card";
import { Checkin } from "./screens/Checkin";
import { Detail } from "./screens/Detail";
import { Timer } from "./screens/Timer";
import { Complete } from "./screens/Complete";
import { JourneyComplete } from "./screens/JourneyComplete";
import { Journey } from "./screens/Journey";
import { Journeys } from "./screens/Journeys";
import { Progress } from "./screens/Progress";
import { You } from "./screens/You";

const prefersReducedMotion = () =>
  typeof window !== "undefined" && !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

export default function App() {
  const app = useDare();

  // Splash de apertura: pantalla oscura con el reveal por capas del logo. Sale
  // SIEMPRE en cold-start (arranque en frío de la app/web) — App solo se monta
  // al arrancar, así que NO aparece al cambiar de pestaña ni en la navegación
  // normal (cambiar de screen no re-monta App). Transitorio y no persistido:
  // se muestra ~1.3s y luego revela lo que toque (onboarding, reentry o la app).
  // Con reduced-motion no se monta.
  // Splash de apertura (reveal por capas del logo). Sale SIEMPRE en cold-start
  // (App solo se monta al arrancar → NO al cambiar de pestaña ni navegar). El
  // favicon respira solo ~1.5s, luego entra "DARE" (retardos en index.css).
  // TRANSICIÓN SUAVE: la app se monta DEBAJO desde el inicio y el splash se
  // superpone (overlay fixed) y se DESVANECE encima (crossfade) — nada de corte
  // seco. Fases: ~2.6s de hold → 0.5s de fade-out → desmontar. Con reduced-motion
  // no se monta. Transitorio, no persistido.
  const [showSplash, setShowSplash] = useState(() => !prefersReducedMotion());
  const [splashLeaving, setSplashLeaving] = useState(false);
  useEffect(() => {
    if (!showSplash) return;
    const t1 = setTimeout(() => setSplashLeaving(true), 2600);
    const t2 = setTimeout(() => setShowSplash(false), 3100);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [showSplash]);

  const view = () => {
    if (app.screen === "onboarding") return <Onboarding app={app} />;
    if (app.away) return <Reentry app={app} />;
    switch (app.screen) {
      case "dream":
        return <Dream app={app} />;
      case "card":
        return <Card app={app} />;
      case "checkin":
        return <Checkin app={app} />;
      case "detail":
        return app.currentDare ? <Detail app={app} /> : <Home app={app} />;
      case "timer":
        return app.currentDare ? <Timer app={app} /> : <Home app={app} />;
      case "complete":
        return <Complete app={app} />;
      case "journeyComplete":
        return app.justCompletedJourney ? <JourneyComplete app={app} /> : <Home app={app} />;
      case "journeys":
        return <Journeys app={app} />;
      case "journey":
        return <Journey app={app} />;
      case "progress":
        return <Progress app={app} />;
      case "you":
        return <You app={app} />;
      case "home":
      default:
        return <Home app={app} />;
    }
  };

  return (
    <>
      {view()}
      {showSplash && (
        <div className={"splash-overlay" + (splashLeaving ? " splash-leaving" : "")}>
          <Splash />
        </div>
      )}
    </>
  );
}
