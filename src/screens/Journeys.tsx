import { C } from "../data/colors";
import { SYMBOLS } from "../data/symbols";
import { SPRINT_DAYS, ROADMAP_JOURNEYS } from "../data/journeys";
import { wrap, pad } from "../components/layout";
import type { DareApp } from "../lib/useDare";

/** Journey picker — cada Journey conserva su propio progreso. Debajo de los 4
 *  del MVP, los Journeys de roadmap aparecen como "Coming soon": solo un
 *  preview (nombre, tag, promesa y la estructura de capítulos), sin CTA. */
export function Journeys({ app }: { app: DareApp }) {
  const { store, journeys } = app;
  const store_recommended = app.recommendedJourneyId;

  return (
    <div className="dare-root">
      <div style={wrap}>
        <div style={pad}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 24 }}>
            <button className="link" style={{ textDecoration: "none", fontSize: 16 }} aria-label="Back" onClick={() => app.setScreen("journey")}>
              ←
            </button>
            <span className="lbl">Choose a journey</span>
            <span style={{ width: 16 }} />
          </div>
          <p className="serif t-subhead" style={{ fontStyle: "italic", color: C.dim, marginBottom: 24, textAlign: "center" }}>
            Every journey is a 7-day sprint.
            <br />
            Run one or several at once.
          </p>
          {journeys.map((j) => {
            const cur = j.id === store.journeyId;
            const active = store.activeJourneyIds.includes(j.id);
            const p = store.journeyProgress[j.id];
            const completed = store.journeysCompleted.includes(j.id);
            const placeholder = j.plan.length === 0;
            const dream = store.dreamRewards[j.id];
            const remaining = Math.max(0, SPRINT_DAYS - p);

            const started = !active && !completed && !placeholder && !!store.journeyStartedAt[j.id];
            const recommended = j.id === store_recommended && !active && !completed && !started;
            let status: string;
            if (placeholder) status = "Coming soon";
            else if (completed) status = "Completed";
            else if (active && p > 0) status = `In progress · ${remaining} ${remaining === 1 ? "day" : "days"} remaining`;
            else if (active) status = "Started";
            else if (started) status = `Paused · Day ${Math.min(SPRINT_DAYS, p + 1)} of ${SPRINT_DAYS}`;
            else if (recommended) status = "Recommended today";
            else status = "Not started";

            return (
              <button
                key={j.id}
                className="card"
                disabled={placeholder}
                onClick={() => !placeholder && app.chooseJourney(j.id)}
                style={{
                  padding: 20,
                  marginBottom: 12,
                  width: "100%",
                  textAlign: "left",
                  cursor: placeholder ? "default" : "pointer",
                  fontFamily: "inherit",
                  color: C.text,
                  opacity: placeholder ? 0.55 : 1,
                  borderColor: cur ? j.color + "88" : C.line,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <p className="serif t-heading" style={{ color: cur ? j.color : C.text }}>
                      {SYMBOLS[j.sym]} &nbsp;{j.name}
                    </p>
                    <p style={{ fontSize: 13, color: C.dim, marginTop: 4 }}>{j.tag}</p>
                    <p className="lbl" style={{ marginTop: 8, color: completed || recommended ? j.color : C.dim }}>
                      {status}
                    </p>
                    {dream && !placeholder && (
                      <p style={{ fontSize: 11.5, color: C.gold, marginTop: 6 }}>
                        {SYMBOLS.dream} Dream Reward: {dream}
                      </p>
                    )}
                  </div>
                  {active && <span style={{ color: j.color, fontSize: 13 }}>● active</span>}
                </div>
              </button>
            );
          })}

          {/* Roadmap — solo preview, sin CTA. Estructura topline: los capítulos. */}
          <p className="lbl" style={{ margin: "26px 0 4px", color: C.dim }}>
            Coming soon
          </p>
          <p style={{ fontSize: 12, color: C.faint, marginBottom: 14 }}>
            Future journeys, in preview. Not yet startable.
          </p>
          {ROADMAP_JOURNEYS.map((j) => (
            <div
              key={j.id}
              className="card"
              style={{ padding: 18, marginBottom: 12, opacity: 0.6, borderStyle: "dashed" }}
              aria-label={`${j.name} — coming soon`}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <p className="serif t-subhead" style={{ color: C.text }}>
                  {SYMBOLS[j.sym]} &nbsp;{j.name}
                </p>
                <span className="lbl-sm" style={{ color: C.faint }}>Soon</span>
              </div>
              <p style={{ fontSize: 12.5, color: C.dim, marginTop: 4 }}>{j.tag}</p>
              <p style={{ fontSize: 12, color: C.faint, marginTop: 6, lineHeight: 1.5 }}>{j.promise}</p>
              <p className="lbl-sm" style={{ marginTop: 10, color: C.faint, lineHeight: 1.8 }}>
                {j.chapters.map((c) => c.name).join(" · ")}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
