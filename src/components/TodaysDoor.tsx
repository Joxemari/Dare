import { useState } from "react";
import { C } from "../data/colors";
import { Briefing } from "./Briefing";
import { AtmosphereHero } from "./AtmosphereHero";
import { cardRevealFeedback } from "../lib/feedback";
import type { Briefing as BriefingData } from "../lib/briefing";

/* ============================================================
   TodaysDoor — "Today's Door" que se abre (flip) para revelar
   "Today's Briefing" detrás: un consejo concreto inspirado en
   alguien conocido, accionable hoy. CTA: usarlo para tu Dare o
   cerrarlo. Parte de la atmósfera mínima de Today.
   ============================================================ */
export function TodaysDoor({
  briefing,
  accent = C.gold,
  onUseForDare,
}: {
  briefing: BriefingData;
  accent?: string;
  onUseForDare: () => void;
}) {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button
        onClick={() => {
          cardRevealFeedback();
          setOpen(true);
        }}
        aria-label="Open today's briefing"
        style={{
          display: "block",
          width: "100%",
          padding: 0,
          border: "none",
          background: "transparent",
          cursor: "pointer",
          font: "inherit",
          textAlign: "inherit",
        }}
      >
        <AtmosphereHero accent={accent} subtitle="Tap to open today's briefing" />
      </button>
    );
  }

  return (
    <div
      className="flip"
      style={{
        borderRadius: 24,
        border: `1px solid ${accent}33`,
        background: "linear-gradient(180deg, #131311 0%, #0E0E0C 100%)",
        padding: "26px 24px 22px",
        minHeight: 250,
      }}
    >
      <Briefing briefing={briefing} accent={accent} />
      <div style={{ display: "flex", gap: 10, marginTop: 22 }}>
        <button
          className="btn btn-green"
          style={{ flex: 1 }}
          onClick={() => {
            setOpen(false);
            onUseForDare();
          }}
        >
          Use this for my Dare
        </button>
        <button className="btn btn-line" style={{ flex: "0 0 auto", padding: "12px 18px" }} onClick={() => setOpen(false)}>
          Close
        </button>
      </div>
    </div>
  );
}
