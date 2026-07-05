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

  // Splash de apertura: pantalla oscura con el logo, SOLO al arrancar con el
  // onboarding ya hecho (no en el primer arranque ni con reduced-motion). Es
  // transitorio y no se persiste: se muestra ~1.7s y luego revela la app.
  const [showSplash, setShowSplash] = useState(
    () => app.store.onboarded && !prefersReducedMotion(),
  );
  useEffect(() => {
    if (!showSplash) return;
    const t = setTimeout(() => setShowSplash(false), 1700);
    return () => clearTimeout(t);
  }, [showSplash]);

  if (app.screen === "onboarding") return <Onboarding app={app} />;
  if (showSplash) return <Splash />;
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
}
