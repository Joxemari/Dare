import { C, CATS, colorOf } from "../data/colors";
import { SYMBOLS } from "../data/symbols";
import { cardRevealFeedback } from "../lib/feedback";
import type { DareApp } from "../lib/useDare";

/* ============================================================
   TodayDareRevealCard — el "one hidden Dare" de Today.
   Estado cerrado: "YOUR DARE / One dare is waiting" + un solo toque
   para revelar. El revelado ocurre INLINE en la misma tarjeta (sin
   navegar a otra pantalla) y sin volver a bloquear tras revelar.
   ============================================================ */

const LABEL = "YOUR DARE";

export function TodayDareRevealCard({ app }: { app: DareApp }) {
  const cd = app.currentDare;
  const revealed = !!cd && cd.revealed;
  const completed = !!cd && cd.completed;

  // ---- Completado hoy: estado mínimo y sereno ----
  if (cd && completed) {
    return (
      <div className="card rise" style={{ padding: 26, textAlign: "center" }}>
        <div style={{ color: C.green, fontSize: 20, marginBottom: 10 }}>✓</div>
        <p className="lbl" style={{ marginBottom: 6, color: C.dim }}>
          {LABEL}
        </p>
        <p className="serif" style={{ fontSize: 22, marginBottom: 16 }}>
          Done for today.
        </p>
        <button className="link" onClick={() => app.anotherDare()}>
          Another dare {SYMBOLS.spark}
        </button>
      </div>
    );
  }

  // ---- Revelado: acción + instrucción + metadata, todo inline ----
  if (cd && revealed) {
    const d = cd.dare;
    const col = colorOf(d);
    return (
      <div className="card rise" style={{ padding: 24, borderColor: d.wild ? C.gold + "55" : C.line, boxShadow: `0 0 40px -22px ${col}` }}>
        <p className="lbl" style={{ marginBottom: 12, color: col }}>
          {d.wild ? "WILDCARD" : LABEL}
        </p>
        <p className="serif" style={{ fontSize: 26, lineHeight: 1.2, marginBottom: 8 }}>
          {d.title}
        </p>
        <p style={{ fontSize: 14, color: C.dim, lineHeight: 1.5, marginBottom: 14 }}>{d.trigger}</p>
        <p className="lbl" style={{ fontSize: 9, color: C.faint, marginBottom: 20 }}>
          {d.min} min · {CATS[d.cat].label}
        </p>
        <button className="btn btn-green" onClick={() => app.startDare()}>
          Start now
        </button>
        <div style={{ display: "flex", justifyContent: "center", gap: 20, marginTop: 14 }}>
          <button className="link" onClick={() => app.anotherDare()}>
            Another dare
          </button>
          <button className="link" style={{ color: C.faint }} onClick={() => app.setScreen("detail")}>
            View details
          </button>
        </div>
      </div>
    );
  }

  // ---- Cerrado: un dare esperando, un solo toque para abrirlo ----
  return (
    <div className="card rise" style={{ padding: 30, textAlign: "center" }}>
      <div className="pulse" style={{ fontSize: 22, color: C.gold, marginBottom: 14, opacity: 0.85 }}>
        {SYMBOLS.spark}
      </div>
      <p className="lbl" style={{ marginBottom: 8, color: C.dim }}>
        {LABEL}
      </p>
      <p className="serif" style={{ fontSize: 24, marginBottom: 22 }}>
        One dare is waiting.
      </p>
      <button
        className="btn btn-green"
        onClick={() => {
          cardRevealFeedback();
          app.revealTodayDare();
        }}
      >
        Reveal today's dare
      </button>
      <p style={{ fontSize: 11, color: C.faint, marginTop: 12 }}>Open when ready.</p>
    </div>
  );
}
