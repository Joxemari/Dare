import { Nav } from "../components/Nav";
import { TodayDareRevealCard } from "../components/TodayDareRevealCard";
import { ActiveJourneyList } from "../components/ActiveJourneyList";
import { PlannedDueList } from "../components/PlannedDueList";
import { wrap, pad } from "../components/layout";
import type { DareApp } from "../lib/useDare";

/* ============================================================
   TODAY — un ritual diario mínimo, no un dashboard. UNA acción
   evidente al abrir: "Your Dare" es el héroe (un toque para
   generarlo, check-in opcional). Debajo, en calma, los Planned
   Dares vencidos y los Journeys activos. NADA compite arriba: la
   carta del día vive en la pestaña You y el briefing solo en el
   recordatorio — Today no muestra carta, briefing, proofs, badges,
   ciencia ni métricas. El perfil vive en la pestaña You (nav
   inferior).
   ============================================================ */
export function Home({ app }: { app: DareApp }) {
  return (
    <div className="dare-root">
      <div style={wrap}>
        <div style={{ ...pad, paddingBottom: 0 }}>
          {/* Héroe: un Dare a un toque (check-in opcional) */}
          <TodayDareRevealCard app={app} />

          {/* Planned Dares vencidos — se ofrecen sin saturar Today */}
          <PlannedDueList app={app} />

          {/* Journeys activos — próxima acción + Start (detalle en Journey) */}
          <ActiveJourneyList app={app} />

          <div style={{ height: 8 }} />
        </div>
        <Nav tab="home" go={app.setScreen} />
      </div>
    </div>
  );
}
