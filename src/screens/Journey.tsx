import { useState } from "react";
import { C } from "../data/colors";
import { SYMBOLS } from "../data/symbols";
import { MS_T, chapterState, milestoneProgress, nextMilestone, milestoneUnlocked, SPRINT_DAYS } from "../data/journeys";
import { Ico } from "../components/Ico";
import { Nav } from "../components/Nav";
import { MilestoneModal } from "../components/MilestoneModal";
import { wrap, pad } from "../components/layout";
import type { Milestone } from "../types";
import type { DareApp } from "../lib/useDare";

export function Journey({ app }: { app: DareApp }) {
  const { journey, chapter, store, isJourneyActive } = app;
  const [openCh, setOpenCh] = useState<number | null>(chapter.idx);
  const [modal, setModal] = useState<Milestone | null>(null);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const isPlaceholder = journey.plan.length === 0;
  const dreamReward = store.dreamRewards[journey.id];
  const progress = store.journeyProgress[journey.id] ?? 0;
  /** Pausado: arrancado alguna vez (tiene fecha de inicio) pero no activo ahora.
   *  Se apoya en journeyStartedAt para distinguir "pausado en Day 1" de "sin empezar";
   *  cancelar borra esa fecha y vuelve a "sin empezar". */
  const paused = !isJourneyActive && !isPlaceholder && !!store.journeyStartedAt[journey.id];

  const mp = milestoneProgress(journey, store.milestones);
  const isComplete = store.journeysCompleted.includes(journey.id);
  // Próxima acción accionable: primer milestone pendiente del capítulo en curso.
  const next = isComplete ? null : nextMilestone(journey, store.milestones);

  // La pantalla Journey NO muestra ninguna línea de tiempo de días ("Days
  // Ahead"): el progreso se representa solo por capítulos, milestones y % de
  // completion. La fila semanal de calendario vive en la pestaña Progress.

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
          <h2 className="serif t-title" style={{ marginBottom: 2, color: journey.color }}>
            {SYMBOLS[journey.sym]} {journey.name}
          </h2>
          <p style={{ color: C.dim, fontSize: 13.5, marginBottom: 14 }}>{journey.tag}</p>

          {/* not started yet — Begin Journey (no auto-start on launch) */}
          {!isPlaceholder && !isJourneyActive && !paused && (
            <div className="card rise" style={{ padding: 22, marginBottom: 22, borderColor: journey.color + "55" }}>
              <p style={{ fontSize: 14.5, lineHeight: 1.55, marginBottom: 10 }}>{journey.promise}</p>
              <p className="serif t-quote" style={{ fontStyle: "italic", color: C.dim, marginBottom: 18 }}>
                "{journey.lesson}"
              </p>
              <button
                className="btn"
                style={{ background: journey.color, color: "#111" }}
                onClick={() => app.startJourney(journey.id)}
              >
                Begin Journey {SYMBOLS.spark}
              </button>
              <p style={{ fontSize: 11.5, color: C.faint, marginTop: 10, textAlign: "center" }}>
                {dreamReward ? `Dream Reward set: ${dreamReward}` : "You'll choose a Dream Reward first."}
              </p>
            </div>
          )}

          {/* paused — resume where you left off, or cancel to reset */}
          {paused && (
            <div className="card rise" style={{ padding: 22, marginBottom: 22, borderColor: journey.color + "55" }}>
              <p className="lbl" style={{ color: journey.color, marginBottom: 8 }}>Paused · Day {Math.min(SPRINT_DAYS, progress + 1)} of {SPRINT_DAYS}</p>
              <p style={{ fontSize: 14, lineHeight: 1.55, color: C.dim, marginBottom: 18 }}>
                Your progress is saved. Pick up exactly where you left off.
              </p>
              <button
                className="btn"
                style={{ background: journey.color, color: "#111" }}
                onClick={() => app.resumeJourney(journey.id)}
              >
                Resume Journey {SYMBOLS.spark}
              </button>
              {confirmCancel ? (
                <div style={{ marginTop: 12, textAlign: "center" }}>
                  <p style={{ fontSize: 12, color: C.coral, marginBottom: 8 }}>Cancel resets this sprint to Day 1. Sure?</p>
                  <button className="link" style={{ color: C.coral, marginRight: 18 }} onClick={() => { app.cancelJourney(journey.id); setConfirmCancel(false); }}>
                    Yes, reset it
                  </button>
                  <button className="link" style={{ color: C.dim }} onClick={() => setConfirmCancel(false)}>Keep progress</button>
                </div>
              ) : (
                <button className="link" style={{ color: C.faint, fontSize: 12, marginTop: 12, display: "block", width: "100%", textAlign: "center" }} onClick={() => setConfirmCancel(true)}>
                  Cancel journey
                </button>
              )}
            </div>
          )}

          {/* completion band */}
          {!isPlaceholder && isJourneyActive && (
            <div
              className="card"
              style={{ padding: "14px 18px", marginBottom: 22, borderColor: journey.color + "44", display: "flex", justifyContent: "space-around", textAlign: "center" }}
            >
              <div>
                <p className="serif t-heading" style={{ color: journey.color }}>
                  {mp.pct}%
                </p>
                <p className="lbl-sm">
                  completion
                </p>
              </div>
              <div style={{ width: 1, background: C.line }} />
              <div>
                <p className="serif t-heading">
                  {mp.done}/{mp.total}
                </p>
                <p className="lbl-sm">
                  milestones completed
                </p>
              </div>
            </div>
          )}

          {/* Journey completado — cierre persistente al revisitar la pantalla */}
          {!isPlaceholder && isJourneyActive && isComplete && (
            <div className="card rise" style={{ padding: 20, marginBottom: 22, borderColor: C.gold + "55", boxShadow: `0 0 40px -18px ${C.gold}`, textAlign: "center" }}>
              <p style={{ fontSize: 24, color: C.gold, marginBottom: 6 }}>{SYMBOLS.dream}</p>
              <p className="serif t-heading" style={{ marginBottom: 4 }}>
                Journey complete.
              </p>
              {dreamReward && (
                <p style={{ fontSize: 13, color: C.gold, marginBottom: 14 }}>Dream Reward unlocked: {dreamReward}</p>
              )}
              <button className="btn btn-line" onClick={() => app.setScreen("journeys")}>
                Choose your next Journey {SYMBOLS.spark}
              </button>
            </div>
          )}

          {/* Próxima acción — un toque al milestone pendiente exacto */}
          {!isPlaceholder && isJourneyActive && next && (
            <button
              className="card"
              onClick={() => setModal(next)}
              style={{
                width: "100%",
                textAlign: "left",
                fontFamily: "inherit",
                cursor: "pointer",
                padding: "14px 16px",
                marginBottom: 22,
                borderColor: journey.color + "66",
                display: "flex",
                gap: 12,
                alignItems: "center",
                color: C.text,
                boxShadow: `0 0 26px -14px ${journey.color}`,
              }}
            >
              <Ico name={MS_T[next.t].ico} size={18} color={journey.color} sw={1.5} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p className="lbl-sm" style={{ color: journey.color, marginBottom: 3 }}>
                  Next step · {MS_T[next.t].label}
                </p>
                <p style={{ fontSize: 14, lineHeight: 1.3 }}>{next.title}</p>
              </div>
              <span style={{ color: journey.color, fontSize: 13, flexShrink: 0 }}>{SYMBOLS.spark}</span>
            </button>
          )}

          {/* progresión SOLO por capítulos + milestones (sin "Days Ahead") */}
          {isJourneyActive && (
          <>
          {/* Active Dream Reward — el norte del Journey. Va en el COLOR DEL
              JOURNEY (no oro) para que se sienta parte de ESE Journey. */}
          {dreamReward && (
            <div className="card" style={{ padding: "12px 16px", marginBottom: 22, borderColor: journey.color + "33", display: "flex", gap: 10, alignItems: "center" }}>
              <span style={{ color: journey.color, fontSize: 18 }}>{SYMBOLS.dream}</span>
              <div>
                <p className="lbl-sm" style={{ color: journey.color, marginBottom: 2 }}>
                  Dream Reward
                </p>
                <p style={{ fontSize: 13.5 }}>{dreamReward}</p>
              </div>
            </div>
          )}

          <p className="lbl" style={{ marginBottom: 12 }}>
            Chapters
          </p>

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
                    <p className="serif t-subhead">
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
                      // Progresión secuencial: un milestone solo se activa cuando
                      // todos los anteriores del capítulo están hechos.
                      const unlocked = milestoneUnlocked(c, k, store.milestones);
                      const clickable = isDone || unlocked;
                      return (
                        <button
                          key={m.id}
                          onClick={() => clickable && setModal(m)}
                          disabled={!clickable}
                          aria-disabled={!clickable}
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
                            cursor: clickable ? "pointer" : "default",
                            opacity: clickable ? 1 : 0.5,
                            borderColor: isDone || !unlocked ? C.line : journey.color + "44",
                          }}
                        >
                          <Ico name={MS_T[m.t].ico} size={16} color={isDone ? C.dim : unlocked ? journey.color : C.faint} sw={1.4} />
                          <div style={{ flex: 1 }}>
                            <p className="lbl-sm" style={{ marginBottom: 2 }}>
                              {MS_T[m.t].label} · {k + 1}/{marks.length}
                            </p>
                            <p style={{ fontSize: 13, lineHeight: 1.35 }}>{m.title}</p>
                          </div>
                          {isDone ? (
                            <Ico name="check" size={14} color={C.green} sw={2} />
                          ) : unlocked ? (
                            <span style={{ fontSize: 12, color: journey.color }}>Start</span>
                          ) : (
                            <span style={{ fontSize: 12, color: C.faint }} aria-label="Locked">🔒</span>
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
            <div style={{ marginTop: 22, textAlign: "center" }}>
              <p style={{ fontSize: 12.5, color: C.faint, marginBottom: 14 }}>
                Missed a day? No reset. Take the next dare.
              </p>
              {confirmCancel ? (
                <div>
                  <p style={{ fontSize: 12, color: C.coral, marginBottom: 8 }}>Cancel resets this sprint to Day 1. Sure?</p>
                  <button className="link" style={{ color: C.coral, marginRight: 18 }} onClick={() => { app.cancelJourney(journey.id); setConfirmCancel(false); }}>
                    Yes, reset it
                  </button>
                  <button className="link" style={{ color: C.dim }} onClick={() => setConfirmCancel(false)}>Keep progress</button>
                </div>
              ) : (
                <div style={{ display: "flex", justifyContent: "center", gap: 22 }}>
                  <button className="link" style={{ color: C.dim, fontSize: 12.5 }} onClick={() => app.pauseJourney(journey.id)}>
                    Pause journey
                  </button>
                  <button className="link" style={{ color: C.faint, fontSize: 12.5 }} onClick={() => setConfirmCancel(true)}>
                    Cancel journey
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
        <Nav tab="journey" go={app.navigateTab} />
      </div>

      {modal && <MilestoneModal app={app} ms={modal} color={journey.color} onClose={() => setModal(null)} />}
    </div>
  );
}
