import { useState } from "react";
import { C } from "../data/colors";
import { SYMBOLS } from "../data/symbols";
import { findTrait } from "../data/traits";
import { journeyById } from "../data/journeys";
import { wrap, pad } from "../components/layout";
import type { DareApp } from "../lib/useDare";

/* Celebración de fin de Journey (spec: "Journey complete → Dream Reward
   unlocked"). Se llega aquí al completar el último milestone del último
   capítulo (ver useDare.applyMilestones). Premium, oscura, dorada y sobria:
   el Dream Reward es el héroe, seguido de la identidad ganada y un siguiente
   paso claro. No hay XP ni cita de proof. Los demás Journeys no se tocan. */
export function JourneyComplete({ app }: { app: DareApp }) {
  const id = app.justCompletedJourney;
  const [dateChosen, setDateChosen] = useState<string | null>(null);
  const [showDates, setShowDates] = useState(false);

  // Sin Journey recién completado (p. ej. refresco): vuelve a Home.
  if (!id) return null;
  const journey = journeyById(id);
  // La identidad final del Journey existe siempre como Trait (lo garantiza el
  // test data.test), pero caemos al símbolo del Journey por si acaso.
  const trait = findTrait(journey.identity.id);
  const identSym = SYMBOLS[trait ? trait.sym : journey.sym];
  const identName = journey.identity.name;
  const identLine = journey.identity.line;
  const dreamReward = app.store.dreamRewards[id];

  return (
    <div className="dare-root">
      <div style={{ ...wrap, textAlign: "center", position: "relative", overflow: "hidden" }}>
        {/* símbolos sutiles ✦ ✧ ◈ flotando en dorado */}
        {[
          { x: "14%", t: "12%", g: SYMBOLS.spark },
          { x: "80%", t: "16%", g: SYMBOLS.treat },
          { x: "22%", t: "70%", g: SYMBOLS.dream },
          { x: "72%", t: "62%", g: SYMBOLS.spark },
          { x: "50%", t: "84%", g: SYMBOLS.treat },
        ].map((s, i) => (
          <span
            key={i}
            className="pulse"
            style={{ position: "absolute", left: s.x, top: s.t, color: C.gold, opacity: 0.32, fontSize: 11 + (i % 3) * 4, animationDelay: `${i * 0.5}s` }}
          >
            {s.g}
          </span>
        ))}

        <div style={{ ...pad, display: "flex", flexDirection: "column", justifyContent: "center", minHeight: "100%" }}>
          <div className="rise">
            {/* héroe: el símbolo del Dream Reward con glow dorado */}
            <div
              style={{
                width: 92,
                height: 92,
                borderRadius: 99,
                border: `1px solid ${C.gold}`,
                margin: "0 auto 24px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 38,
                color: C.gold,
                boxShadow: `0 0 70px -10px ${C.gold}`,
              }}
            >
              {SYMBOLS.dream}
            </div>

            <h2 className="serif t-display" style={{ marginBottom: 6 }}>
              Journey complete.
            </h2>
            <p style={{ color: C.dim, fontSize: 14, marginBottom: 26 }}>
              {SYMBOLS[journey.sym]} {journey.name}
            </p>

            {/* Dream Reward — el héroe del cierre */}
            <p className="lbl" style={{ color: C.gold, marginBottom: 12 }}>
              Dream Reward unlocked
            </p>
            {dreamReward && (
              <div
                className="card flip"
                style={{ padding: 22, margin: "0 auto 22px", maxWidth: 300, borderColor: C.gold + "66", boxShadow: `0 0 44px -14px ${C.gold}` }}
              >
                <p className="serif t-heading" style={{ marginBottom: 8 }}>
                  {SYMBOLS.dream} {dreamReward}
                </p>
                <p style={{ fontSize: 13, color: C.dim, lineHeight: 1.5 }}>
                  You chose this before you started. Now schedule it.
                </p>
              </div>
            )}

            {/* identidad ganada — una sola, sin spam de badges */}
            <div className="card" style={{ padding: "14px 18px", margin: "0 auto 26px", maxWidth: 300, background: C.card2 }}>
              <p className="serif t-subhead" style={{ marginBottom: 4 }}>
                {identSym} {identName}
              </p>
              <p style={{ fontSize: 12.5, color: C.dim }}>{identLine}</p>
            </div>

            {/* siguiente paso claro */}
            {dateChosen ? (
              <p style={{ fontSize: 13, color: C.green, marginBottom: 18 }}>
                Date set — {dateChosen}. Enjoy the reward you earned.
              </p>
            ) : showDates ? (
              <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap", marginBottom: 18 }}>
                {([["This Saturday", "saturday"], ["This Sunday", "sunday"], ["Pick later", "later"]] as const).map(([lbl, w]) => (
                  <button
                    key={w}
                    className="pill"
                    style={{ padding: "9px 14px", fontSize: 12, width: "auto" }}
                    onClick={() => {
                      app.scheduleDate(w);
                      setDateChosen(lbl);
                    }}
                  >
                    {lbl}
                  </button>
                ))}
              </div>
            ) : (
              <button className="btn btn-green" style={{ marginBottom: 12 }} onClick={() => setShowDates(true)}>
                {SYMBOLS.treat} Schedule my Date
              </button>
            )}

            <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
              <button className="link" onClick={() => app.setScreen("progress")}>
                View Progress
              </button>
              <span style={{ color: C.faint }}>·</span>
              <button className="link" onClick={() => app.setScreen("journeys")}>
                Choose next Journey
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
