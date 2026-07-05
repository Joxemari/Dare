import type { CSSProperties } from "react";
import { C } from "../data/colors";
import { SYMBOLS } from "../data/symbols";

/* ============================================================
   Wordmark — la marca de DARE: el glifo sparkle ✦ sobre el
   logotipo "DARE" (muy espaciado) y, opcional, el eslogan
   "Daily Actions. Real Energy.". Presentacional puro; se reutiliza
   en el Splash de apertura, en el Onboarding y en el masthead de
   Today. El glifo es decorativo (aria-hidden); el logotipo lleva
   role/aria-label para lectores.
   ============================================================ */

/** Logotipo "DARE" con un DETALLE de marca: la A es una A ABIERTA sin barra
 *  horizontal (dos diagonales en pico, tipo Λ), no una A normal ni el triángulo
 *  relleno △ (que quedaba desproporcionado dentro de la palabra). Se dibuja con
 *  un SVG a altura de mayúscula y con el grosor de trazo de D·R·E → proporcionado
 *  y hereda el color (currentColor). La estrella ✦ va como glifo APARTE (encima/
 *  al lado). `aria-label="DARE"` para lectores. Fuente única de la marca escrita;
 *  se reutiliza en Wordmark, Splash, Onboarding y el masthead de Today. */
export function DareWord({ style }: { style?: CSSProperties }) {
  return (
    <span
      role="img"
      aria-label="DARE"
      style={{ fontFamily: "var(--font-sans)", fontWeight: 400, display: "inline-block", color: C.text, ...style }}
    >
      D
      {/* A sin barra: pico Λ. viewBox con la misma proporción que height/width
          para no deformar el trazo; se apoya en la línea base como una letra. */}
      <svg
        aria-hidden="true"
        viewBox="0 0 69 80"
        style={{ height: "0.72em", width: "0.62em", verticalAlign: "baseline" }}
      >
        <path
          d="M6 75 L34.5 7 L63 75"
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      RE
    </span>
  );
}
export function Wordmark({
  size = "md",
  tagline = true,
  glyphColor = C.green,
}: {
  size?: "sm" | "md" | "lg";
  tagline?: boolean;
  glyphColor?: string;
}) {
  const glyph = size === "lg" ? 46 : size === "sm" ? 22 : 32;
  const word = size === "lg" ? 30 : size === "sm" ? 15 : 21;
  const gap = size === "lg" ? "0.42em" : "0.34em";

  return (
    <div style={{ textAlign: "center", lineHeight: 1 }}>
      <div aria-hidden="true" style={{ color: glyphColor, fontSize: glyph, marginBottom: size === "lg" ? 14 : 8 }}>
        {SYMBOLS.spark}
      </div>
      {/* El tracking añade espacio a la derecha de la última letra: `textIndent`
          lo compensa para que el bloque quede ópticamente centrado. */}
      <DareWord style={{ fontSize: word, letterSpacing: gap, textIndent: gap }} />
      {tagline && (
        <p
          style={{
            fontSize: size === "lg" ? 12.5 : 11,
            color: C.green,
            marginTop: size === "lg" ? 14 : 10,
            letterSpacing: "0.02em",
          }}
        >
          Daily Actions. Real Energy.
        </p>
      )}
    </div>
  );
}
