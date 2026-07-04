import { C, CATS } from "../data/colors";
import { CAT_ICO } from "../data/icons";
import { SYMBOLS } from "../data/symbols";
import { TRAITS, findTrait } from "../data/traits";
import { SPRINT_DAYS } from "../data/journeys";
import { findDare } from "../lib/lookup";
import { Ico } from "../components/Ico";
import { Nav } from "../components/Nav";
import { wrap, pad } from "../components/layout";
import type { Cat } from "../types";
import type { DareApp } from "../lib/useDare";

export function Progress({ app }: { app: DareApp }) {
  const { store, catFeedback, proofCount, currentIdentity, journey, daysDone, dreamReward } = app;
  const identity = findTrait(currentIdentity);
  const remaining = Math.max(0, SPRINT_DAYS - daysDone);

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
          <p className="lbl" style={{ marginBottom: 20 }}>
            Your progress
          </p>

          {/* top cards: Proof / Momentum / Identity */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
            <div className="card" style={{ padding: 18 }}>
              <p className="lbl" style={{ marginBottom: 6 }}>
                Proof collected
              </p>
              <p className="serif" style={{ fontSize: 36 }}>
                {proofCount} <span style={{ color: C.green, fontSize: 18 }}>{SYMBOLS.spark}</span>
              </p>
              <p style={{ fontSize: 12, color: C.dim }}>{proofCount === 1 ? "proof" : "proofs"}</p>
            </div>
            <div className="card" style={{ padding: 18 }}>
              <p className="lbl" style={{ marginBottom: 6 }}>
                Momentum
              </p>
              <p className="serif" style={{ fontSize: 36 }}>
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
            <p className="serif" style={{ fontSize: 24 }}>
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
          {dreamReward && (
            <div className="card" style={{ padding: 16, marginBottom: 20, borderColor: C.gold + "33" }}>
              <p className="lbl" style={{ color: C.gold, marginBottom: 8 }}>
                {SYMBOLS.dream} Dream Reward
              </p>
              <p style={{ fontSize: 14, marginBottom: 8 }}>{dreamReward}</p>
              <div style={{ height: 4, background: C.line, borderRadius: 99, marginBottom: 6 }}>
                <div style={{ height: 4, width: `${(daysDone / SPRINT_DAYS) * 100}%`, background: C.gold, borderRadius: 99 }} />
              </div>
              <p style={{ fontSize: 11.5, color: C.dim }}>
                {journey.name} · {remaining} {remaining === 1 ? "Dare" : "Dares"} remaining
              </p>
            </div>
          )}

          {/* traits */}
          <p className="lbl" style={{ marginBottom: 14 }}>
            Traits — {store.traits.length} / {TRAITS.length}
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
                      <p className="serif" style={{ fontSize: 14.5, fontStyle: "italic", lineHeight: 1.35 }}>
                        "{p.text}"
                      </p>
                      <p className="lbl" style={{ fontSize: 8, marginTop: 3, color: C.faint }}>
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
        <Nav tab="progress" go={app.setScreen} />
      </div>
    </div>
  );
}
