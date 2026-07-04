import { useState } from "react";
import { C, CATS } from "../data/colors";
import { CAT_ICO } from "../data/icons";
import { EMBER_MARKS, EV_T, CH_ICO, CH_SIZE } from "../data/journeys";
import { Ico } from "../components/Ico";
import { Nav } from "../components/Nav";
import { wrap, pad } from "../components/layout";
import type { Cat } from "../types";
import type { DareApp } from "../lib/useDare";

export function Journey({ app }: { app: DareApp }) {
  const [openCh, setOpenCh] = useState<number | null>(1);
  const { journey, jd, chapter, currentDare } = app;
  const isEmber = journey.id === "ember";
  const hints: Cat[] = journey.bias.length ? journey.bias : ["forest", "walk", "dumbbells", "recovery", "pool", "focus"];
  const mDone = isEmber ? EMBER_MARKS.flat().filter((m) => m.done).length : 0;
  const mTot = isEmber ? EMBER_MARKS.flat().length : 0;

  return (
    <div className="dare-root">
      <div style={wrap}>
        <div style={pad}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <p className="lbl">Your journey</p>
            <button className="link" onClick={() => app.setScreen("journeys")}>
              Change journey
            </button>
          </div>
          <h2 className="serif" style={{ fontSize: 34, marginBottom: 2, color: journey.color }}>
            {journey.sym} {journey.name}
          </h2>
          <p style={{ color: C.dim, fontSize: 13.5, marginBottom: 14 }}>{journey.tag}</p>

          {/* marks band — Fabulous's 53% · 16/30 */}
          {isEmber && (
            <div
              className="card"
              style={{ padding: "14px 18px", marginBottom: 22, borderColor: journey.color + "44", display: "flex", justifyContent: "space-around", textAlign: "center" }}
            >
              <div>
                <p className="serif" style={{ fontSize: 26, color: journey.color }}>
                  {Math.round((mDone / mTot) * 100)}%
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
                  marks achieved
                </p>
              </div>
            </div>
          )}

          {/* the days ahead */}
          <p className="lbl" style={{ marginBottom: 12 }}>
            The days ahead
          </p>
          <div className="hscroll" style={{ marginBottom: 8 }}>
            {Array.from({ length: 7 }, (_, i) => {
              const isToday = i === 0;
              const isWild = i === 3;
              const milestone = !isToday && (jd + i) % CH_SIZE === 0 && chapter.idx < 3;
              return (
                <div key={i} style={{ minWidth: 64, textAlign: "center" }}>
                  <div
                    style={{
                      width: 52,
                      height: 52,
                      margin: "0 auto 6px",
                      borderRadius: 99,
                      border: `1px solid ${isToday ? journey.color : isWild ? C.gold + "77" : C.line}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 17,
                      color: isToday ? journey.color : isWild ? C.gold : C.dim,
                      opacity: isToday ? 1 : 0.75,
                      boxShadow: isToday ? `0 0 22px -8px ${journey.color}` : isWild ? `0 0 18px -8px ${C.gold}` : "none",
                    }}
                  >
                    {isToday ? (
                      currentDare && currentDare.completed ? (
                        <Ico name="check" size={18} color={journey.color} />
                      ) : (
                        "✦"
                      )
                    ) : isWild ? (
                      "?"
                    ) : (
                      <Ico name={CAT_ICO[hints[i % hints.length]]} size={19} color={C.dim} sw={1.3} />
                    )}
                  </div>
                  <p style={{ fontSize: 10, color: isToday ? C.text : C.faint }}>{isToday ? "Today" : `+${i}`}</p>
                  {milestone && <p style={{ fontSize: 9, color: C.gold }}>chapter ✦</p>}
                </div>
              );
            })}
          </div>
          <p style={{ fontSize: 12.5, color: C.dim, marginBottom: 26 }}>
            Tomorrow leans {CATS[hints[1 % hints.length]].label.toLowerCase()}. The rest stays sealed until its day.
          </p>

          {/* milestone path — chapters unlock in order */}
          {journey.chapters.map((c, i) => {
            const from = i * CH_SIZE;
            const to = (i + 1) * CH_SIZE;
            const state = i < 3 && jd >= to ? "done" : jd >= from ? "now" : "locked";
            const marks = isEmber ? EMBER_MARKS[i] : null;
            const chDone = marks ? marks.filter((m) => m.done).length : 0;
            const open = openCh === i && state !== "locked" && marks;
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
                  onClick={() => marks && state !== "locked" && setOpenCh(open ? null : i)}
                  style={{
                    display: "flex",
                    gap: 16,
                    alignItems: "center",
                    width: "100%",
                    background: "none",
                    border: "none",
                    cursor: marks && state !== "locked" ? "pointer" : "default",
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
                        opacity: state === "locked" ? 0.45 : 1,
                        boxShadow: state === "now" ? `0 0 26px -8px ${journey.color}` : "none",
                      }}
                    >
                      <Ico name={CH_ICO[i]} size={24} color={nodeCol} sw={1.4} />
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
                      {state === "locked" ? "Not yet unlocked" : marks ? `${chDone}/${marks.length} marks achieved` : c.goal}
                    </p>
                  </div>
                  {marks && state !== "locked" && <span style={{ color: C.faint, fontSize: 13 }}>{open ? "▾" : "▸"}</span>}
                </button>

                {open && marks && (
                  <div className="rise" style={{ margin: "12px 0 4px 76px" }}>
                    {marks.map((m, k) => (
                      <div
                        key={k}
                        className="card"
                        style={{ padding: "12px 14px", marginBottom: 8, display: "flex", gap: 12, alignItems: "center", borderColor: m.done ? C.line : journey.color + "44" }}
                      >
                        <Ico name={EV_T[m.t].ico} size={16} color={m.done ? C.dim : journey.color} sw={1.4} />
                        <div style={{ flex: 1 }}>
                          <p className="lbl" style={{ fontSize: 8, marginBottom: 2 }}>
                            {EV_T[m.t].label} · {k + 1}/{marks.length}
                          </p>
                          <p style={{ fontSize: 13, lineHeight: 1.35 }}>{m.title}</p>
                        </div>
                        {m.done ? (
                          <Ico name="check" size={14} color={C.green} sw={2} />
                        ) : (
                          <span style={{ fontSize: 12, color: C.coral }}>Start</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
          {!isEmber && (
            <p style={{ fontSize: 12, color: C.faint, marginTop: 16 }}>
              The marks for this journey are still being written. Dares count all the same.
            </p>
          )}
          <p style={{ fontSize: 12.5, color: C.faint, textAlign: "center", marginTop: 22 }}>
            Missed a day? No reset. Take the next dare.
          </p>
        </div>
        <Nav tab="journey" go={app.setScreen} />
      </div>
    </div>
  );
}
