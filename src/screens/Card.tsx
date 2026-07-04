import { C } from "../data/colors";
import { SYMBOLS } from "../data/symbols";
import { TarotArt } from "../components/TarotArt";
import { wrap } from "../components/layout";
import type { DareApp } from "../lib/useDare";

/** Revelado de la carta del día a pantalla completa. Se llega desde Home al
    elegir una de las tres cartas (`pickCard` → screen "card"); un tap en
    cualquier sitio continúa a Home. La imagen es la carta completa (marco,
    número, nombre y arte ya dibujados), por eso se muestra a sangre y grande,
    sin adornos: solo el mensaje debajo (que sí es texto de la app). */
export function Card({ app }: { app: DareApp }) {
  const { card } = app;
  const go = () => app.setScreen("home");

  // Seguridad: sin carta no hay nada que revelar → volver a Home al tocar.
  if (!card) {
    return <div className="dare-root" style={{ minHeight: "100dvh" }} onClick={go} />;
  }

  return (
    <div
      className="dare-root"
      onClick={go}
      role="button"
      aria-label="Continue"
      style={{ cursor: "pointer" }}
    >
      <div
        style={{
          ...wrap,
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "40px 28px",
          gap: 4,
        }}
      >
        <p className="lbl" style={{ color: C.gold, marginBottom: 20 }}>
          {SYMBOLS.spark} Your card today
        </p>

        <div className="flip" style={{ width: "72%", maxWidth: 300 }}>
          <TarotArt id={card.id} width="100%" radius={16} alt={`${card.num} · ${card.name}`} />
        </div>

        <p
          className="rise"
          style={{ fontSize: 15.5, lineHeight: 1.62, color: C.text, marginTop: 28, maxWidth: 360 }}
        >
          {card.msg}
        </p>

        <p className="lbl pulse" style={{ color: C.dim, marginTop: 30 }}>
          Tap to continue
        </p>
      </div>
    </div>
  );
}
