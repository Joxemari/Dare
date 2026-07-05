import { Nav } from "../components/Nav";
import { DailyCardDraw } from "../components/DailyCardDraw";
import { TodaysDoor } from "../components/TodaysDoor";
import { TodayDareRevealCard } from "../components/TodayDareRevealCard";
import { ActiveJourneyList } from "../components/ActiveJourneyList";
import { PlannedDueList } from "../components/PlannedDueList";
import { wrap, pad } from "../components/layout";
import type { DareApp } from "../lib/useDare";

/* ============================================================
   TODAY — un ritual diario mínimo, no un dashboard.
   Sin iconos en las esquinas: arriba el "card pull" inline
   ("Draw your card for today"), luego Today's Door (abre el
   Briefing), Your Dare tras un check-in rápido, Planned Dares
   vencidos y Journeys activos. El perfil vive en la pestaña You
   (nav inferior). Sin proofs, badges, ciencia ni métricas.
   ============================================================ */
export function Home({ app }: { app: DareApp }) {
  const { briefing, journey } = app;

  return (
    <div className="dare-root">
      <div style={wrap}>
        <div style={{ ...pad, paddingBottom: 0 }}>
          {/* Card pull inline (antes tras un icono en la esquina) */}
          <DailyCardDraw app={app} />

          {/* Today's Door → revela Today's Briefing detrás (flip) */}
          <TodaysDoor briefing={briefing} accent={journey.color} onUseForDare={() => app.startQuickCheckin()} />

          {/* Planned Dares vencidos — se ofrecen sin saturar Today */}
          <PlannedDueList app={app} />

          {/* Un Dare — tras un check-in rápido (energía · foco · qué evitas) */}
          <div style={{ marginTop: 20 }}>
            <TodayDareRevealCard app={app} />
          </div>

          {/* Journeys activos — próxima acción + Start (detalle en Journey) */}
          <ActiveJourneyList app={app} />

          <div style={{ height: 8 }} />
        </div>
        <Nav tab="home" go={app.setScreen} />
      </div>
    </div>
  );
}
