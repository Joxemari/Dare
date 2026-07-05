import { useEffect } from "react";
import { C } from "../data/colors";
import { SYMBOLS } from "../data/symbols";
import { wrap, pad } from "../components/layout";
import { energyForLevel, stateForLevel } from "../lib/generator";
import type { CurrentLoc, EnergyLevel } from "../types";
import type { DareApp } from "../lib/useDare";

// Check-in de 3 preguntas (spec): Time / Place / Energy. Place es el filtro
// más fuerte — "Take me somewhere ✦" (loc "anywhere") es la única excepción,
// donde DARE elige el destino en vez de quedarse donde estás.
const places: [CurrentLoc, string][] = [
  ["home", "Home"],
  ["city", "City"],
  ["park", "Park"],
  ["anywhere", "Take me somewhere ✦"],
];
const energyLevels: [EnergyLevel, string][] = [
  ["tired", "Tired"],
  ["calm", "Calm"],
  ["normal", "Normal"],
  ["high", "High"],
];

export function Checkin({ app }: { app: DareApp }) {
  const { draft, setDraft } = app;
  // Sin router: al cambiar de screen no se resetea el scroll. Al abrir el
  // check-in, lo llevamos ARRIBA para que lo primero que veas sea el título.
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, []);
  const ready = draft.time && draft.loc && draft.energyLevel;

  return (
    <div className="dare-root">
      <div style={wrap}>
        <div style={pad}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 26 }}>
            <button className="link" style={{ textDecoration: "none", fontSize: 16 }} aria-label="Back to Today" onClick={() => app.setScreen("home")}>
              ←
            </button>
            <span className="lbl">Quick check-in</span>
            <span style={{ width: 16 }} />
          </div>
          <h2 className="serif t-title" style={{ marginBottom: 4 }}>
            How are you today?
          </h2>
          <p style={{ color: C.dim, fontSize: 13, marginBottom: 18 }}>This helps me choose your perfect dare.</p>
          <button
            className="btn btn-line"
            style={{ marginBottom: 26, fontSize: 13.5, padding: 12 }}
            onClick={() => app.justDareMe()}
          >
            Just dare me — skip the questions {SYMBOLS.spark}
          </button>

          <p className="lbl" style={{ marginBottom: 10 }}>
            Time
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, marginBottom: 22 }}>
            {[5, 10, 20, 30].map((t) => (
              <button
                key={t}
                className={"pill" + (draft.time === t ? " on" : "")}
                aria-pressed={draft.time === t}
                onClick={() => setDraft({ ...draft, time: t })}
              >
                {t === 30 ? "30+ min" : `${t} min`}
              </button>
            ))}
          </div>

          <p className="lbl" style={{ marginBottom: 10 }}>
            Place
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 8, marginBottom: 22 }}>
            {places.map(([id, t]) => (
              <button
                key={id}
                className={"pill" + (draft.loc === id ? " on" : "")}
                style={{ fontSize: 12 }}
                aria-pressed={draft.loc === id}
                onClick={() => setDraft({ ...draft, loc: id })}
              >
                {t}
              </button>
            ))}
          </div>

          <p className="lbl" style={{ marginBottom: 10 }}>
            Energy
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, marginBottom: 26 }}>
            {energyLevels.map(([id, t]) => (
              <button
                key={id}
                className={"pill" + (draft.energyLevel === id ? " on" : "")}
                aria-pressed={draft.energyLevel === id}
                onClick={() => setDraft({ ...draft, energyLevel: id })}
              >
                {t}
              </button>
            ))}
          </div>

          <button
            className="btn btn-ghost"
            disabled={!ready}
            style={{ opacity: ready ? 1 : 0.35 }}
            onClick={() =>
              ready &&
              app.runCheckin({
                // Energy es una pregunta DIRECTA (ya no se deriva del estado mental).
                energy: energyForLevel(draft.energyLevel!),
                time: draft.time!,
                loc: draft.loc!,
                state: stateForLevel(draft.energyLevel!),
              })
            }
          >
            Get my dare
          </button>
          {/* El botón queda atenuado hasta completar las tres: una pista corta
              evita la confusión de "por qué no puedo continuar". */}
          {!ready && (
            <p style={{ fontSize: 11.5, color: C.faint, textAlign: "center", marginTop: 10 }}>
              Answer all three to continue.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
