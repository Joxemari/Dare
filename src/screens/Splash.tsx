import { C } from "../data/colors";
import { Wordmark } from "../components/Wordmark";

/* ============================================================
   Splash — pantalla oscura de apertura tras el onboarding. El
   logo aparece en el centro, crece suavemente y un "shine" cruza
   el wordmark (inspiración: How We Feel). Es transitoria: App la
   muestra ~1.7s al arrancar y luego revela la app. Respeta
   prefers-reduced-motion (App no la monta si está activo).
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
      {/* halo/horizonte verde detrás del logo */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          width: 340,
          height: 340,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${C.green}22 0%, transparent 68%)`,
        }}
      />
      <div className="splash-in" style={{ position: "relative" }}>
        <div className="splash-shine">
          <Wordmark size="lg" />
        </div>
      </div>
    </div>
  );
}
