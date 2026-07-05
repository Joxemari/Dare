import { C } from "../data/colors";
import { SYMBOLS } from "../data/symbols";
import type { Briefing as BriefingData } from "../lib/briefing";

/* ============================================================
   Today's Briefing — la "lectura del día": UN consejo concreto
   inspirado en una persona conocida y un hábito/método real,
   accionable hoy. Presentacional puro: recibe el `Briefing` ya
   construido por la lógica pura (`lib/briefing.ts`).

   Se muestra DETRÁS de "Today's Door" (se revela al tocar la
   puerta). El CTA lo aporta el contenedor. Ver CLAUDE.md.
   ============================================================ */
export function Briefing({
  briefing,
  accent = C.gold,
}: {
  briefing: BriefingData;
  accent?: string;
}) {
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
        <span style={{ color: accent, fontSize: 15 }}>{SYMBOLS[briefing.sym]}</span>
        <span className="lbl" style={{ color: accent }}>
          Today's briefing
        </span>
      </div>
      <p className="serif" style={{ fontSize: 20, lineHeight: 1.3, marginBottom: 8, color: C.text }}>
        {briefing.person}
      </p>
      <p style={{ fontSize: 14, color: C.dim, lineHeight: 1.6, marginBottom: 14 }}>{briefing.insight}</p>
      <p style={{ fontSize: 14.5, color: C.text, lineHeight: 1.55 }}>
        <span style={{ color: accent }}>Today:</span> {briefing.action}
      </p>
    </div>
  );
}
