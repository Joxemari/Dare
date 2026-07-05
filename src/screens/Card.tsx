import { C } from "../data/colors";
import { SYMBOLS } from "../data/symbols";
import { TarotArt } from "../components/TarotArt";
import { ShareCardButton } from "../components/ShareCardButton";
import { cardRevealFeedback } from "../lib/feedback";
import type { DareApp } from "../lib/useDare";

/** Ritual de la carta del día. Dos estados:

    1. Sin carta elegida → RITUAL DE APERTURA: se muestran tres cartas boca abajo
       para ELEGIR una (`pickCard` → revela). Aparece UNA VEZ AL DÍA al abrir la
       app (gate en useDare: `shouldOpenCardIntro`) y es SALTABLE ("Skip for now"
       → `skipCardIntro`). La carta resultante vive luego en la pestaña You.
    2. Carta elegida → revelado a pantalla completa. La imagen ES la carta
       entera (marco, número, nombre, arte y texto), así que no se añade texto.
       Un tap continúa a Today. */
export function Card({ app }: { app: DareApp }) {
  const { card, cardOptions } = app;
  const go = () => app.setScreen("home");
  // Saltar el ritual: marca el día como resuelto para que no reaparezca hoy.
  const skip = () => app.skipCardIntro();

  // ---- 1. Elegir carta (boca abajo) — ritual de apertura, saltable ----
  if (!card) {
    if (!cardOptions.length) return <div className="dare-root" style={{ minHeight: "100dvh" }} onClick={skip} />;
    return (
      <div className="dare-root">
        <div style={{ minHeight: "100dvh", maxWidth: 430, margin: "0 auto", padding: "28px 24px", display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 24 }}>
            <span style={{ width: 16 }} />
            <span className="lbl" style={{ letterSpacing: "0.3em", color: C.gold }}>
              TODAY'S CARD
            </span>
            <span style={{ width: 16 }} />
          </div>

          <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <p className="serif" style={{ fontSize: 26, textAlign: "center", marginBottom: 8 }}>
              Draw your card.
            </p>
            <p style={{ fontSize: 13, color: C.dim, textAlign: "center", marginBottom: 30 }}>
              One card sets the tone for today.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
              {cardOptions.map((c, i) => (
                <button
                  key={c.id}
                  className="tcard"
                  style={{ aspectRatio: "5 / 8.5", position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}
                  onClick={() => {
                    cardRevealFeedback();
                    app.pickCard(c.id);
                  }}
                  aria-label="Face-down daily card"
                >
                  <div style={{ position: "absolute", inset: 6, border: `1px solid ${C.gold}33`, borderRadius: 9, pointerEvents: "none" }} />
                  <div style={{ position: "absolute", inset: 11, border: `1px solid ${C.gold}18`, borderRadius: 6, pointerEvents: "none" }} />
                  <span className="pulse" style={{ color: C.gold, fontSize: 20, opacity: 0.75, animationDelay: `${i * 0.4}s` }}>
                    {SYMBOLS.spark}
                  </span>
                </button>
              ))}
            </div>

            <button className="link" style={{ color: C.faint, marginTop: 30 }} onClick={skip}>
              Skip for now
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ---- 2. Revelado a pantalla completa ----
  return (
    <div
      className="dare-root"
      onClick={go}
      role="button"
      aria-label="Continue"
      style={{
        cursor: "pointer",
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 22,
        padding: 20,
      }}
    >
      {/* width limita también la altura: la carta es 2:3, así que 54vh de ancho
          ⇒ ~81vh de alto, dejando sitio al hint sin recortar en pantallas bajas. */}
      <div className="flip" style={{ width: "min(94vw, 54vh)" }}>
        <TarotArt id={card.id} width="100%" radius={18} alt={`${card.num} · ${card.name}`} />
      </div>

      {/* Compartir: para el tap del contenedor (que navega a Home) para que
          pulsar Share no salga de la pantalla. */}
      <div onClick={(e) => e.stopPropagation()}>
        <ShareCardButton card={card} />
      </div>

      <p className="lbl pulse" style={{ color: C.dim }}>
        Tap to continue
      </p>
    </div>
  );
}
