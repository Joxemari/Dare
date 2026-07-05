import { Nav } from "../components/Nav";
import { TodayHeader } from "../components/TodayHeader";
import { TodayDareRevealCard } from "../components/TodayDareRevealCard";
import { ActiveJourneyList } from "../components/ActiveJourneyList";
import { PlannedDueList } from "../components/PlannedDueList";
import { wrap, pad } from "../components/layout";
import { formatDayLabel, greetingFor } from "../lib/date";
import type { DareApp } from "../lib/useDare";

/* ============================================================
   TODAY — un ritual diario mínimo, no un dashboard. Arriba, un
   MASTHEAD de contexto (fecha + saludo + capítulo del Journey si
   estás embarcado): calidez, no una acción. Luego UNA acción
   evidente: "Your Dare" es el héroe (un toque para generarlo,
   check-in opcional). Debajo, en calma, los Planned Dares vencidos
   y los Journeys activos. NADA compite arriba: la carta del día
   vive en la pestaña You y el briefing solo en el recordatorio —
   Today no muestra carta, briefing, proofs, badges, ciencia ni
   métricas. El perfil vive en la pestaña You (nav inferior).
   ============================================================ */
export function Home({ app }: { app: DareApp }) {
  const { journey, chapter, isJourneyActive } = app;
  // Línea del Journey SOLO si estás embarcado (journey en foco activo).
  // `chapter.n` ya es romano ("I".."IV"). `.lbl` lo pasa a mayúsculas.
  const journeyLine = isJourneyActive
    ? `${journey.name} · Chapter ${chapter.n} — ${chapter.name}`
    : null;

  return (
    <div className="dare-root">
      <div style={wrap}>
        <div style={{ ...pad, paddingBottom: 0 }}>
          {/* Masthead: fecha + saludo + capítulo del Journey (contexto, no acción) */}
          <TodayHeader
            dayLabel={formatDayLabel()}
            greeting={greetingFor(new Date().getHours())}
            journeyLine={journeyLine}
            accent={isJourneyActive ? journey.color : undefined}
          />

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
