import { C, CATS } from "../data/colors";
import { CAT_ICO } from "../data/icons";
import { SYMBOLS } from "../data/symbols";
import { findTrait } from "../data/traits";
import { SPRINT_DAYS } from "../data/journeys";
import { Ico } from "../components/Ico";
import { DailyCardDraw } from "../components/DailyCardDraw";
import { Nav } from "../components/Nav";
import { InstallBanner } from "../components/InstallBanner";
import { wrap, pad } from "../components/layout";
import type { Cat } from "../types";
import type { DareApp } from "../lib/useDare";

const pad2 = (n: number) => String(n).padStart(2, "0");

export function You({ app }: { app: DareApp }) {
  const { store, journey, chapter, daysDone, catFeedback, proofCount, currentIdentity, notifyPermission } = app;
  const identity = findTrait(currentIdentity);
  const notif = store.notifications;
  const notifOn = notif.enabled && notifyPermission === "granted";
  const done = store.completed.length;
  const frac = daysDone / SPRINT_DAYS;
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

          {/* identity ring */}
          <div style={{ display: "flex", gap: 18, alignItems: "center", marginBottom: 22 }}>
            <div style={{ position: "relative", width: 84, height: 84, flexShrink: 0 }}>
              <svg width="84" height="84" style={{ transform: "rotate(-90deg)" }}>
                <circle cx="42" cy="42" r={RY} fill="none" stroke={C.line} strokeWidth="3" />
                <circle
                  cx="42"
                  cy="42"
                  r={RY}
                  fill="none"
                  stroke={journey.color}
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray={CY}
                  strokeDashoffset={CY * (1 - frac)}
                />
              </svg>
              <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <span className="serif" style={{ fontSize: 26, lineHeight: 1, color: journey.color }}>
                  {identity ? SYMBOLS[identity.sym] : SYMBOLS.spark}
                </span>
                <span className="lbl" style={{ fontSize: 7.5 }}>
                  Identity
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
                Identity: {identity?.name ?? "Starter"} · {proofCount} {proofCount === 1 ? "proof" : "proofs"}
              </p>
            </div>
          </div>

          {/* stats grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 22 }}>
            {([[done, "dares", C.green], [store.momentum.count, "momentum", C.coral], [store.traits.length, "badges", C.gold]] as const).map(
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

          {/* today's card — el ritual de sacar carta vive aquí (antes en Today) */}
          <DailyCardDraw app={app} />

          {/* current journey */}
          <div className="card" style={{ padding: 18, marginBottom: 14 }}>
            <p className="lbl" style={{ marginBottom: 6 }}>
              Current journey
            </p>
            <p className="serif" style={{ fontSize: 20, color: journey.color }}>
              {SYMBOLS[journey.sym]} {journey.name}
            </p>
            <p style={{ fontSize: 12.5, color: C.dim, marginTop: 3 }}>
              Chapter {chapter.n} — {chapter.name} · {daysDone} / {SPRINT_DAYS} days
            </p>
          </div>

          {/* daily reminder */}
          <div className="card" style={{ padding: 18, marginBottom: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
              <p className="lbl">Daily reminder</p>
              {notifyPermission === "unsupported" ? (
                <span style={{ fontSize: 11, color: C.faint }}>Not supported</span>
              ) : notifOn ? (
                <button className="pill" onClick={() => app.disableNotifications()}>
                  {SYMBOLS.spark} On
                </button>
              ) : (
                <button className="btn btn-line" style={{ width: "auto", padding: "6px 16px", fontSize: 12 }} onClick={() => app.enableNotifications()}>
                  Enable
                </button>
              )}
            </div>
            <p style={{ fontSize: 12.5, color: C.dim, lineHeight: 1.5, marginBottom: notifOn ? 14 : 0 }}>
              Two gentle nudges a day — morning and evening — with today's briefing. The
              evening one only arrives if your dare is still waiting.
            </p>

            {notifOn && (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {([
                  ["morning", "Morning nudge", notif.morning],
                  ["evening", "Evening nudge", notif.evening],
                ] as const).map(([slot, label, s]) => (
                  <div
                    key={slot}
                    style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}
                  >
                    <span style={{ fontSize: 13, color: C.dim }}>{label}</span>
                    <input
                      type="time"
                      value={`${pad2(s.hour)}:${pad2(s.minute)}`}
                      onChange={(e) => {
                        const [h, m] = e.target.value.split(":").map(Number);
                        if (!Number.isNaN(h) && !Number.isNaN(m)) app.setNotificationSlot(slot, h, m);
                      }}
                      style={{
                        background: C.bg,
                        color: C.text,
                        border: `1px solid ${C.line}`,
                        borderRadius: 8,
                        padding: "6px 10px",
                        fontFamily: "inherit",
                        fontSize: 14,
                        colorScheme: "dark",
                      }}
                      aria-label={`${label} time`}
                    />
                  </div>
                ))}
              </div>
            )}

            {notifyPermission === "denied" && (
              <p style={{ fontSize: 11.5, color: C.coral, marginTop: 10, lineHeight: 1.5 }}>
                Notifications are blocked. Enable them for DARE in your browser or system settings.
              </p>
            )}
            <p style={{ fontSize: 11, color: C.faint, marginTop: 10, lineHeight: 1.5 }}>
              Delivered while DARE is open or in the background where your device allows. Reliable
              background delivery needs a server — coming later.
            </p>
          </div>

          {/* añadir a inicio (PWA) — protege el localStorage en iOS */}
          {app.installSettings !== "none" && (
            <div style={{ marginBottom: 14 }}>
              <InstallBanner
                offer={app.installSettings}
                onInstall={app.promptInstall}
                onDismiss={app.dismissInstall}
                compact
              />
            </div>
          )}

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
                if (confirm("Reset all data? This clears your proof, momentum, traits and journeys.")) app.resetAll();
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
