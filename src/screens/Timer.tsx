import { C, colorOf } from "../data/colors";
import { SYMBOLS } from "../data/symbols";
import { wrap, pad } from "../components/layout";
import { resolveCompanion } from "../lib/companions";
import type { DareApp } from "../lib/useDare";

export function Timer({ app }: { app: DareApp }) {
  if (!app.currentDare) return null;
  const d = app.currentDare.dare;
  const col = colorOf(d);
  // Companion CONCRETO y rotado — el mismo que vio en el Detail (temptation
  // bundling). El Timer es el momento en que la recompensa DURANTE ocurre de
  // verdad, así que aquí es donde más importa recordarla ("solo durante").
  const comp = resolveCompanion(d, {
    vibe: app.store.lastCheckin?.vibe,
    seed: app.currentDare.entry.date,
  });
  const total = d.min * 60;
  const frac = app.secs / total;
  const R = 96;
  const CIRC = 2 * Math.PI * R;
  const mm = String(Math.floor(app.secs / 60)).padStart(2, "0");
  const ss = String(app.secs % 60).padStart(2, "0");

  return (
    <div className="dare-root">
      <div style={{ ...wrap, textAlign: "center" }}>
        <div style={{ ...pad, display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <p className="serif" style={{ fontSize: 30, marginBottom: 4 }}>
            On the move.
          </p>
          <p style={{ color: C.dim, fontSize: 13, marginBottom: 20 }}>{d.title}</p>

          {/* Companion resuelto: la recompensa DURANTE (temptation bundling).
              Se recuerda aquí porque es el momento en que ocurre de verdad. */}
          <div style={{ marginBottom: 26 }}>
            <p className="lbl" style={{ color: C.purple, marginBottom: 4 }}>
              {SYMBOLS.rhythm} Companion · {comp.word}
            </p>
            <p className="serif" style={{ fontSize: 17, color: C.text }}>
              {comp.label}
            </p>
            <p className="lbl" style={{ fontSize: 8.5, color: C.gold, marginTop: 6 }}>
              {SYMBOLS.spark} During this only — that's the hook
            </p>
          </div>
          <div style={{ position: "relative", width: 220, height: 220, margin: "0 auto 30px" }}>
            <svg width="220" height="220" style={{ transform: "rotate(-90deg)" }}>
              <circle cx="110" cy="110" r={R} fill="none" stroke={C.line} strokeWidth="3" />
              <circle
                cx="110"
                cy="110"
                r={R}
                fill="none"
                stroke={col}
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray={CIRC}
                strokeDashoffset={CIRC * (1 - frac)}
                style={{ transition: "stroke-dashoffset 1s linear" }}
              />
            </svg>
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span className="lbl" style={{ marginBottom: 6 }}>
                Time left
              </span>
              <span className="serif" style={{ fontSize: 46 }}>
                {mm}:{ss}
              </span>
              <button
                className="link"
                style={{ marginTop: 8, textDecoration: "none", fontSize: 18 }}
                aria-label={app.paused ? "Resume timer" : "Pause timer"}
                onClick={() => app.setPaused(!app.paused)}
              >
                {app.paused ? "Resume" : "Pause"}
              </button>
            </div>
          </div>
          <p style={{ fontSize: 13, color: C.dim, marginBottom: 30 }}>Step 1 — {d.steps[0]}</p>
          <button className="btn btn-ghost" onClick={() => app.finishDare()}>
            Finish dare
          </button>
        </div>
      </div>
    </div>
  );
}
