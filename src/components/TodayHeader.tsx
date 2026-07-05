import { C } from "../data/colors";
import { SYMBOLS } from "../data/symbols";

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
        <span
          role="img"
          aria-label="DARE"
          style={{ fontFamily: "var(--font-sans)", fontWeight: 400, fontSize: 14, letterSpacing: "0.34em", textIndent: "0.34em", color: C.text }}
        >
          DARE
        </span>
      </div>

      {/* Hero con la imagen del día + degradado + fecha y headline encima */}
      <div
        style={{
          position: "relative",
          borderRadius: 20,
          overflow: "hidden",
          minHeight: 230,
          background: C.card2,
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
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
        )}
        {/* Degradado para legibilidad: transparente arriba → casi negro abajo. */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(180deg, rgba(14,14,12,0.10) 0%, rgba(14,14,12,0.40) 48%, rgba(14,14,12,0.94) 100%)",
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
