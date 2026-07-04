import { useState } from "react";
import { C } from "../data/colors";
import { SYMBOLS } from "../data/symbols";
import { MS_T, SPRINT_DAYS, totalMilestones, chapterState } from "../data/journeys";
import { Ico } from "../components/Ico";
import { Nav } from "../components/Nav";
import { MilestoneModal } from "../components/MilestoneModal";
import { DayModal } from "../components/DayModal";
import { wrap, pad } from "../components/layout";
import type { Milestone } from "../types";
import type { DareApp } from "../lib/useDare";

export function Journey({ app }: { app: DareApp }) {
  const { journey, daysDone, chapter, store, isJourneyActive } = app;
  const [openCh, setOpenCh] = useState<number | null>(chapter.idx);
  const [modal, setModal] = useState<Milestone | null>(null);
  const [dayOpen, setDayOpen] = useState<number | null>(null);
  const isPlaceholder = journey.plan.length === 0;
  const dreamReward = store.dreamRewards[journey.id];

  const allMs = journey.chapters.flatMap((c) => c.milestones);
  const mDone = allMs.filter((m) => store.milestones[m.id]).length;
  const mTot = totalMilestones(journey);
  const currentDay = Math.min(SPRINT_DAYS, daysDone + 1);

  // La pantalla Journey usa una línea de tiempo de SECUENCIA (Day 1..7), no de
  // calendario: un usuario puede terminar el sprint en menos de 7 días reales.
  const dayLabel = (i: number) => `Day ${i + 1}`;

  return (
    <div className="dare-root">
      <div style={wrap}>
        <div style={pad}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <p className="lbl">Your journey</p>
            <button className="link" onClick={() => app.setScreen("journeys")}>
              {isJourneyActive ? "Change journey" : "All journeys"}
            </button>
          </div>
          <h2 className="serif" style={{ fontSize: 34, marginBottom: 2, color: journey.color }}>
            {SYMBOLS[journey.sym]} {journey.name}
          </h2>
          <p style={{ color: C.dim, fontSize: 13.5, marginBottom: 14 }}>{journey.tag}</p>

          {/* not started yet — Begin Journey (no auto-start on launch) */}
          {!isPlaceholder && !isJourneyActive && (
            <div className="card rise" style={{ padding: 22, marginBottom: 22, borderColor: journey.color + "55" }}>
              <p style={{ fontSize: 14.5, lineHeight: 1.55, marginBottom: 10 }}>{journey.promise}</p>
              <p className="serif" style={{ fontStyle: "italic", fontSize: 16, color: C.dim, marginBottom: 18 }}>
                "{journey.lesson}"
              </p>
              <button className="btn btn-green" onClick={() => app.startJourney(journey.id)}>
                Begin Journey {SYMBOLS.spark}
              </button>
              <p style={{ fontSize: 11.5, color: C.faint, marginTop: 10, textAlign: "center" }}>
                {dreamReward ? `Dream Reward set: ${dreamReward}` : "You'll choose a Dream Reward first."}
              </p>
            </div>
          )}

          {/* completion band */}
          {!isPlaceholder && isJourneyActive && (
            <div
              className="card"
              style={{ padding: "14px 18px", marginBottom: 22, borderColor: journey.color + "44", display: "flex", justifyContent: "space-around", textAlign: "center" }}
            >
              <div>
                <p className="serif" style={{ fontSize: 26, color: journey.color }}>
                  {mTot ? Math.round((mDone / mTot) * 100) : 0}%
                </p>
                <p className="lbl" style={{ fontSize: 8.5 }}>
                  completion
                </p>
              </div>
              <div style={{ width: 1, background: C.line }} />
              <div>
                <p className="serif" style={{ fontSize: 26 }}>
                  {mDone}/{mTot}
                </p>
                <p className="lbl" style={{ fontSize: 8.5 }}>
                  milestones completed
                </p>
              </div>
            </div>
          )}

          {/* the days ahead (solo cuando el Journey está activo) */}
          {isJourneyActive && (
          <>
          <p className="lbl" style={{ marginBottom: 12 }}>
            The days ahead
          </p>
          <div className="hscroll" style={{ marginBottom: 10 }}>
            {journey.plan.map((p, i) => {
              const isDone = i < daysDone;
              const isToday = i === daysDone;
              const isDream = !!p.dream;
              const isChapter = !!p.chapter;
              const gold = isDream || isChapter;
              const border = isToday ? journey.color : isDone ? C.green : gold ? C.gold + "77" : C.line;
              const fg = isToday ? journey.color : isDone ? C.green : gold ? C.gold : C.dim;
              const glyph = isDone ? "✓" : isToday ? SYMBOLS.spark : isDream ? SYMBOLS.dream : isChapter ? SYMBOLS.dream : SYMBOLS.cycle;
              const label = isDone ? "Done" : isToday ? "Current" : isDream ? "Dream" : isChapter ? "Chapter" : "Locked";
              const tappable = i <= daysDone; // solo días hechos o el actual (los futuros siguen sellados)
              return (
                <button
                  key={i}
                  onClick={() => tappable && setDayOpen(i)}
                  disabled={!tappable}
                  style={{
                    minWidth: 64,
                    textAlign: "center",
                    background: "none",
                    border: "none",
                    padding: 0,
                    fontFamily: "inherit",
                    cursor: tappable ? "pointer" : "default",
                  }}
                >
                  <div
                    style={{
                      width: 52,
                      height: 52,
                      margin: "0 auto 6px",
                      borderRadius: 99,
                      border: `1px solid ${border}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 17,
                      color: fg,
                      opacity: isToday || isDone ? 1 : 0.75,
                      boxShadow: isToday ? `0 0 22px -8px ${journey.color}` : gold && !isDone ? `0 0 18px -8px ${C.gold}` : "none",
                    }}
                  >
                    {glyph}
                  </div>
                  <p style={{ fontSize: 10, color: isToday ? C.text : C.faint }}>{dayLabel(i)}</p>
                  <p className="lbl" style={{ fontSize: 7.5, marginTop: 2, color: fg }}>
                    {label}
                  </p>
                </button>
              );
            })}
          </div>
          <p style={{ fontSize: 12.5, color: C.dim, marginBottom: 18 }}>
            Day {currentDay} of {SPRINT_DAYS} — {journey.plan[Math.min(SPRINT_DAYS - 1, daysDone)]?.title}. Tap a day for its plan; finish a chapter to unlock the next.
          </p>

          {/* planned dares + dates (explican el color) */}
          {(store.plannedDares.length > 0 || store.dates.length > 0) && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 22 }}>
              {store.plannedDares.map((pd) => (
                <span key={pd.id} className="pill" style={{ padding: "6px 12px", fontSize: 11, width: "auto", borderColor: C.purple + "77", color: C.purple }}>
                  {SYMBOLS.focus} Planned · {pd.label}
                </span>
              ))}
              {store.dates.map((d, i) => (
                <span key={i} className="pill" style={{ padding: "6px 12px", fontSize: 11, width: "auto", borderColor: C.gold + "77", color: C.gold }}>
                  {SYMBOLS.treat} Date · {d.when}
                </span>
              ))}
            </div>
          )}

          {/* milestone path — capítulos en orden, desbloqueo por COMPLETADO */}
          {journey.chapters.map((c, i) => {
            const state = chapterState(journey, i, store.milestones);
            const marks = c.milestones;
            const chDone = marks.filter((m) => store.milestones[m.id]).length;
            const open = openCh === i && state !== "locked" && marks.length > 0;
            const nodeCol = state === "done" ? C.green : state === "now" ? journey.color : C.faint;
            return (
              <div key={c.n}>
                {i > 0 && (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, padding: "8px 0" }}>
                    {[0, 1, 2].map((dd) => (
                      <span key={dd} style={{ width: 3, height: 3, borderRadius: 99, background: state === "locked" ? C.line : C.faint }} />
                    ))}
                  </div>
                )}
                <button
                  onClick={() => marks.length && state !== "locked" && setOpenCh(open ? null : i)}
                  style={{
                    display: "flex",
                    gap: 16,
                    alignItems: "center",
                    width: "100%",
                    background: "none",
                    border: "none",
                    cursor: marks.length && state !== "locked" ? "pointer" : "default",
                    fontFamily: "inherit",
                    color: C.text,
                    textAlign: "left",
                    padding: 0,
                  }}
                >
                  <div style={{ position: "relative", width: 60, height: 60, flexShrink: 0 }}>
                    <div
                      style={{
                        width: 60,
                        height: 60,
                        borderRadius: 99,
                        border: `1.5px solid ${nodeCol}`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 24,
                        color: nodeCol,
                        opacity: state === "locked" ? 0.45 : 1,
                        boxShadow: state === "now" ? `0 0 26px -8px ${journey.color}` : "none",
                      }}
                    >
                      {SYMBOLS[c.sym]}
                    </div>
                    {state === "done" && (
                      <div
                        style={{
                          position: "absolute",
                          right: -2,
                          bottom: -2,
                          width: 20,
                          height: 20,
                          borderRadius: 99,
                          background: C.green,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Ico name="check" size={11} color="#111" sw={2.4} />
                      </div>
                    )}
                  </div>
                  <div style={{ flex: 1, opacity: state === "locked" ? 0.5 : 1 }}>
                    <p className="lbl" style={{ marginBottom: 3 }}>
                      Chapter {c.n}
                    </p>
                    <p className="serif" style={{ fontSize: 20 }}>
                      {c.name}
                    </p>
                    <p style={{ fontSize: 12, color: C.dim, marginTop: 2 }}>
                      {state === "locked" ? "Not yet unlocked" : marks.length ? `${chDone}/${marks.length} milestones completed` : c.goal}
                    </p>
                  </div>
                  {marks.length > 0 && state !== "locked" && <span style={{ color: C.faint, fontSize: 13 }}>{open ? "▾" : "▸"}</span>}
                </button>

                {open && (
                  <div className="rise" style={{ margin: "12px 0 4px 76px" }}>
                    {marks.map((m, k) => {
                      const isDone = !!store.milestones[m.id];
                      return (
                        <button
                          key={m.id}
                          onClick={() => setModal(m)}
                          className="card"
                          style={{
                            padding: "12px 14px",
                            marginBottom: 8,
                            display: "flex",
                            gap: 12,
                            alignItems: "center",
                            width: "100%",
                            textAlign: "left",
                            fontFamily: "inherit",
                            color: C.text,
                            cursor: "pointer",
                            borderColor: isDone ? C.line : journey.color + "44",
                          }}
                        >
                          <Ico name={MS_T[m.t].ico} size={16} color={isDone ? C.dim : journey.color} sw={1.4} />
                          <div style={{ flex: 1 }}>
                            <p className="lbl" style={{ fontSize: 8, marginBottom: 2 }}>
                              {MS_T[m.t].label} · {k + 1}/{marks.length}
                            </p>
                            <p style={{ fontSize: 13, lineHeight: 1.35 }}>{m.title}</p>
                          </div>
                          {isDone ? (
                            <Ico name="check" size={14} color={C.green} sw={2} />
                          ) : (
                            <span style={{ fontSize: 12, color: C.coral }}>Start</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
          </>
          )}

          {isPlaceholder && (
            <p style={{ fontSize: 12, color: C.faint, marginTop: 16 }}>
              This journey is coming soon. Dares still count all the same.
            </p>
          )}
          {isJourneyActive && (
            <p style={{ fontSize: 12.5, color: C.faint, textAlign: "center", marginTop: 22 }}>
              Missed a day? No reset. Take the next dare.
            </p>
          )}
        </div>
        <Nav tab="journey" go={app.setScreen} />
      </div>

      {modal && <MilestoneModal app={app} ms={modal} color={journey.color} onClose={() => setModal(null)} />}
      {dayOpen !== null && journey.plan[dayOpen] && (
        <DayModal
          app={app}
          journey={journey}
          day={journey.plan[dayOpen]}
          dayIndex={dayOpen}
          isCurrent={dayOpen === daysDone}
          onClose={() => setDayOpen(null)}
        />
      )}
    </div>
  );
}
