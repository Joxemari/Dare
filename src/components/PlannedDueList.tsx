import { C } from "../data/colors";
import { SYMBOLS } from "../data/symbols";
import type { DareApp } from "../lib/useDare";

/* ============================================================
   PlannedDueList — Planned Dares que ya han vencido, ofrecidos en
   Today SIN saturarlo. Today prioriza un Dare actual; los planeados
   viven aquí como una fila compacta que se puede iniciar o descartar.
   La lista completa (incluidos los futuros) vive en Progress.
   ============================================================ */
export function PlannedDueList({ app }: { app: DareApp }) {
  const due = app.duePlannedDares;
  if (due.length === 0) return null;

  return (
    <div style={{ marginTop: 20 }}>
      <p className="lbl" style={{ marginBottom: 10, color: C.purple }}>
        {SYMBOLS.focus} Planned · due now
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {due.map((p) => (
          <div
            key={p.id}
            className="card"
            style={{ padding: 14, display: "flex", alignItems: "center", justifyContent: "space-between", background: C.card2 }}
          >
            <span style={{ fontSize: 14, color: C.text }}>{p.label}</span>
            <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
              <button className="link" style={{ color: C.faint, fontSize: 12 }} onClick={() => app.removeDarePlan(p.id)}>
                Dismiss
              </button>
              <button className="link" style={{ color: C.green }} onClick={() => app.startPlannedDare(p)}>
                Start
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
