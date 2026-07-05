import { C } from "../data/colors";
import { SYMBOLS } from "../data/symbols";
import { Wordmark } from "./Wordmark";

/* ============================================================
   TodayHeader — masthead de Today. Es CONTEXTO + calidez, no una
   acción: la marca DARE (logo + eslogan), la fecha, un titular
   inspirador y un pequeño "hero" con glow de horizonte. Ninguna
   acción compite con el Dare (héroe, justo debajo). El glifo del
   hero es decorativo (aria-hidden). Ya NO muestra la línea del
   capítulo del Journey: eso vive abajo, en "Today's plan".
   Presentacional puro: recibe los textos ya formados.
   ============================================================ */
export function TodayHeader({
  dayLabel,
  greeting,
  accent = C.green,
}: {
  dayLabel: string;
  greeting: string;
  accent?: string;
}) {
  return (
    <header style={{ marginBottom: 24, textAlign: "center" }}>
      {/* marca DARE (logo + wordmark + eslogan) — vuelve a Today */}
      <div style={{ marginBottom: 22 }}>
        <Wordmark size="sm" />
      </div>

      {/* hero con glow de horizonte, TENUE y ESTÁTICO: Today no es uno de los 3
          momentos cálidos, así que el calor aquí es un toque contenido (sin
          pulso). El único sparkle de Today vive aquí (la card del Dare ya no
          repite otro). */}
      <div style={{ position: "relative", display: "flex", justifyContent: "center", marginBottom: 18 }}>
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            width: 180,
            height: 180,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${accent}18 0%, transparent 68%)`,
            top: -60,
          }}
        />
        <span aria-hidden="true" style={{ color: accent, fontSize: 32, position: "relative" }}>
          {SYMBOLS.spark}
        </span>
      </div>

      <span className="lbl">{dayLabel}</span>
      <h1 className="serif" style={{ fontSize: 34, lineHeight: 1.14, color: C.text, marginTop: 10 }}>
        {greeting}.
        <br />
        Today is yours.
      </h1>
      <p style={{ fontSize: 13.5, color: C.dim, marginTop: 10 }}>Small steps. Real energy.</p>
    </header>
  );
}
