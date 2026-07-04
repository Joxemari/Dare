import { C } from "../data/colors";
import { TarotArt } from "../components/TarotArt";
import type { DareApp } from "../lib/useDare";

/** Revelado de la carta del día a pantalla completa. Se llega desde Home al
    elegir una de las tres cartas (`pickCard` → screen "card"); un tap en
    cualquier sitio continúa a Home.

    La imagen ES la carta completa (marco, número, nombre, arte Y su texto ya
    dibujados), así que aquí NO se añade nada de texto: la carta ocupa casi toda
    la pantalla para leerla y apreciarla. El mensaje de la app vive en Home,
    junto al icono de carta (tocarlo reabre este revelado). */
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

      <p className="lbl pulse" style={{ color: C.dim }}>
        Tap to continue
      </p>
    </div>
  );
}
