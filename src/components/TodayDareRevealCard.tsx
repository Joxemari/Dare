import { C, CATS, colorOf } from "../data/colors";
import { SYMBOLS } from "../data/symbols";
import type { DareApp } from "../lib/useDare";

/* ============================================================
   TodayDareRevealCard — "Your Dare" en Today. Dos formas de
   generar: "Just dare me" (aleatorio, un toque, revela INLINE) o
   "Check in first" (abre el check-in completo "How are you today?"
   — el ÚNICO check-in de la app). El Dare se revela inline.
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
        <button className="link" onClick={() => app.anotherQuickDare()}>
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
      <div className="card rise" style={{ padding: 24, borderColor: d.wild ? C.gold + "55" : C.line }}>
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
          <button className="link" onClick={() => app.anotherQuickDare()}>
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

  // ---- Cerrado: un toque genera el Dare; el check-in queda opcional ----
  return (
    <div className="card rise" style={{ padding: 30, textAlign: "center" }}>
      <p className="lbl" style={{ marginBottom: 8, color: C.dim }}>
        YOUR DARE OF THE DAY
      </p>
      <p style={{ fontSize: 15, color: C.dim, marginBottom: 22 }}>20 seconds. Then we choose for you.</p>
      <button className="btn btn-green" onClick={() => app.setScreen("checkin")}>
        Start check-in
      </button>
      {/* "Just dare me": rápido y aleatorio, se revela AQUÍ MISMO (inline, sin
          entrar en la pantalla del Dare). Segunda opción, en la propia card. */}
      <button className="btn btn-line" style={{ marginTop: 12 }} onClick={() => app.quickDareMe()}>
        Just dare me {SYMBOLS.spark}
      </button>
      <p style={{ fontSize: 12, color: C.faint, marginTop: 12 }}>Skips the questions. Uses what we know.</p>
    </div>
  );
}
