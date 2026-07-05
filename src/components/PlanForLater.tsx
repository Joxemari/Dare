import { useState } from "react";
import { C } from "../data/colors";
import { SYMBOLS } from "../data/symbols";
import type { PlanWhen } from "../types";
import type { DareApp } from "../lib/useDare";

/* ============================================================
   PlanForLater — "Plan for later" en la pantalla del Dare.
   Aparta el Dare actual para un momento elegido (Planned Dares).
   Colapsado por defecto para no competir con "Start".
   ============================================================ */
const OPTIONS: [PlanWhen, string][] = [
  ["later-today", "Later today"],
  ["tomorrow-am", "Tomorrow morning"],
  ["tomorrow-pm", "Tomorrow evening"],
  ["weekend", "This weekend"],
];

export function PlanForLater({ app }: { app: DareApp }) {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <div style={{ textAlign: "center", marginTop: 14 }}>
        <button className="link" style={{ color: C.dim }} onClick={() => setOpen(true)}>
          {SYMBOLS.focus} Plan for later
        </button>
      </div>
    );
  }

  return (
    <div className="card rise" style={{ padding: 16, marginTop: 14, background: C.card2 }}>
      <p className="lbl" style={{ marginBottom: 12, color: C.purple }}>
        {SYMBOLS.focus} Plan this dare for later
      </p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {OPTIONS.map(([when, label]) => (
          <button
            key={when}
            className="pill"
            style={{ padding: "9px 14px", fontSize: 12, width: "auto" }}
            onClick={() => app.planCurrentForLater(when)}
          >
            {label}
          </button>
        ))}
      </div>
      <div style={{ textAlign: "center", marginTop: 12 }}>
        <button className="link" style={{ color: C.faint, fontSize: 12 }} onClick={() => setOpen(false)}>
          Cancel
        </button>
      </div>
    </div>
  );
}
