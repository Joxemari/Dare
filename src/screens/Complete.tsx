import { useState } from "react";
import { C } from "../data/colors";
import { TIER, DATE_IDEAS } from "../data/rewards";
import { SYMBOLS } from "../data/symbols";
import { TRAITS } from "../data/traits";
import { journeyById } from "../data/journeys";
import { wrap, pad } from "../components/layout";
import type { DareApp } from "../lib/useDare";

export function Complete({ app }: { app: DareApp }) {
  const { treat, treatFlipped, lastProof, newTraits, justCompletedJourney } = app;
  const t = treat ? TIER[treat.tier] : TIER.common;
  const [dateChosen, setDateChosen] = useState<string | null>(null);
  const completedJourney = justCompletedJourney ? journeyById(justCompletedJourney) : null;

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
            <p style={{ color: C.green, fontSize: 17, marginBottom: 16 }}>Proof collected.</p>

            {/* proof statement */}
            {lastProof && (
              <div className="card" style={{ padding: 16, margin: "0 auto 24px", maxWidth: 300, background: C.card2 }}>
                <p className="serif" style={{ fontStyle: "italic", fontSize: 18, lineHeight: 1.4 }}>
                  "{lastProof}"
                </p>
              </div>
            )}

            {/* treat draw */}
            {treat && !treatFlipped ? (
              <button
                className="tcard pulse"
                style={{ width: 180, height: 104, margin: "0 auto 24px", display: "block" }}
                onClick={() => app.setTreatFlipped(true)}
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

            {/* new traits */}
            {newTraits.length > 0 && (
              <div className="card" style={{ padding: 14, marginBottom: 24, display: "inline-block", textAlign: "left" }}>
                {newTraits.map((id) => {
                  const tr = TRAITS.find((x) => x.id === id);
                  if (!tr) return null;
                  return (
                    <p key={id} style={{ fontSize: 13, marginBottom: 2 }}>
                      <span style={{ color: C.gold }}>{SYMBOLS[tr.sym]}</span> &nbsp;New trait — {tr.name}
                    </p>
                  );
                })}
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

            {/* journey completion */}
            {completedJourney && (
              <div className="card rise" style={{ padding: 22, marginBottom: 22, borderColor: C.gold + "55", boxShadow: `0 0 40px -16px ${C.gold}` }}>
                <p style={{ fontSize: 26, color: C.gold, marginBottom: 8 }}>{SYMBOLS.dream}</p>
                <p className="lbl" style={{ color: C.gold, marginBottom: 6 }}>
                  Journey complete
                </p>
                <p className="serif" style={{ fontSize: 22, marginBottom: 6 }}>
                  Identity unlocked: {SYMBOLS[completedJourney.sym]} {completedJourney.identity.name}
                </p>
                <p style={{ fontSize: 13, color: C.dim, marginBottom: 12 }}>{completedJourney.identity.line}</p>
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
