import { C } from "../data/colors";
import { Wordmark } from "./Wordmark";

/* ============================================================
   TodayHeader — masthead de Today. Es CONTEXTO + calidez, no una
   acción: la marca DARE (logo + eslogan), la fecha y un titular
   inspirador. COMPACTO a propósito para que el Dare (héroe, justo
   debajo) quede sobre el pliegue. El único toque cálido de Today
   es un glow TENUE y ESTÁTICO detrás del wordmark (Today no es uno
   de los 3 momentos cálidos), y el único sparkle es el del propio
   wordmark — sin glifos extra que compitan. Ya NO muestra la línea
   del capítulo del Journey: eso vive abajo, en "Today's plan".
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
    <header style={{ marginBottom: 18, textAlign: "center" }}>
      {/* marca DARE con un glow tenue y estático detrás — único toque cálido */}
      <div style={{ position: "relative", display: "flex", justifyContent: "center", marginBottom: 16 }}>
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            width: 200,
            height: 200,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${accent}16 0%, transparent 68%)`,
            top: -66,
          }}
        />
        <div style={{ position: "relative" }}>
          <Wordmark size="sm" />
        </div>
      </div>

      <span className="lbl">{dayLabel}</span>
      <h1 className="serif t-title" style={{ lineHeight: 1.14, color: C.text, marginTop: 8 }}>
        {greeting}.
        <br />
        Today is yours.
      </h1>
      <p style={{ fontSize: 13.5, color: C.dim, marginTop: 8 }}>Small steps. Real energy.</p>
    </header>
  );
}
