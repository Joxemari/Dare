import { useState } from "react";
import { C } from "../data/colors";
import { SYMBOLS } from "../data/symbols";
import { wrap, pad } from "../components/layout";
import type { DareApp } from "../lib/useDare";

/* Dream Reward setup — se elige ANTES de empezar el Journey y se
   desbloquea al completar el sprint de 7 días. */
export function Dream({ app }: { app: DareApp }) {
  const { journey } = app;
  const [custom, setCustom] = useState("");
  const [pickCustom, setPickCustom] = useState(false);

  return (
    <div className="dare-root">
      <div style={wrap}>
        <div style={pad}>
          <div style={{ textAlign: "center", marginBottom: 8 }}>
            <span className="pulse" style={{ color: C.gold, fontSize: 30 }}>
              {SYMBOLS.dream}
            </span>
          </div>
          <p className="lbl" style={{ textAlign: "center", color: journey.color, marginBottom: 10 }}>
            {SYMBOLS[journey.sym]} {journey.name} · 7-day sprint
          </p>
          <h2 className="serif t-title" style={{ lineHeight: 1.2, textAlign: "center", marginBottom: 10 }}>
            {journey.dreamPrompt}
          </h2>
          <p style={{ color: C.dim, fontSize: 13.5, textAlign: "center", marginBottom: 24, lineHeight: 1.5 }}>
            Choose something real. DARE will unlock it when you finish the 7-day sprint.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 18 }}>
            {journey.dreamOptions.map((o) =>
              o.custom ? (
                <button
                  key={o.id}
                  className="card"
                  onClick={() => setPickCustom(true)}
                  style={{
                    padding: "16px 12px",
                    textAlign: "left",
                    cursor: "pointer",
                    fontFamily: "inherit",
                    color: C.text,
                    borderColor: pickCustom ? C.gold + "88" : C.line,
                  }}
                >
                  <span style={{ fontSize: 22 }}>{o.emoji}</span>
                  <p style={{ fontSize: 13.5, marginTop: 6 }}>{o.label}</p>
                </button>
              ) : (
                <button
                  key={o.id}
                  className="card"
                  onClick={() => app.confirmDreamReward(o.label)}
                  style={{
                    padding: "16px 12px",
                    textAlign: "left",
                    cursor: "pointer",
                    fontFamily: "inherit",
                    color: C.text,
                    borderColor: C.line,
                  }}
                >
                  <span style={{ fontSize: 22 }}>{o.emoji}</span>
                  <p style={{ fontSize: 13.5, marginTop: 6 }}>{o.label}</p>
                </button>
              ),
            )}
          </div>

          {pickCustom && (
            <div className="rise" style={{ marginBottom: 18 }}>
              <input
                autoFocus
                value={custom}
                onChange={(e) => setCustom(e.target.value)}
                placeholder="Name your Dream Reward…"
                style={{
                  width: "100%",
                  background: C.card,
                  border: `1px solid ${C.line}`,
                  borderRadius: 12,
                  padding: "13px 14px",
                  color: C.text,
                  fontFamily: "inherit",
                  fontSize: 14,
                  marginBottom: 10,
                }}
              />
              <button
                className="btn btn-green"
                disabled={!custom.trim()}
                style={{ opacity: custom.trim() ? 1 : 0.4 }}
                onClick={() => custom.trim() && app.confirmDreamReward(custom.trim())}
              >
                Set Dream Reward
              </button>
            </div>
          )}

          <p style={{ fontSize: 12, color: C.faint, textAlign: "center" }}>
            The hard part is choosing. This one's yours.
          </p>
        </div>
      </div>
    </div>
  );
}
