import { C } from "../data/colors";
import { TIER } from "../data/draws";
import { BADGES } from "../data/badges";
import { Ico } from "../components/Ico";
import { wrap, pad } from "../components/layout";
import type { DareApp } from "../lib/useDare";

export function Complete({ app }: { app: DareApp }) {
  const { draw, drawFlipped, lastGain, newBadges } = app;
  const t = draw ? TIER[draw.tier] : TIER.common;

  return (
    <div className="dare-root">
      <div style={{ ...wrap, textAlign: "center", position: "relative", overflow: "hidden" }}>
        {["12%", "78%", "30%", "64%", "88%"].map((x, i) => (
          <span
            key={i}
            className="pulse"
            style={{ position: "absolute", left: x, top: `${10 + i * 15}%`, color: C.gold, opacity: 0.4, fontSize: 9 + (i % 3) * 3, animationDelay: `${i * 0.5}s` }}
          >
            ✦
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
            <p style={{ color: C.green, fontSize: 19, marginBottom: 16 }}>
              +{lastGain} XP{draw && draw.x2 ? " (doubled ✦)" : ""}
            </p>
            <p className="serif" style={{ fontStyle: "italic", fontSize: 18, color: C.dim, marginBottom: 24 }}>
              The hard part is over.
            </p>

            {/* reward draw */}
            {draw && !drawFlipped ? (
              <button
                className="tcard pulse"
                style={{ width: 180, height: 100, margin: "0 auto 24px", display: "block" }}
                onClick={() => app.setDrawFlipped(true)}
              >
                <span style={{ color: C.gold, fontSize: 16 }}>✦</span>
                <p className="lbl" style={{ marginTop: 8 }}>
                  Your reward draw
                </p>
                <p style={{ fontSize: 11, color: C.faint, marginTop: 4 }}>Tap to reveal</p>
              </button>
            ) : (
              draw && (
                <div
                  className="card flip"
                  style={{
                    padding: 18,
                    margin: "0 auto 24px",
                    maxWidth: 280,
                    borderColor: t.color + "66",
                    boxShadow: draw.tier === "golden" ? `0 0 44px -12px ${C.gold}` : "none",
                  }}
                >
                  <p className="lbl" style={{ color: t.color, marginBottom: 6 }}>
                    ✦ {t.label}
                  </p>
                  <p className="serif" style={{ fontSize: 18, lineHeight: 1.35 }}>
                    {draw.text}
                  </p>
                </div>
              )
            )}

            {newBadges.length > 0 && (
              <div className="card" style={{ padding: 14, marginBottom: 24, display: "inline-block" }}>
                {newBadges.map((id) => {
                  const b = BADGES.find((x) => x.id === id);
                  if (!b) return null;
                  return (
                    <p key={id} style={{ fontSize: 13 }}>
                      <Ico name={b.ico} size={13} color={C.gold} style={{ verticalAlign: "-2px" }} /> &nbsp;New badge — {b.name}
                    </p>
                  );
                })}
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
