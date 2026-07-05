import { C, CATS, colorOf } from "../data/colors";
import { SYMBOLS } from "../data/symbols";
import { QuickCheckin } from "./QuickCheckin";
import type { DareApp } from "../lib/useDare";

/* ============================================================
   TodayDareRevealCard — "Your Dare" en Today.
   A diferencia de antes, generar un Dare EXIGE un check-in rápido
   (energía · foco · qué evitas): tap en "Your Dare" → check-in →
   Dare generado → Start. El Dare se revela INLINE (sin navegar).
   ============================================================ */

const LABEL = "YOUR DARE";

export function TodayDareRevealCard({ app }: { app: DareApp }) {
  const cd = app.currentDare;
  const revealed = !!cd && cd.revealed;
  const completed = !!cd && cd.completed;

  // ---- Check-in rápido en curso: sustituye la tarjeta ----
  if (app.checkingIn) {
    return <QuickCheckin app={app} />;
  }

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
        <button className="link" onClick={() => app.startQuickCheckin()}>
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
        <p style={{ fontSize: 14, color: C.dim, lineHeight: 1.5, marginBottom: 14 }}>{d.summary ?? d.trigger}</p>
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

  // ---- Un Dare oculto ya generado (p. ej. Planned) — un toque lo revela ----
  if (cd && !revealed) {
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
        <button className="btn btn-green" onClick={() => app.revealTodayDare()}>
          Reveal it
        </button>
      </div>
    );
  }

  // ---- Cerrado: "Your Dare" pide un check-in rápido antes de generar ----
  return (
    <div className="card rise" style={{ padding: 30, textAlign: "center" }}>
      <div className="pulse" style={{ fontSize: 22, color: C.green, marginBottom: 14, opacity: 0.9 }}>
        {SYMBOLS.spark}
      </div>
      <p className="lbl" style={{ marginBottom: 8, color: C.dim }}>
        YOUR DARE OF THE DAY
      </p>
      <p style={{ fontSize: 15, color: C.dim, marginBottom: 22 }}>20 seconds. Then we choose for you.</p>
      <button className="btn btn-green" onClick={() => app.startQuickCheckin()}>
        Start check-in
      </button>
    </div>
  );
}
