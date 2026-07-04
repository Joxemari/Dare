import { C, CATS } from "../data/colors";
import { CAT_ICO } from "../data/icons";
import { BADGES } from "../data/badges";
import { Ico } from "../components/Ico";
import { Nav } from "../components/Nav";
import { wrap, pad } from "../components/layout";
import type { Cat } from "../types";
import type { DareApp } from "../lib/useDare";

export function Progress({ app }: { app: DareApp }) {
  const { store, level, catFeedback } = app;
  const bestCat = Object.entries(catFeedback).sort((a, b) => (b[1] ?? 0) - (a[1] ?? 0))[0] as
    | [Cat, number]
    | undefined;

  return (
    <div className="dare-root">
      <div style={wrap}>
        <div style={pad}>
          <p className="lbl" style={{ marginBottom: 20 }}>
            Your progress
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 24 }}>
            <div className="card" style={{ padding: 18 }}>
              <p className="lbl" style={{ marginBottom: 6 }}>
                Total XP
              </p>
              <p className="serif" style={{ fontSize: 36 }}>
                {store.xp.toLocaleString()} <span style={{ color: C.gold, fontSize: 18 }}>✦</span>
              </p>
              <p style={{ fontSize: 12, color: C.dim }}>Level {level}</p>
            </div>
            <div className="card" style={{ padding: 18 }}>
              <p className="lbl" style={{ marginBottom: 6 }}>
                Flexible streak
              </p>
              <p className="serif" style={{ fontSize: 36 }}>
                {store.streak.count} <Ico name="bolt" size={17} color={C.coral} style={{ display: "inline", verticalAlign: "-1px" }} />
              </p>
              <p style={{ fontSize: 12, color: C.dim }}>days · no pressure</p>
            </div>
          </div>
          {bestCat && bestCat[1] > 0 && (
            <div className="card" style={{ padding: 16, marginBottom: 24, background: C.card2 }}>
              <p style={{ fontSize: 13.5, lineHeight: 1.5 }}>
                <Ico name={CAT_ICO[bestCat[0]]} size={14} color={C.green} style={{ verticalAlign: "-2px" }} /> {CATS[bestCat[0]].label} dares give you the most energy so far. The generator knows.
              </p>
            </div>
          )}
          <p className="lbl" style={{ marginBottom: 14 }}>
            Badges — {store.badges.length} / {BADGES.length}
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginBottom: 12 }}>
            {BADGES.map((b) => {
              const got = store.badges.includes(b.id);
              return (
                <div key={b.id} style={{ textAlign: "center", opacity: got ? 1 : 0.32 }} title={b.how}>
                  <div
                    style={{
                      width: 52,
                      height: 52,
                      margin: "0 auto 6px",
                      borderRadius: 99,
                      border: `1px solid ${got ? C.gold + "66" : C.line}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: got ? `0 0 20px -8px ${C.gold}` : "none",
                    }}
                  >
                    <Ico name={b.ico} size={20} color={got ? C.gold : C.faint} sw={1.4} />
                  </div>
                  <p style={{ fontSize: 9.5, color: got ? C.text : C.faint, lineHeight: 1.25 }}>{b.name}</p>
                </div>
              );
            })}
          </div>
        </div>
        <Nav tab="progress" go={app.setScreen} />
      </div>
    </div>
  );
}
