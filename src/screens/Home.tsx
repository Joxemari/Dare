import { C, LEVELS, CATS, colorOf } from "../data/colors";
import { CAT_ICO } from "../data/icons";
import { SYMBOLS } from "../data/symbols";
import { SPRINT_DAYS } from "../data/journeys";
import { Ico } from "../components/Ico";
import { Dots } from "../components/Dots";
import { Effects } from "../components/Effects";
import { TarotArt } from "../components/TarotArt";
import { Nav } from "../components/Nav";
import { wrap, pad } from "../components/layout";
import type { DareApp } from "../lib/useDare";

export function Home({ app }: { app: DareApp }) {
  const now = new Date();
  const dateStr = now
    .toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })
    .toUpperCase();
  const greet = now.getHours() < 12 ? "Good morning." : now.getHours() < 19 ? "Good afternoon." : "Good evening.";
  const { journey, chapter, currentDare, daresToday, card, cardOptions, dreamReward, daysDone } = app;
  const remaining = Math.max(0, SPRINT_DAYS - daysDone);

  return (
    <div className="dare-root">
      <div style={wrap}>
        {/* hero glow */}
        <div style={{ position: "relative" }}>
          <div
            style={{
              position: "absolute",
              inset: 0,
              height: 260,
              background: `radial-gradient(120% 100% at 50% 0%, ${journey.color}1A 0%, transparent 60%)`,
              pointerEvents: "none",
            }}
          />
          <div style={{ ...pad, position: "relative" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span className="lbl">{dateStr}</span>
              <span style={{ display: "flex", gap: 10, alignItems: "center" }}>
                {daresToday > 1 && <span style={{ fontSize: 11, color: C.gold }}>{SYMBOLS.spark} {daresToday} today</span>}
                <span style={{ color: journey.color, fontSize: 14 }}>{SYMBOLS[journey.sym]}</span>
              </span>
            </div>
            <h1 className="serif" style={{ fontSize: 40, lineHeight: 1.12, margin: "22px 0 8px" }}>
              {greet}
              <br />
              One dare today.
            </h1>
            <p className="lbl" style={{ color: journey.color, marginTop: 10 }}>
              {journey.name} · Chapter {chapter.n} — {chapter.name}
            </p>
            {dreamReward && (
              <p style={{ fontSize: 12, color: C.gold, marginTop: 8 }}>
                {SYMBOLS.dream} Dream Reward: {dreamReward} · {remaining} {remaining === 1 ? "Dare" : "Dares"} remaining
              </p>
            )}
          </div>
        </div>

        <div style={{ ...pad, paddingTop: 0 }}>
          {/* daily card */}
          {!card ? (
            <div style={{ margin: "8px 0 26px" }}>
              <p className="lbl" style={{ marginBottom: 12 }}>
                Draw your card for today
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                {cardOptions.map((c, i) => (
                  <button
                    key={c.id}
                    className="tcard"
                    style={{ aspectRatio: "5 / 8.5", position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}
                    onClick={() => app.pickCard(c.id)}
                    aria-label="Face-down daily card"
                  >
                    <div style={{ position: "absolute", inset: 6, border: `1px solid ${C.gold}33`, borderRadius: 9, pointerEvents: "none" }} />
                    <div style={{ position: "absolute", inset: 11, border: `1px solid ${C.gold}18`, borderRadius: 6, pointerEvents: "none" }} />
                    <span className="pulse" style={{ color: C.gold, fontSize: 18, opacity: 0.75, animationDelay: `${i * 0.4}s` }}>
                      {SYMBOLS.spark}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div
              className="card flip"
              style={{ margin: "8px 0 26px", padding: 16, borderColor: C.gold + "44", display: "flex", gap: 16, alignItems: "stretch" }}
            >
              <div
                style={{
                  flexShrink: 0,
                  width: 88,
                  border: `1px solid ${C.gold}55`,
                  borderRadius: 10,
                  background: "linear-gradient(170deg,#1E1E1B,#161614)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "8px 4px",
                }}
              >
                <span style={{ fontSize: 9, letterSpacing: "0.18em", color: C.gold }}>{card.num}</span>
                <TarotArt id={card.id} size={54} />
                <span className="lbl" style={{ fontSize: 7.5, color: C.gold, textAlign: "center", letterSpacing: "0.14em" }}>
                  {card.name.toUpperCase()}
                </span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
                <p className="lbl" style={{ color: C.gold, marginBottom: 5 }}>
                  {card.num} · {card.name}
                </p>
                <p style={{ fontSize: 13.5, lineHeight: 1.55, color: C.text }}>{card.msg}</p>
              </div>
            </div>
          )}

          {/* before check-in */}
          {!currentDare && (
            <div className="card rise" style={{ padding: 26, textAlign: "center" }}>
              <div className="pulse" style={{ fontSize: 22, color: journey.color, marginBottom: 12 }}>
                {SYMBOLS.spark}
              </div>
              <p className="lbl" style={{ marginBottom: 6 }}>
                Today's Dare
              </p>
              <p style={{ color: C.dim, fontSize: 13.5, marginBottom: 20 }}>
                20 seconds. Then we choose for you.
              </p>
              <button className="btn btn-green" style={{ marginBottom: 10 }} onClick={() => app.setScreen("checkin")}>
                Start check-in
              </button>
              <button className="btn btn-line" onClick={() => app.justDareMe()}>
                Just dare me {SYMBOLS.spark}
              </button>
              <p style={{ fontSize: 11, color: C.faint, marginTop: 10 }}>The hard part is choosing. We do that for you.</p>
            </div>
          )}

          {/* sealed — after check-in, before reveal */}
          {currentDare && !currentDare.revealed && (
            <button
              className="card rise"
              onClick={() => app.revealDare()}
              style={{
                padding: 28,
                textAlign: "center",
                width: "100%",
                cursor: "pointer",
                fontFamily: "inherit",
                color: C.text,
                borderColor: currentDare.dare.wild ? C.gold + "66" : C.line,
                boxShadow: `0 0 40px -18px ${colorOf(currentDare.dare)}`,
              }}
            >
              <div className="pulse" style={{ fontSize: 26, color: colorOf(currentDare.dare), marginBottom: 12 }}>
                {currentDare.dare.wild ? SYMBOLS.wildcard : SYMBOLS.spark}
              </div>
              <p className="lbl" style={{ marginBottom: 16, color: currentDare.dare.wild ? C.gold : C.dim }}>
                {currentDare.dare.wild ? "Wildcard sealed" : "Today's Dare is sealed"}
              </p>
              <div style={{ display: "flex", justifyContent: "space-around", marginBottom: 16, fontSize: 11.5, color: C.dim }}>
                <span style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
                  <Dots n={LEVELS[currentDare.dare.level]} color={colorOf(currentDare.dare)} />
                  <span className="lbl" style={{ fontSize: 8 }}>{currentDare.dare.level}</span>
                </span>
                <span style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
                  <Ico name="headphones" size={16} color={C.dim} sw={1.4} />
                  <span className="lbl" style={{ fontSize: 8 }}>Companion</span>
                </span>
                <span style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
                  <span style={{ color: colorOf(currentDare.dare), fontSize: 15 }}>{SYMBOLS.momentum}</span>
                  <span className="lbl" style={{ fontSize: 8 }}>{Object.keys(currentDare.dare.effects)[0] ?? "Energy"}</span>
                </span>
              </div>
              <p style={{ fontSize: 14, color: currentDare.dare.wild ? C.gold : journey.color }}>Tap to reveal</p>
            </button>
          )}

          {/* revealed — elegant dare card */}
          {currentDare && currentDare.revealed && !currentDare.completed && (
            <div className="card rise" style={{ padding: 22, borderColor: currentDare.dare.wild ? C.gold + "55" : C.line }}>
              <div style={{ display: "flex", gap: 14, alignItems: "center", marginBottom: 14 }}>
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 99,
                    border: `1px solid ${colorOf(currentDare.dare)}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: `0 0 24px -8px ${colorOf(currentDare.dare)}`,
                    flexShrink: 0,
                  }}
                >
                  <Ico name={CAT_ICO[currentDare.dare.cat]} size={22} color={colorOf(currentDare.dare)} sw={1.4} />
                </div>
                <div>
                  <p className="lbl" style={{ color: colorOf(currentDare.dare), marginBottom: 3 }}>
                    {currentDare.dare.wild ? "Wildcard" : "Today's dare"}
                  </p>
                  <p className="serif" style={{ fontSize: 22 }}>
                    {currentDare.dare.title}
                  </p>
                  <p style={{ fontSize: 12.5, color: C.dim, marginTop: 2 }}>
                    {currentDare.dare.min} min · {CATS[currentDare.dare.cat].label}
                  </p>
                </div>
              </div>
              <p className="serif" style={{ fontStyle: "italic", fontSize: 15, color: C.dim, marginBottom: 12 }}>
                "{currentDare.dare.proof}"
              </p>
              <div style={{ marginBottom: 16 }}>
                <Effects effects={currentDare.dare.effects} />
              </div>
              <button className="btn btn-green" onClick={() => app.startDare()}>
                Start dare
              </button>
              <div style={{ textAlign: "center", marginTop: 12 }}>
                <button className="link" onClick={() => app.setScreen("detail")}>
                  View Dare
                </button>
              </div>
            </div>
          )}

          {/* completed */}
          {currentDare && currentDare.completed && (
            <div className="card rise" style={{ padding: 26, textAlign: "center" }}>
              <div style={{ color: journey.color, fontSize: 22, marginBottom: 10 }}>✓</div>
              <p className="serif" style={{ fontSize: 22, marginBottom: 4 }}>
                Done for today.
              </p>
              <p style={{ color: C.dim, fontSize: 13, marginBottom: 18 }}>
                {currentDare.dare.title} · Proof collected
              </p>
              <button className="btn btn-line" onClick={() => app.oneMore()}>
                One more dare {SYMBOLS.spark}
              </button>
            </div>
          )}

          {app.showPendingFb && (
            <div className="card rise" style={{ padding: 22, marginTop: 16, borderColor: C.gold + "44" }}>
              <p className="lbl" style={{ color: C.gold, marginBottom: 6 }}>
                30 minutes later
              </p>
              <p style={{ fontSize: 14.5, marginBottom: 14 }}>More energy than before?</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {([["Much more", 2], ["A little more", 1], ["Same", 0], ["Less", -1]] as const).map(([t, v]) => (
                  <button key={t} className="pill" onClick={() => app.giveFeedback(v)}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
          )}
          {app.fbNote && (
            <p className="rise" style={{ fontSize: 12.5, color: C.dim, marginTop: 14, textAlign: "center" }}>
              Noted. This shapes tomorrow's dare. {SYMBOLS.spark}
            </p>
          )}
        </div>
        <Nav tab="home" go={app.setScreen} />
      </div>
    </div>
  );
}
