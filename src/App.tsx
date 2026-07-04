import { useDare } from "./lib/useDare";
import { Onboarding } from "./screens/Onboarding";
import { Dream } from "./screens/Dream";
import { Reentry } from "./screens/Reentry";
import { Home } from "./screens/Home";
import { Checkin } from "./screens/Checkin";
import { Detail } from "./screens/Detail";
import { Timer } from "./screens/Timer";
import { Complete } from "./screens/Complete";
import { Journey } from "./screens/Journey";
import { Journeys } from "./screens/Journeys";
import { Progress } from "./screens/Progress";
import { You } from "./screens/You";

export default function App() {
  const app = useDare();

  if (app.screen === "onboarding") return <Onboarding app={app} />;
  if (app.away) return <Reentry app={app} />;

  switch (app.screen) {
    case "dream":
      return <Dream app={app} />;
    case "checkin":
      return <Checkin app={app} />;
    case "detail":
      return app.currentDare ? <Detail app={app} /> : <Home app={app} />;
    case "timer":
      return app.currentDare ? <Timer app={app} /> : <Home app={app} />;
    case "complete":
      return <Complete app={app} />;
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
