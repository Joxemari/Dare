import { C } from "../data/colors";
import { SYMBOLS } from "../data/symbols";
import { nextAction } from "../data/journeys";
import type { Journey } from "../types";
import type { DareApp } from "../lib/useDare";

/* ============================================================
   ActiveJourneyList / ActiveJourneyRow — filas compactas de los
   Journeys activos en Today: símbolo, nombre, UNA próxima acción y
   un botón "Start". El detalle (capítulos, progreso) vive en la
   pestaña Journey; aquí solo se abre la lane. Nada de barras de
   progreso ni etiquetas Today/Tomorrow.
   El símbolo es el propio glifo del Journey (SYMBOLS[journey.sym]),
   coherente con el resto de la app y válido para los 7 Journeys.
   ============================================================ */

function ActiveJourneyRow({ app, journey, recommended }: { app: DareApp; journey: Journey; recommended?: boolean }) {
  const action = nextAction(journey, app.store.milestones);
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
      <span
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
        }}
      >
        {SYMBOLS[journey.sym]}
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 14.5, color: C.text }}>
          {journey.name}
          {recommended && (
            <span style={{ fontSize: 10.5, color: journey.color, marginLeft: 8, letterSpacing: "0.04em" }}>
              · today
            </span>
          )}
        </p>
        <p style={{ fontSize: 12, color: C.dim, marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {action}
        </p>
      </div>
      <button
        className="pill"
        style={{ width: "auto", padding: "8px 16px", fontSize: 12.5, flexShrink: 0, borderColor: journey.color + "66", color: journey.color }}
        onClick={open}
      >
        Start
      </button>
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
        {multiple ? "Choose your lane" : "Active Journeys"}
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
