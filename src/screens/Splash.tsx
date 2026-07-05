import { C } from "../data/colors";
import { SYMBOLS } from "../data/symbols";
import { DareWord } from "../components/Wordmark";

/* ============================================================
   Splash — pantalla oscura de apertura. Reveal por CAPAS: primero
   entra SOLO el glifo (favicon), y un instante después suben "DARE"
   + eslogan. Es transitoria: App la muestra ~1.3s en cada cold-start
   (arranque en frío de la app/web) y luego revela la app. NO aparece
   al cambiar de pestaña ni en la navegación normal (App solo la monta
   al arrancar). Respeta prefers-reduced-motion (App no la monta).
   Presentacional puro; el timer vive en App.
   ============================================================ */
export function Splash() {
  return (
    <div
      className="dare-root"
      style={{
        minHeight: "100dvh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div style={{ position: "relative", textAlign: "center", lineHeight: 1 }}>
        {/* halo/horizonte verde detrás del FAVICON (no del bloque entero): se
            ancla al glifo para que el glow resida donde está el ✦, no bajo él.
            El glyph mide ~46px → su centro está a ~23px del top del bloque. */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            left: "50%",
            top: 23,
            transform: "translate(-50%, -50%)",
            width: 340,
            height: 340,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${C.green}22 0%, transparent 68%)`,
            pointerEvents: "none",
          }}
        />
        {/* 1 · el favicon entra primero */}
        <div className="splash-glyph" aria-hidden="true" style={{ position: "relative", color: C.green, fontSize: 46, marginBottom: 16 }}>
          {SYMBOLS.spark}
        </div>
        {/* 2 · DARE + eslogan entran después */}
        <div className="splash-word">
          <DareWord style={{ fontSize: 30, letterSpacing: "0.42em", textIndent: "0.42em" }} />
          <p style={{ fontSize: 12.5, color: C.green, marginTop: 14, letterSpacing: "0.02em" }}>
            Daily Actions. Real Energy.
          </p>
        </div>
      </div>
    </div>
  );
}
