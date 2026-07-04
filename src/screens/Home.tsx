import { C, LEVELS, colorOf } from "../data/colors";
import { CAT_ICO } from "../data/icons";
import { Ico } from "../components/Ico";
import { Dots } from "../components/Dots";
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
  const { journey, chapter, currentDare, daresToday, card, cardOptions } = app;

  return (
    <div className="dare-root">
      <div style={wrap}>
        <div style={pad}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span className="lbl">{dateStr}</span>
            <span style={{ display: "flex", gap: 10, alignItems: "center" }}>
              {daresToday > 1 && <span style={{ fontSize: 11, color: C.gold }}>✦ {daresToday} today</span>}
              <span style={{ color: C.green, fontSize: 14 }}>✦</span>
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

          {/* tarot draw */}
          {!card ? (
            <div style={{ margin: "24px 0 26px" }}>
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
                    aria-label="Face-down tarot card"
                  >
                    <div style={{ position: "absolute", inset: 6, border: `1px solid ${C.gold}33`, borderRadius: 9, pointerEvents: "none" }} />
                    <div style={{ position: "absolute", inset: 11, border: `1px solid ${C.gold}18`, borderRadius: 6, pointerEvents: "none" }} />
                    {["8%", "8%", "78%", "78%"].map((_, k) => (
                      <span
                        key={k}
                        style={{ position: "absolute", top: k < 2 ? "6%" : "88%", left: k % 2 ? "82%" : "10%", color: C.gold, opacity: 0.35, fontSize: 8 }}
                      >
                        ✦
                      </span>
                    ))}
                    <span className="pulse" style={{ color: C.gold, fontSize: 18, opacity: 0.75, animationDelay: `${i * 0.4}s` }}>
                      ✦
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div
              className="card flip"
              style={{ margin: "24px 0 26px", padding: 16, borderColor: C.gold + "44", display: "flex", gap: 16, alignItems: "stretch" }}
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

          {/* dare card states */}
          {!currentDare && (
            <div className="card rise" style={{ padding: 26, textAlign: "center" }}>
              <div className="pulse" style={{ fontSize: 22, color: C.green, marginBottom: 12 }}>
                ✦
              </div>
              <p className="lbl" style={{ marginBottom: 6 }}>
                Your dare of the day
              </p>
              <p style={{ color: C.dim, fontSize: 13.5, marginBottom: 20 }}>
                20 seconds. Then we choose for you.
              </p>
              <button className="btn btn-green" style={{ marginBottom: 10 }} onClick={() => app.setScreen("checkin")}>
                Start check-in
              </button>
              <button className="btn btn-line" onClick={() => app.justDareMe()}>
                Just dare me ✦
              </button>
              <p style={{ fontSize: 11, color: C.faint, marginTop: 10 }}>Skips the questions. Uses what we know.</p>
            </div>
          )}

          {currentDare && !currentDare.revealed && (
            <button
              className="card rise"
              onClick={() => app.revealDare()}
              style={{
                padding: 30,
                textAlign: "center",
                width: "100%",
                cursor: "pointer",
                fontFamily: "inherit",
                color: C.text,
                borderColor: currentDare.dare.wild ? C.gold + "66" : C.line,
                boxShadow: `0 0 40px -18px ${colorOf(currentDare.dare)}`,
              }}
            >
              <div className="pulse" style={{ fontSize: 26, color: colorOf(currentDare.dare), marginBottom: 14 }}>
                ✦
              </div>
              <p className="lbl" style={{ marginBottom: 16, color: currentDare.dare.wild ? C.gold : C.dim }}>
                {currentDare.dare.wild ? "✦ Wildcard sealed ✦" : "Sealed dare"}
              </p>
              <div style={{ display: "flex", justifyContent: "center", gap: 24, marginBottom: 18, fontSize: 12, color: C.dim }}>
                <span>
                  <Dots n={LEVELS[currentDare.dare.level]} color={colorOf(currentDare.dare)} />
                </span>
                <span>Reward draw after</span>
                <span>+{currentDare.dare.xp} XP</span>
              </div>
              <p style={{ fontSize: 14, color: currentDare.dare.wild ? C.gold : C.green }}>Tap to reveal</p>
            </button>
          )}

          {currentDare && currentDare.revealed && !currentDare.completed && (
            <div className="card rise" style={{ padding: 24, borderColor: currentDare.dare.wild ? C.gold + "55" : C.line }}>
              <div style={{ display: "flex", gap: 14, alignItems: "center", marginBottom: 18 }}>
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
                    {currentDare.dare.min} min · {currentDare.dare.level} · +{currentDare.dare.xp} XP
                  </p>
                </div>
              </div>
              <button className="btn btn-green" onClick={() => app.startDare()}>
                Start dare
              </button>
              <div style={{ textAlign: "center", marginTop: 12 }}>
                <button className="link" onClick={() => app.setScreen("detail")}>
                  See steps &amp; why
                </button>
              </div>
            </div>
          )}

          {currentDare && currentDare.completed && (
            <div className="card rise" style={{ padding: 26, textAlign: "center" }}>
              <div style={{ color: C.green, fontSize: 22, marginBottom: 10 }}>✓</div>
              <p className="serif" style={{ fontSize: 22, marginBottom: 4 }}>
                Done for today.
              </p>
              <p style={{ color: C.dim, fontSize: 13, marginBottom: 18 }}>
                {currentDare.dare.title} · +{app.lastGain || currentDare.dare.xp} XP
              </p>
              <button className="btn btn-line" onClick={() => app.oneMore()}>
                One more dare ✦
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
              Noted. This shapes tomorrow's dare. ✦
            </p>
          )}
        </div>
        <Nav tab="home" go={app.setScreen} />
      </div>
    </div>
  );
}
