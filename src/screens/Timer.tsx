import { C, colorOf } from "../data/colors";
import { wrap, pad } from "../components/layout";
import type { DareApp } from "../lib/useDare";

export function Timer({ app }: { app: DareApp }) {
  if (!app.currentDare) return null;
  const d = app.currentDare.dare;
  const col = colorOf(d);
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
          <p style={{ color: C.dim, fontSize: 13, marginBottom: 30 }}>
            {d.title} · companion: {d.companion}
          </p>
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
