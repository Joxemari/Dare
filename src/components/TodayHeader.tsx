import { C } from "../data/colors";
import { SYMBOLS } from "../data/symbols";
import { DareWord } from "./Wordmark";

/* ============================================================
   TodayHeader — masthead de Today. CONTEXTO + calidez, no acción.
   - Logo de la app arriba a la IZQUIERDA: glifo ✦ (pulso pequeño) +
     "DARE". Es solo el logo; sin 2º favicon apilado y sin eslogan.
   - Hero con la IMAGEN del día (rotatoria, una por día desde
     src/assets/today vía import.meta.glob en Home) + degradado a
     negro por abajo para legibilidad, con la FECHA y un HEADLINE
     motivacional (rotatorio, no cheesy) encima.
   Presentacional puro: recibe los textos y la URL ya resueltos.
   ============================================================ */
export function TodayHeader({
  dayLabel,
  headline,
  bgUrl,
}: {
  dayLabel: string;
  headline: string;
  bgUrl?: string;
}) {
  return (
    <header style={{ marginBottom: 20 }}>
      {/* Logo de la app — favicon con pulso + DARE, a la izquierda */}
      <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 14 }}>
        <span className="pulse" aria-hidden="true" style={{ color: C.green, fontSize: 17, lineHeight: 1 }}>
          {SYMBOLS.spark}
        </span>
        <DareWord style={{ fontSize: 14, letterSpacing: "0.34em", textIndent: "0.34em" }} />
      </div>

      {/* Hero con la imagen del día + fecha y headline encima. Las imágenes son
          un objeto centrado sobre fondo casi negro, así que:
          - `contain`: se ve el objeto ENTERO (con `cover` se recortaba, p. ej.
            los bulbos del reloj de arena).
          - posición a la DERECHA: deja el margen izquierdo para fecha/headline.
          - máscara radial: FUNDE los bordes a transparente para que la imagen se
            derrita en el fondo #111 (sin el "seam" duro del rectángulo). */}
      <div
        style={{
          position: "relative",
          minHeight: 210,
          display: "flex",
        }}
      >
        {bgUrl && (
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage: `url(${bgUrl})`,
              backgroundSize: "contain",
              backgroundPosition: "right center",
              backgroundRepeat: "no-repeat",
              WebkitMaskImage:
                "radial-gradient(115% 118% at 72% 42%, #000 46%, transparent 82%)",
              maskImage:
                "radial-gradient(115% 118% at 72% 42%, #000 46%, transparent 82%)",
            }}
          />
        )}
        {/* Degradado inferior para legibilidad de fecha/headline. */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(180deg, transparent 0%, transparent 42%, rgba(17,17,17,0.72) 82%, #111 100%)",
          }}
        />
        <div style={{ position: "relative", alignSelf: "flex-end", padding: "18px 18px 20px", width: "100%" }}>
          <span className="lbl" style={{ color: "#d7d7cd" }}>
            {dayLabel}
          </span>
          <h1 className="serif t-title" style={{ color: "#fff", marginTop: 6, lineHeight: 1.12 }}>
            {headline}
          </h1>
        </div>
      </div>
    </header>
  );
}
