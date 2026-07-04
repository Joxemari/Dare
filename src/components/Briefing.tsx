import { C } from "../data/colors";
import { SYMBOLS } from "../data/symbols";
import type { Briefing as BriefingData } from "../lib/briefing";

/* ============================================================
   Widget de Briefing diario — la "lectura del día" estilo Co-Star.
   Presentacional puro: recibe el `Briefing` ya construido por la
   lógica pura (`lib/briefing.ts`). Superficie compartida con el
   recordatorio local (mismo contenido). Ver CLAUDE.md.
   ============================================================ */
export function Briefing({
  briefing,
  accent,
}: {
  briefing: BriefingData;
  accent: string;
}) {
  return (
    <div
      className="card rise"
      style={{
        padding: 20,
        marginBottom: 22,
        background: C.card2,
        borderColor: accent + "33",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <span style={{ color: accent, fontSize: 15 }}>{SYMBOLS[briefing.sym]}</span>
        <span className="lbl" style={{ color: accent }}>
          Today's briefing
        </span>
      </div>
      <p className="serif" style={{ fontSize: 20, lineHeight: 1.3, marginBottom: 12 }}>
        {briefing.headline}
      </p>
      {briefing.lines.map((line, i) => (
        <p key={i} style={{ fontSize: 13, color: C.dim, lineHeight: 1.55, marginBottom: 4 }}>
          {line}
        </p>
      ))}
      <p style={{ fontSize: 13, color: accent, marginTop: 12, lineHeight: 1.5 }}>{briefing.focus}</p>
    </div>
  );
}
