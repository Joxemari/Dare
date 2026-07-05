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

/** Logotipo "DARE" como UN ÚNICO SVG (traza aportada por diseño). La A es una A
 *  ABIERTA sin barra horizontal (dos diagonales en pico). Al ser una sola pieza:
 *  nunca se parte en dos líneas (el problema del intento anterior mezclando texto
 *  + SVG inline), escala nítido a cualquier tamaño y hereda el color vía
 *  `currentColor`. Se dimensiona por `fontSize` del contenedor (height ≈ altura de
 *  mayúscula); `letterSpacing`/`textIndent` que pasan los llamadores se ignoran
 *  (el tracking va horneado en la geometría). `viewBox` ajustado a la tinta.
 *  `aria-label="DARE"` para lectores. Fuente única de la marca; se reutiliza en
 *  Wordmark, Splash, Onboarding y el masthead de Today. */
export function DareWord({ style }: { style?: CSSProperties }) {
  return (
    <svg
      role="img"
      aria-label="DARE"
      viewBox="81 81 1298 238"
      fill="none"
      style={{ height: "0.78em", width: "auto", display: "inline-block", verticalAlign: "baseline", color: C.text, ...style }}
    >
      <g stroke="currentColor" strokeWidth={18} strokeLinecap="round" strokeLinejoin="round">
        {/* D */}
        <path d="M90 90V310H205Q285 310 285 230V170Q285 90 205 90H90Z" />
        {/* A — pico sin barra */}
        <path d="M470 310L560 90L650 310" />
        {/* R */}
        <path d="M800 310V90" />
        <path d="M800 90H925Q1005 90 1005 160Q1005 225 925 225H800" />
        <path d="M905 225L1015 310" />
        {/* E */}
        <path d="M1160 90V310" />
        <path d="M1160 90H1370" />
        <path d="M1160 200H1330" />
        <path d="M1160 310H1370" />
      </g>
    </svg>
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
