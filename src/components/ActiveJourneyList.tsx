import { C } from "../data/colors";
import { SYMBOLS } from "../data/symbols";
import { todaysDayPlan, SPRINT_DAYS } from "../data/journeys";
import type { Journey } from "../types";
import type { DareApp } from "../lib/useDare";

/* ============================================================
   ActiveJourneyList — "Today's plan": para cada Journey ACTIVO muestra
   la acción PRESCRITA de hoy (el día del plan que toca), no un milestone
   genérico. Así el usuario ve de un vistazo qué hacer hoy de cada Journey
   que tiene en marcha (p. ej. fuerza de Iron Quiet + respiración de Still
   Water). Cada fila: símbolo, nombre, "Day N · título", y un botón que
   lanza directamente el Dare del día (`startJourneyDay`). Tocar el resto
   de la fila abre la pestaña Journey. Con varios activos, sube y marca el
   recomendado por el check-in ("Choose your lane" / · today).
   ============================================================ */

function ActiveJourneyRow({ app, journey, recommended }: { app: DareApp; journey: Journey; recommended?: boolean }) {
  const progress = app.store.journeyProgress[journey.id] ?? 0;
  const day = todaysDayPlan(journey, progress);
  const done = !day; // sprint completado
  const open = () => {
    app.setJourney(journey.id);
    app.setScreen("journey");
  };
  return (
    <div
      className="card"
      style={{
        padding: "14px 16px",
        display: "flex",
        alignItems: "center",
        gap: 14,
        marginBottom: 10,
        borderColor: recommended ? journey.color + "66" : undefined,
        boxShadow: recommended ? `0 0 26px -16px ${journey.color}` : undefined,
      }}
    >
      <button
        onClick={open}
        aria-label={`Open ${journey.name}`}
        style={{
          flexShrink: 0,
          width: 40,
          height: 40,
          borderRadius: 12,
          border: `1px solid ${journey.color}44`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: journey.color,
          fontSize: 17,
          background: "transparent",
          cursor: "pointer",
        }}
      >
        {SYMBOLS[journey.sym]}
      </button>
      <button
        onClick={open}
        style={{ flex: 1, minWidth: 0, background: "transparent", border: "none", padding: 0, textAlign: "left", cursor: "pointer", fontFamily: "inherit" }}
      >
        <p style={{ fontSize: 14.5, color: C.text }}>
          {journey.name}
          {recommended && (
            <span style={{ fontSize: 10.5, color: journey.color, marginLeft: 8, letterSpacing: "0.04em" }}>· today</span>
          )}
        </p>
        <p style={{ fontSize: 12, color: C.dim, marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {done ? "Sprint complete" : `Day ${progress + 1} of ${SPRINT_DAYS} · ${day!.title}`}
        </p>
      </button>
      {done ? (
        <span style={{ color: C.green, fontSize: 12.5, flexShrink: 0 }}>✓ Done</span>
      ) : (
        <button
          className="pill"
          style={{ width: "auto", padding: "8px 16px", fontSize: 12.5, flexShrink: 0, borderColor: journey.color + "66", color: journey.color }}
          onClick={() => app.startJourneyDay(journey.id)}
        >
          Start
        </button>
      )}
    </div>
  );
}

export function ActiveJourneyList({ app }: { app: DareApp }) {
  const { activeJourneys, recommendedJourneyId } = app;
  const multiple = activeJourneys.length > 1;
  // Con varios Journeys activos, sube el recomendado de hoy al principio ("Choose your lane").
  const ordered = multiple
    ? [...activeJourneys].sort((a, b) =>
        a.id === recommendedJourneyId ? -1 : b.id === recommendedJourneyId ? 1 : 0,
      )
    : activeJourneys;
  return (
    <div style={{ marginTop: 26 }}>
      <p className="lbl" style={{ marginBottom: 12, color: C.dim }}>
        {activeJourneys.length === 0 ? "Active Journeys" : multiple ? "Today's plan · choose your lane" : "Today's plan"}
      </p>
      {activeJourneys.length === 0 ? (
        <div className="card" style={{ padding: 20, textAlign: "center" }}>
          <p style={{ fontSize: 13.5, color: C.dim, marginBottom: 14 }}>No Journey started yet.</p>
          <button className="btn btn-line" onClick={() => app.setScreen("journeys")}>
            Begin a Journey {SYMBOLS.spark}
          </button>
        </div>
      ) : (
        ordered.map((j) => (
          <ActiveJourneyRow key={j.id} app={app} journey={j} recommended={multiple && j.id === recommendedJourneyId} />
        ))
      )}
    </div>
  );
}
