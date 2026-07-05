import { useState } from "react";
import { C } from "../data/colors";
import { TIER, DATE_IDEAS } from "../data/rewards";
import { SYMBOLS } from "../data/symbols";
import { TRAITS, findTrait } from "../data/traits";
import { journeyById } from "../data/journeys";
import { wrap, pad } from "../components/layout";
import { cardRevealFeedback } from "../lib/feedback";
import type { DareApp } from "../lib/useDare";

export function Complete({ app }: { app: DareApp }) {
  const { treat, treatFlipped, newTraits, justCompletedJourney } = app;
  const t = treat ? TIER[treat.tier] : TIER.common;
  // Como máximo UN badge en la completion (el destacado); el resto, en Progress.
  const badge = newTraits.length ? TRAITS.find((x) => x.id === newTraits[0]) : undefined;
  const [dateChosen, setDateChosen] = useState<string | null>(null);
  const completedJourney = justCompletedJourney ? journeyById(justCompletedJourney) : null;
  // Símbolo propio del Badge (vía su Trait); si no, el símbolo del Journey.
  const badgeSym = completedJourney
    ? (findTrait(completedJourney.identity.id)?.sym ?? completedJourney.sym)
    : "spark";

  return (
    <div className="dare-root">
      <div style={{ ...wrap, textAlign: "center", position: "relative", overflow: "hidden" }}>
        {["12%", "78%", "30%", "64%", "88%"].map((x, i) => (
          <span
            key={i}
            className="pulse"
            style={{ position: "absolute", left: x, top: `${10 + i * 15}%`, color: C.gold, opacity: 0.4, fontSize: 9 + (i % 3) * 3, animationDelay: `${i * 0.5}s` }}
          >
            {SYMBOLS.spark}
          </span>
        ))}
        <div style={{ ...pad, display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <div className="rise">
            <div
              style={{
                width: 80,
                height: 80,
                borderRadius: 99,
                border: `1px solid ${C.green}`,
                margin: "0 auto 22px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 30,
                color: C.green,
                boxShadow: `0 0 60px -14px ${C.green}`,
              }}
            >
              ✓
            </div>
            <h2 className="serif" style={{ fontSize: 38, marginBottom: 6 }}>
              Dare completed.
            </h2>
            <p style={{ color: C.green, fontSize: 15, marginBottom: 6 }}>Proof collected · saved to your library.</p>
            <p style={{ color: C.gold, fontSize: 17, marginBottom: 20 }}>{SYMBOLS.treat} Treat unlocked.</p>

            {/* treat draw — the hero of the completion */}
            {treat && !treatFlipped ? (
              <button
                className="tcard pulse"
                style={{ width: 180, height: 104, margin: "0 auto 24px", display: "block" }}
                onClick={() => {
                  cardRevealFeedback();
                  app.setTreatFlipped(true);
                }}
              >
                <span style={{ color: C.gold, fontSize: 16 }}>{SYMBOLS.treat}</span>
                <p className="lbl" style={{ marginTop: 8 }}>
                  Treat unlocked
                </p>
                <p style={{ fontSize: 11, color: C.faint, marginTop: 4 }}>Tap to reveal</p>
              </button>
            ) : (
              treat && (
                <div
                  className="card flip"
                  style={{
                    padding: 18,
                    margin: "0 auto 24px",
                    maxWidth: 280,
                    borderColor: t.color + "66",
                    boxShadow: treat.tier === "golden" ? `0 0 44px -12px ${C.gold}` : "none",
                  }}
                >
                  <p className="lbl" style={{ color: t.color, marginBottom: 6 }}>
                    {SYMBOLS.treat} {t.label}
                  </p>
                  <p className="serif" style={{ fontSize: 18, lineHeight: 1.35 }}>
                    {treat.text}
                  </p>
                </div>
              )
            )}

            {/* one badge, at most — meaningful, not spammy */}
            {badge && (
              <div
                className="card flip"
                style={{ padding: "12px 16px", marginBottom: 24, display: "inline-block", borderColor: C.gold + "55" }}
              >
                <p style={{ fontSize: 13 }}>
                  <span style={{ color: C.gold, fontSize: 15 }}>{SYMBOLS[badge.sym]}</span> &nbsp;Badge unlocked — {badge.name}
                </p>
              </div>
            )}

            {/* energy feedback */}
            {app.showPendingFb ? null : app.fbNote ? (
              <p style={{ fontSize: 12.5, color: C.dim, marginBottom: 20 }}>Noted. This shapes tomorrow's dare.</p>
            ) : (
              <div className="card" style={{ padding: 18, marginBottom: 22, maxWidth: 320, margin: "0 auto 22px" }}>
                <p style={{ fontSize: 14.5, marginBottom: 12 }}>More energy than before?</p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {([["Much more", 2], ["A little more", 1], ["Same", 0], ["Less", -1]] as const).map(([lbl, v]) => (
                    <button key={lbl} className="pill" onClick={() => app.giveFeedback(v)}>
                      {lbl}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* journey completion — Badge final con reveal premium */}
            {completedJourney && (
              <div className="card rise" style={{ padding: 22, marginBottom: 22, borderColor: C.gold + "55", boxShadow: `0 0 40px -16px ${C.gold}` }}>
                <p className="lbl" style={{ color: C.gold, marginBottom: 14 }}>
                  Journey complete
                </p>
                <div
                  className="badge-reveal"
                  style={{
                    width: 84,
                    height: 84,
                    borderRadius: 99,
                    margin: "0 auto 14px",
                    border: `1.5px solid ${completedJourney.color}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 34,
                    color: completedJourney.color,
                  }}
                >
                  {SYMBOLS[badgeSym]}
                </div>
                <p className="lbl" style={{ color: C.gold, marginBottom: 6 }}>
                  Badge unlocked
                </p>
                <p className="serif" style={{ fontSize: 24, marginBottom: 6 }}>
                  {completedJourney.identity.name}
                </p>
                <p style={{ fontSize: 13, color: C.dim, marginBottom: 12 }}>{completedJourney.identity.line}</p>
                {completedJourney.completionLine && (
                  <p className="serif" style={{ fontStyle: "italic", fontSize: 15, lineHeight: 1.5, color: C.text, marginBottom: 14 }}>
                    "{completedJourney.completionLine}"
                  </p>
                )}
                {app.dreamReward && (
                  <p style={{ fontSize: 13.5, color: C.gold, marginBottom: 14 }}>
                    Dream Reward unlocked: {app.dreamReward}
                  </p>
                )}
                <p style={{ fontSize: 13.5, marginBottom: 10 }}>You've earned a Date. When will you take it?</p>
                {dateChosen ? (
                  <p style={{ fontSize: 13, color: C.green }}>Date set — {dateChosen}. {DATE_IDEAS[0].replace(/^\S+ /, "")}? Your call.</p>
                ) : (
                  <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
                    {[["This Saturday", "saturday"], ["This Sunday", "sunday"], ["Pick later", "later"]].map(([lbl, w]) => (
                      <button
                        key={w}
                        className="pill"
                        style={{ padding: "8px 14px", fontSize: 12, width: "auto" }}
                        onClick={() => {
                          app.scheduleDate(w);
                          setDateChosen(lbl);
                        }}
                      >
                        {lbl}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            <button className="btn btn-ghost" onClick={() => app.setScreen("home")}>
              Back home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
