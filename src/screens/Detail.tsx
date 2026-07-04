import { C, colorOf } from "../data/colors";
import { CAT_ICO } from "../data/icons";
import { Ico } from "../components/Ico";
import { Meta } from "../components/Meta";
import { wrap, pad } from "../components/layout";
import type { DareApp } from "../lib/useDare";

export function Detail({ app }: { app: DareApp }) {
  if (!app.currentDare) return null;
  const d = app.currentDare.dare;
  const why = app.currentDare.why;
  const col = colorOf(d);

  return (
    <div className="dare-root">
      <div style={wrap}>
        <div style={pad}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 22 }}>
            <button className="link" style={{ textDecoration: "none", fontSize: 16 }} onClick={() => app.setScreen("home")}>
              ←
            </button>
            <span className="lbl" style={{ color: d.wild ? C.gold : C.dim }}>
              {d.wild ? "✦ Wildcard ✦" : "Your dare"}
            </span>
            <span style={{ width: 16 }} />
          </div>
          <div style={{ textAlign: "center" }} className="rise">
            <div
              style={{
                width: 74,
                height: 74,
                borderRadius: 99,
                border: `1px solid ${col}`,
                margin: "0 auto 16px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: `0 0 44px -12px ${col}`,
              }}
            >
              <Ico name={CAT_ICO[d.cat]} size={30} color={col} sw={1.3} />
            </div>
            <p className="lbl" style={{ color: col, marginBottom: 8 }}>
              {d.level} level
            </p>
            <h2 className="serif" style={{ fontSize: 34, marginBottom: 8 }}>
              {d.title}
            </h2>
            <p style={{ color: C.dim, fontSize: 13.5 }}>
              {d.min} minutes · +{d.xp} XP
            </p>
            <Meta dare={d} />
          </div>

          <div className="card" style={{ padding: 18, marginBottom: 14, background: C.card2 }}>
            <p className="lbl" style={{ color: C.gold, marginBottom: 6 }}>
              Why this dare today
            </p>
            <p style={{ fontSize: 14, lineHeight: 1.55, color: C.text }}>{why}</p>
          </div>

          <div
            className="card"
            style={{ padding: 18, marginBottom: 18, borderColor: C.gold + "33", display: "flex", gap: 14, alignItems: "center" }}
          >
            <span style={{ fontSize: 18, color: C.gold }}>✦</span>
            <div>
              <p className="lbl" style={{ color: C.gold, marginBottom: 3 }}>
                Reward
              </p>
              <p style={{ fontSize: 13.5, lineHeight: 1.45 }}>
                <b style={{ fontWeight: 500 }}>{d.reward}</b> during the dare. A sealed reward draw when you finish — sometimes it's golden.
              </p>
            </div>
          </div>

          <p className="lbl" style={{ marginBottom: 12 }}>
            Steps
          </p>
          <div style={{ marginBottom: 28 }}>
            {d.steps.map((s, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  gap: 12,
                  alignItems: "baseline",
                  padding: "9px 0",
                  borderBottom: i < d.steps.length - 1 ? `1px solid ${C.line}` : "none",
                }}
              >
                <span style={{ color: col, fontSize: 11, minWidth: 16 }}>{i + 1}</span>
                <span style={{ fontSize: 14.5, lineHeight: 1.4 }}>{s}</span>
              </div>
            ))}
          </div>

          <button className="btn btn-green" onClick={() => app.startDare()}>
            Start dare
          </button>
          <div style={{ textAlign: "center", marginTop: 16 }}>
            <button className="link" onClick={() => app.swapToSmall()}>
              No energy → 3-minute version
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
