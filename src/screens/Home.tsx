import { C } from "../data/colors";
import { Ico } from "../components/Ico";
import { Briefing } from "../components/Briefing";
import { Nav } from "../components/Nav";
import { AtmosphereHero } from "../components/AtmosphereHero";
import { TodayDareRevealCard } from "../components/TodayDareRevealCard";
import { ActiveJourneyList } from "../components/ActiveJourneyList";
import { wrap, pad } from "../components/layout";
import type { DareApp } from "../lib/useDare";

/* ============================================================
   TODAY — un ritual diario mínimo, no un dashboard.
   Header · atmósfera · lectura del día · un Dare oculto que se
   revela de un toque · Journeys activos · navegación.
   Sin proofs, sin métricas, sin calendario, sin greeting.
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
  const revealed = !!app.currentDare && app.currentDare.revealed;

  return (
    <div className="dare-root">
      <div style={wrap}>
        <div style={{ ...pad, paddingBottom: 0 }}>
          {/* Header: icono · TODAY · perfil */}
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

          {/* Atmósfera diaria (modular: símbolo/textos por props) */}
          <AtmosphereHero />

          {/* Lectura del día (widget estilo Co-Star) — parte de la atmósfera */}
          <div style={{ marginTop: 20 }}>
            <Briefing briefing={briefing} accent={journey.color} />
          </div>

          {/* Un Dare oculto — revelado inline de un solo toque */}
          <TodayDareRevealCard app={app} />

          {/* Ajuste opcional y discreto: check-in de 30 s ("Get my Dare") */}
          {!revealed && (
            <div style={{ textAlign: "center", marginTop: 12 }}>
              <button className="link" style={{ color: C.faint, fontSize: 12 }} onClick={() => app.setScreen("checkin")}>
                Personalize · 30-sec check-in
              </button>
            </div>
          )}

          {/* Journeys activos — próxima acción + Start (detalle en la pestaña Journey) */}
          <ActiveJourneyList app={app} />

          <div style={{ height: 8 }} />
        </div>
        <Nav tab="home" go={app.setScreen} />
      </div>
    </div>
  );
}
