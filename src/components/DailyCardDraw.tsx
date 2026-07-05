import { C } from "../data/colors";
import { SYMBOLS } from "../data/symbols";
import { TarotArt } from "./TarotArt";
import { cardRevealFeedback } from "../lib/feedback";
import type { DareApp } from "../lib/useDare";

/* ============================================================
   DailyCardDraw — el "card pull" del día. Vive en la pestaña You
   (antes estaba arriba en Today, que ahora es mínimo: solo el Dare).
   Es un placer opcional que buscas, no un peaje del ritual diario.
   Dos estados:
     1. Sin carta elegida → "DRAW YOUR CARD FOR TODAY" + tres cartas
        boca abajo para elegir una (`pickCard` → revela en `Card`).
     2. Carta elegida → miniatura tappable para volver a verla.
   ============================================================ */
export function DailyCardDraw({ app }: { app: DareApp }) {
  const { card, cardOptions } = app;

  // ---- 2. Carta ya elegida: miniatura para reabrir el revelado ----
  if (card) {
    return (
      <div style={{ marginBottom: 24 }}>
        <p className="lbl" style={{ letterSpacing: "0.3em", color: C.gold, marginBottom: 12 }}>
          TODAY'S CARD
        </p>
        <button
          onClick={() => app.setScreen("card")}
          aria-label={`View today's card: ${card.name}`}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            width: "100%",
            padding: 12,
            borderRadius: 14,
            border: `1px solid ${C.gold}33`,
            background: C.card2,
            cursor: "pointer",
            font: "inherit",
            color: C.text,
            textAlign: "left",
          }}
        >
          <div style={{ width: 54, flex: "0 0 auto" }}>
            <TarotArt id={card.id} width="100%" radius={7} alt={`${card.num} · ${card.name}`} />
          </div>
          <div>
            <p className="serif" style={{ fontSize: 18 }}>
              {card.name}
            </p>
            <p style={{ fontSize: 12, color: C.dim, marginTop: 2 }}>{card.msg}</p>
          </div>
        </button>
      </div>
    );
  }

  // ---- 1. Sin carta: elegir 1 de 3 (boca abajo) ----
  if (!cardOptions.length) return null;
  return (
    <div style={{ marginBottom: 24 }}>
      <p className="lbl" style={{ letterSpacing: "0.3em", color: C.gold, marginBottom: 14 }}>
        DRAW YOUR CARD FOR TODAY
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
    </div>
  );
}
