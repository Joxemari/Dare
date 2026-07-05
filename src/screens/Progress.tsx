import { C, CATS } from "../data/colors";
import { CAT_ICO } from "../data/icons";
import { SYMBOLS } from "../data/symbols";
import { TRAITS, findTrait } from "../data/traits";
import { milestoneProgress } from "../data/journeys";
import { findDare } from "../lib/lookup";
import { todayStr } from "../lib/date";
import { Ico } from "../components/Ico";
import { Nav } from "../components/Nav";
import { wrap, pad } from "../components/layout";
import type { Cat, PlanWhen } from "../types";
import type { DareApp } from "../lib/useDare";

const WHEN_LABEL: Record<PlanWhen, string> = {
  "later-today": "Later today",
  "tomorrow-am": "Tomorrow morning",
  "tomorrow-pm": "Tomorrow evening",
  weekend: "This weekend",
  journey: "In your Journey",
};

export function Progress({ app }: { app: DareApp }) {
  const { store, catFeedback, proofCount, currentIdentity, journey, dreamReward, isJourneyActive } = app;
  const identity = findTrait(currentIdentity);
  // Dream Reward por MILESTONES (coherente con el trigger de completion), no por
  // días de calendario.
  const mp = milestoneProgress(journey, store.milestones);

  // Semana de CALENDARIO (Today / Tomorrow / días de la semana), distinta de la
  // línea de tiempo Day 1..7 del Journey. Muestra lo hecho hoy y lo planeado.
  const week = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const date = todayStr(d);
    return {
      offset: i,
      label: i === 0 ? "Today" : i === 1 ? "Tmrw" : d.toLocaleDateString("en-GB", { weekday: "short" }),
      count: store.completed.filter((c) => c.date === date).length,
    };
  });

  const fbEntries = (Object.entries(catFeedback) as [Cat, number][]).sort((a, b) => b[1] - a[1]);
  const bestCat = fbEntries[0];
  const catList = (Object.entries(store.catCounts) as [Cat, number][]).sort((a, b) => b[1] - a[1]);
  const mostCat = catList[0];

  const insights: string[] = [];
  if (bestCat && bestCat[1] > 0) insights.push(`${CATS[bestCat[0]].label} Dares give you the highest energy return so far.`);
  if (mostCat) insights.push(`${CATS[mostCat[0]].label} is your most completed category (${mostCat[1]}).`);
  const strengthFb = catFeedback.dumbbells ?? 0;
  if (strengthFb > 0) insights.push("Strength Dares are harder to start, but improve confidence most.");
  if ((catFeedback.pool ?? 0) > 0) insights.push("Pool Dares are your best recovery intervention so far.");

  return (
    <div className="dare-root">
      <div style={wrap}>
        <div style={pad}>
          <p className="lbl" style={{ marginBottom: 16 }}>
            Your progress
          </p>

          {/* weekly calendar row — this week at a glance */}
          <p className="lbl" style={{ marginBottom: 10, color: C.dim }}>
            This week
          </p>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 4, marginBottom: 22 }}>
            {week.map((d) => {
              const done = d.count > 0;
              const isToday = d.offset === 0;
              const border = done ? C.green : isToday ? journey.color : C.line;
              const fg = done ? C.green : isToday ? journey.color : C.faint;
              return (
                <div key={d.offset} style={{ textAlign: "center", flex: 1 }}>
                  <div
                    style={{
                      width: 34,
                      height: 34,
                      margin: "0 auto 5px",
                      borderRadius: 99,
                      border: `1px solid ${border}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 13,
                      color: fg,
                      opacity: done || isToday ? 1 : 0.6,
                      boxShadow: isToday && !done ? `0 0 16px -8px ${journey.color}` : "none",
                    }}
                  >
                    {done ? (d.count > 1 ? d.count : "✓") : isToday ? SYMBOLS.spark : ""}
                  </div>
                  <p style={{ fontSize: 8.5, color: isToday ? C.text : C.faint }}>{d.label}</p>
                </div>
              );
            })}
          </div>
          {store.plannedDares.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 22 }}>
              {store.plannedDares.map((pd) => (
                <span key={pd.id} className="pill" style={{ padding: "6px 12px", fontSize: 11, width: "auto", borderColor: C.purple + "77", color: C.purple }}>
                  {SYMBOLS.focus} Planned · {pd.label}
                </span>
              ))}
            </div>
          )}

          {/* Planned Dares (v5): Dares apartados para más tarde */}
          {store.darePlans.length > 0 && (
            <>
              <p className="lbl" style={{ marginBottom: 10, color: C.purple }}>
                {SYMBOLS.focus} Planned Dares
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 22 }}>
                {store.darePlans.map((p) => (
                  <div
                    key={p.id}
                    className="card"
                    style={{ padding: 14, display: "flex", alignItems: "center", justifyContent: "space-between", background: C.card2 }}
                  >
                    <div>
                      <p style={{ fontSize: 14, color: C.text }}>{p.label}</p>
                      <p className="lbl-sm" style={{ marginTop: 3, color: C.faint }}>
                        {WHEN_LABEL[p.when]}
                      </p>
                    </div>
                    <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                      <button className="link" style={{ color: C.faint, fontSize: 12 }} onClick={() => app.removeDarePlan(p.id)}>
                        Remove
                      </button>
                      <button className="link" style={{ color: C.green }} onClick={() => app.startPlannedDare(p)}>
                        Start
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* top cards: Proof / Momentum / Identity */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
            <div className="card" style={{ padding: 18 }}>
              <p className="lbl" style={{ marginBottom: 6 }}>
                Proof collected
              </p>
              <p className="serif t-display">
                {proofCount} <span style={{ color: C.green, fontSize: 18 }}>{SYMBOLS.spark}</span>
              </p>
              <p style={{ fontSize: 12, color: C.dim }}>{proofCount === 1 ? "proof" : "proofs"}</p>
            </div>
            <div className="card" style={{ padding: 18 }}>
              <p className="lbl" style={{ marginBottom: 6 }}>
                Momentum
              </p>
              <p className="serif t-display">
                {store.momentum.count} <span style={{ color: C.coral, fontSize: 18 }}>{SYMBOLS.momentum}</span>
              </p>
              <p style={{ fontSize: 12, color: C.dim }}>day momentum · no pressure</p>
            </div>
          </div>

          {/* current identity */}
          <div className="card" style={{ padding: 18, marginBottom: 20, background: C.card2 }}>
            <p className="lbl" style={{ marginBottom: 6 }}>
              Current Identity
            </p>
            <p className="serif t-heading">
              {identity ? `${SYMBOLS[identity.sym]} ${identity.name}` : `${SYMBOLS.spark} Starter`}
            </p>
            <p style={{ fontSize: 12.5, color: C.dim, marginTop: 4 }}>{identity?.line ?? "Starts before feeling ready."}</p>
          </div>

          {/* energy insights */}
          {insights.length > 0 && (
            <>
              <p className="lbl" style={{ marginBottom: 12 }}>
                {SYMBOLS.momentum} Energy Insights
              </p>
              <div className="card" style={{ padding: 16, marginBottom: 20 }}>
                {insights.map((t, i) => (
                  <p key={i} style={{ fontSize: 13, lineHeight: 1.5, color: C.dim, marginBottom: i < insights.length - 1 ? 8 : 0 }}>
                    {t}
                  </p>
                ))}
              </div>
            </>
          )}

          {/* dream reward progress */}
          {isJourneyActive && dreamReward && (
            <div className="card" style={{ padding: 16, marginBottom: 20, borderColor: C.gold + "33" }}>
              <p className="lbl" style={{ color: C.gold, marginBottom: 8 }}>
                {SYMBOLS.dream} Dream Reward
              </p>
              <p style={{ fontSize: 14, marginBottom: 8 }}>{dreamReward}</p>
              <div style={{ height: 4, background: C.line, borderRadius: 99, marginBottom: 6 }}>
                <div style={{ height: 4, width: `${mp.pct}%`, background: C.gold, borderRadius: 99 }} />
              </div>
              <p style={{ fontSize: 11.5, color: C.dim }}>
                {journey.name} · {mp.done === mp.total ? "unlocked" : `${mp.done}/${mp.total} milestones`}
              </p>
            </div>
          )}

          {/* badges */}
          <p className="lbl" style={{ marginBottom: 14 }}>
            Badges — {store.traits.length} / {TRAITS.length}
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginBottom: 24 }}>
            {TRAITS.map((tr) => {
              const got = store.traits.includes(tr.id);
              return (
                <div key={tr.id} style={{ textAlign: "center", opacity: got ? 1 : 0.32 }} title={got ? tr.line : tr.how}>
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
                      fontSize: 20,
                      color: got ? C.gold : C.faint,
                      boxShadow: got ? `0 0 20px -8px ${C.gold}` : "none",
                    }}
                  >
                    {SYMBOLS[tr.sym]}
                  </div>
                  <p style={{ fontSize: 9.5, color: got ? C.text : C.faint, lineHeight: 1.25 }}>{tr.name}</p>
                </div>
              );
            })}
          </div>

          {/* proof library */}
          <p className="lbl" style={{ marginBottom: 12 }}>
            Proof Library
          </p>
          {store.proofLibrary.length === 0 ? (
            <p style={{ fontSize: 13, color: C.faint, marginBottom: 8 }}>
              Your proofs appear here. Complete your first Dare to start collecting.
            </p>
          ) : (
            <div className="card" style={{ padding: 16 }}>
              {[...store.proofLibrary].reverse().map((p, i) => {
                const d = findDare(p.dareId);
                return (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      gap: 10,
                      alignItems: "baseline",
                      padding: "9px 0",
                      borderBottom: i < store.proofLibrary.length - 1 ? `1px solid ${C.line}` : "none",
                    }}
                  >
                    <span style={{ color: d ? CATS[d.cat].color : C.green, fontSize: 11 }}>{SYMBOLS.spark}</span>
                    <div style={{ flex: 1 }}>
                      <p className="serif t-quote" style={{ fontStyle: "italic", lineHeight: 1.35 }}>
                        "{p.text}"
                      </p>
                      <p className="lbl-sm" style={{ marginTop: 3, color: C.faint }}>
                        {p.date}
                        {d ? ` · ${d.title}` : ""}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div style={{ height: 12 }} />
          {/* small footnote of most-completed icon strip */}
          {mostCat && (
            <p style={{ fontSize: 12, color: C.faint, marginTop: 8, display: "flex", alignItems: "center", gap: 6 }}>
              <Ico name={CAT_ICO[mostCat[0]]} size={13} color={C.dim} /> The generator learns from every Dare.
            </p>
          )}
        </div>
        <Nav tab="progress" go={app.navigateTab} />
      </div>
    </div>
  );
}
