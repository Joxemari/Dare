import { C } from "../data/colors";
import { Ico } from "../components/Ico";
import { Nav } from "../components/Nav";
import { TodaysDoor } from "../components/TodaysDoor";
import { TodayDareRevealCard } from "../components/TodayDareRevealCard";
import { ActiveJourneyList } from "../components/ActiveJourneyList";
import { PlannedDueList } from "../components/PlannedDueList";
import { wrap, pad } from "../components/layout";
import type { DareApp } from "../lib/useDare";

/* ============================================================
   TODAY — un ritual diario mínimo, no un dashboard.
   Header · Today's Door (abre el Briefing) · un Dare tras un
   check-in rápido · Planned Dares vencidos · Journeys activos.
   Sin proofs, sin badges, sin cartas de ciencia, sin métricas.
   ============================================================ */

/** Botón de icono minimalista para el header. */
function IconButton({ name, label, onClick }: { name: string; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      style={{
        width: 38,
        height: 38,
        borderRadius: 12,
        border: `1px solid ${C.line}`,
        background: "transparent",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        color: C.dim,
      }}
    >
      <Ico name={name} size={18} sw={1.5} />
    </button>
  );
}

export function Home({ app }: { app: DareApp }) {
  const { briefing, journey } = app;

  return (
    <div className="dare-root">
      <div style={wrap}>
        <div style={{ ...pad, paddingBottom: 0 }}>
          {/* Header: icono carta · TODAY · perfil */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 22 }}>
            <IconButton name="card" label="Today's card" onClick={() => app.setScreen("card")} />
            <span
              className="lbl"
              style={{ fontSize: 13, letterSpacing: "0.42em", color: C.text, paddingLeft: "0.42em" }}
            >
              TODAY
            </span>
            <IconButton name="person" label="Profile and settings" onClick={() => app.setScreen("you")} />
          </div>

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
