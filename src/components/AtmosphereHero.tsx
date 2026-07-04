import type { ReactNode } from "react";
import { C } from "../data/colors";

/* ============================================================
   AtmosphereHero — la "atmósfera diaria" de Today. Tarjeta grande,
   matte, con grano sutil y un símbolo de línea central (no una
   ilustración). Modular a propósito: el símbolo, los textos y el
   acento son props para poder cambiarlos por estado / journey /
   tipo de dare más adelante.
   ============================================================ */

/** Símbolo por defecto: un portal / puerta arqueada de línea fina, con un
    pequeño glow central y luz sutil emergiendo por la base. */
export function DoorSymbol({ accent = C.gold, size = 92 }: { accent?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" aria-hidden="true">
      <defs>
        <radialGradient id="doorGlow" cx="50%" cy="88%" r="60%">
          <stop offset="0%" stopColor={accent} stopOpacity="0.55" />
          <stop offset="55%" stopColor={accent} stopOpacity="0.12" />
          <stop offset="100%" stopColor={accent} stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* luz que emerge por la base de la puerta */}
      <ellipse cx="50" cy="82" rx="26" ry="16" fill="url(#doorGlow)" />
      {/* arco de la puerta — línea fina cálida */}
      <path
        d="M30 84 V44 a20 20 0 0 1 40 0 V84"
        stroke={accent}
        strokeWidth="1.4"
        strokeLinecap="round"
        fill="none"
      />
      {/* umbral */}
      <path d="M26 84 H74" stroke={accent} strokeWidth="1.4" strokeLinecap="round" />
      {/* rendija de luz interior */}
      <path d="M50 84 V50" stroke={accent} strokeWidth="1" strokeLinecap="round" opacity="0.5" />
      {/* pequeño destello central */}
      <circle cx="50" cy="60" r="1.6" fill={accent} opacity="0.9" />
    </svg>
  );
}

export function AtmosphereHero({
  title = "Today's Door",
  subtitle = "One opening is enough.",
  accent = C.gold,
  symbol,
}: {
  title?: string;
  subtitle?: string;
  accent?: string;
  symbol?: ReactNode;
}) {
  return (
    <div
      style={{
        position: "relative",
        borderRadius: 24,
        overflow: "hidden",
        border: `1px solid ${C.line}`,
        // fondo matte casi negro con degradado suave hacia el acento por abajo
        background: `radial-gradient(120% 90% at 50% 118%, ${accent}22 0%, transparent 55%), linear-gradient(180deg, #131311 0%, #0E0E0C 100%)`,
        padding: "34px 24px 30px",
        textAlign: "center",
        minHeight: 250,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* grano sutil (SVG de ruido inline, sin assets externos) */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          opacity: 0.05,
          mixBlendMode: "overlay",
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />
      <div className="pulse" style={{ position: "relative", marginBottom: 16 }}>
        {symbol ?? <DoorSymbol accent={accent} />}
      </div>
      <h2 className="serif" style={{ position: "relative", fontSize: 27, marginBottom: 6, color: C.text }}>
        {title}
      </h2>
      <p style={{ position: "relative", fontSize: 13.5, color: C.dim, letterSpacing: "0.01em" }}>{subtitle}</p>
    </div>
  );
}
