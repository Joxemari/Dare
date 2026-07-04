import { C, CATS } from "../data/colors";
import { CAT_ICO } from "../data/icons";
import { Ico } from "../components/Ico";
import { TarotArt } from "../components/TarotArt";
import { Nav } from "../components/Nav";
import { wrap, pad } from "../components/layout";
import type { Cat } from "../types";
import type { DareApp } from "../lib/useDare";

export function You({ app }: { app: DareApp }) {
  const { store, level, journey, chapter, jd, card, catFeedback } = app;
  const xp = store.xp;
  const done = store.completed.length;
  const lvlFrac = (xp % 200) / 200;
  const RY = 34;
  const CY = 2 * Math.PI * RY;
  const catList = (Object.entries(store.catCounts) as [Cat, number][]).sort((a, b) => b[1] - a[1]);
  const maxCat = catList.length ? catList[0][1] : 1;
  const bestFb = Object.entries(catFeedback).sort((a, b) => (b[1] ?? 0) - (a[1] ?? 0))[0] as
    | [Cat, number]
    | undefined;

  return (
    <div className="dare-root">
      <div style={wrap}>
        <div style={pad}>
          <p className="lbl" style={{ marginBottom: 20 }}>
            You
          </p>

          {/* identity + level ring */}
          <div style={{ display: "flex", gap: 18, alignItems: "center", marginBottom: 22 }}>
            <div style={{ position: "relative", width: 84, height: 84, flexShrink: 0 }}>
              <svg width="84" height="84" style={{ transform: "rotate(-90deg)" }}>
                <circle cx="42" cy="42" r={RY} fill="none" stroke={C.line} strokeWidth="3" />
                <circle
                  cx="42"
                  cy="42"
                  r={RY}
                  fill="none"
                  stroke={C.gold}
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray={CY}
                  strokeDashoffset={CY * (1 - lvlFrac)}
                />
              </svg>
              <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <span className="serif" style={{ fontSize: 26, lineHeight: 1 }}>
                  {level}
                </span>
                <span className="lbl" style={{ fontSize: 7.5 }}>
                  Level
                </span>
              </div>
            </div>
            <div>
              <h2 className="serif" style={{ fontSize: 26, lineHeight: 1.15 }}>
                Someone who
                <br />
                moves daily.
              </h2>
              <p style={{ fontSize: 12, color: C.dim, marginTop: 6 }}>
                {xp.toLocaleString()} XP · {200 - (xp % 200)} to level {level + 1}
              </p>
            </div>
          </div>

          {/* stats grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 22 }}>
            {([[done, "dares", C.green], [store.streak.count, "day streak", C.coral], [store.badges.length, "badges", C.gold]] as const).map(
              ([v, k, col], i) => (
                <div key={i} className="card" style={{ padding: "14px 8px", textAlign: "center" }}>
                  <p className="serif" style={{ fontSize: 28, color: col }}>
                    {v}
                  </p>
                  <p className="lbl" style={{ fontSize: 8.5, marginTop: 2 }}>
                    {k}
                  </p>
                </div>
              ),
            )}
          </div>

          {/* your patterns */}
          {catList.length > 0 && (
            <div className="card" style={{ padding: 18, marginBottom: 14 }}>
              <p className="lbl" style={{ marginBottom: 14 }}>
                Your patterns
              </p>
              {catList.slice(0, 5).map(([cat, n]) => (
                <div key={cat} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                  <span style={{ width: 20, display: "flex" }}>
                    <Ico name={CAT_ICO[cat]} size={15} color={CATS[cat].color} sw={1.4} />
                  </span>
                  <span style={{ width: 76, fontSize: 12, color: C.dim }}>{CATS[cat].label}</span>
                  <div style={{ flex: 1, height: 3, background: C.line, borderRadius: 99 }}>
                    <div style={{ height: 3, width: `${(n / maxCat) * 100}%`, background: CATS[cat].color, borderRadius: 99, opacity: 0.8 }} />
                  </div>
                  <span style={{ fontSize: 11, color: C.faint, width: 18, textAlign: "right" }}>{n}</span>
                </div>
              ))}
              {bestFb && bestFb[1] > 0 && (
                <p style={{ fontSize: 12.5, color: C.dim, marginTop: 12, lineHeight: 1.5 }}>
                  <Ico name={CAT_ICO[bestFb[0]]} size={14} color={C.green} style={{ verticalAlign: "-2px" }} /> {CATS[bestFb[0]].label} is what actually gives you energy. The generator leans on this.
                </p>
              )}
            </div>
          )}

          {/* today's card */}
          {card && (
            <div className="card" style={{ padding: "14px 18px", marginBottom: 14, borderColor: C.gold + "33", display: "flex", gap: 12, alignItems: "center" }}>
              <TarotArt id={card.id} size={26} />
              <p style={{ fontSize: 12.5, color: C.dim }}>
                <span style={{ color: C.gold }}>
                  {card.num} · {card.name}
                </span>{" "}
                is your card today.
              </p>
            </div>
          )}

          {/* current journey */}
          <div className="card" style={{ padding: 18, marginBottom: 14 }}>
            <p className="lbl" style={{ marginBottom: 6 }}>
              Current journey
            </p>
            <p className="serif" style={{ fontSize: 20, color: journey.color }}>
              {journey.sym} {journey.name}
            </p>
            <p style={{ fontSize: 12.5, color: C.dim, marginTop: 3 }}>
              Chapter {chapter.n} — {chapter.name} · {jd} dares in
            </p>
          </div>

          {/* manifesto */}
          <div className="card" style={{ padding: 18, marginBottom: 26, background: C.card2 }}>
            <p className="serif" style={{ fontStyle: "italic", fontSize: 17, lineHeight: 1.55, color: C.dim }}>
              DARE is not a trainer. It is a Chief Energy Officer: one decision removed, one action begun, every day.
            </p>
          </div>

          <div style={{ textAlign: "center", display: "flex", flexDirection: "column", gap: 12 }}>
            <button className="link" onClick={() => app.replayOnboarding()}>
              Replay onboarding
            </button>
            <button
              className="link"
              style={{ color: C.coral }}
              onClick={() => {
                if (confirm("Reset all data? This clears your XP, streak, badges and journeys.")) app.resetAll();
              }}
            >
              Reset all data
            </button>
          </div>
        </div>
        <Nav tab="you" go={app.setScreen} />
      </div>
    </div>
  );
}
