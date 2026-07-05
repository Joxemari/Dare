import { C } from "../data/colors";
import { SYMBOLS } from "../data/symbols";

/* ============================================================
   TodayHeader — masthead de Today: fecha + saludo + (si estás
   EMBARCADO en un Journey) el capítulo en curso. Es solo CONTEXTO
   y calidez: ninguna acción que compita con el Dare. El glifo es
   decorativo (aria-hidden), no un icono-acción en la esquina.
   Presentacional puro: recibe los textos ya formados.
   ============================================================ */
export function TodayHeader({
  dayLabel,
  greeting,
  journeyLine,
  accent = C.green,
}: {
  dayLabel: string;
  greeting: string;
  journeyLine?: string | null;
  accent?: string;
}) {
  return (
    <header style={{ marginBottom: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <span className="lbl">{dayLabel}</span>
        <span aria-hidden="true" style={{ color: accent, fontSize: 15, opacity: 0.85 }}>
          {SYMBOLS.spark}
        </span>
      </div>
      <h1 className="serif" style={{ fontSize: 34, lineHeight: 1.12, color: C.text }}>
        {greeting}.
        <br />
        One dare today.
      </h1>
      {journeyLine && (
        <p className="lbl" style={{ marginTop: 12, color: accent }}>
          {journeyLine}
        </p>
      )}
    </header>
  );
}
