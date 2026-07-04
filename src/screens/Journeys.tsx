import { C } from "../data/colors";
import { SYMBOLS } from "../data/symbols";
import { SPRINT_DAYS } from "../data/journeys";
import { wrap, pad } from "../components/layout";
import type { DareApp } from "../lib/useDare";

/** Journey picker — cada Journey conserva su propio progreso. */
export function Journeys({ app }: { app: DareApp }) {
  const { store, journeys } = app;

  return (
    <div className="dare-root">
      <div style={wrap}>
        <div style={pad}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 24 }}>
            <button className="link" style={{ textDecoration: "none", fontSize: 16 }} onClick={() => app.setScreen("journey")}>
              ←
            </button>
            <span className="lbl">Choose a journey</span>
            <span style={{ width: 16 }} />
          </div>
          <p className="serif" style={{ fontStyle: "italic", fontSize: 18, color: C.dim, marginBottom: 24, textAlign: "center" }}>
            Every journey is a 7-day sprint.
            <br />
            Switch whenever you want.
          </p>
          {journeys.map((j) => {
            const cur = j.id === store.journeyId;
            const p = store.journeyProgress[j.id];
            const completed = store.journeysCompleted.includes(j.id);
            const placeholder = j.plan.length === 0;
            const dream = store.dreamRewards[j.id];
            const remaining = Math.max(0, SPRINT_DAYS - p);

            let status: string;
            if (placeholder) status = "Coming soon";
            else if (completed) status = "Completed";
            else if (p > 0) status = `In progress · ${remaining} ${remaining === 1 ? "day" : "days"} remaining`;
            else if (j.id === "iron") status = "Not started · Recommended after The Ember";
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
                  boxShadow: cur ? `0 0 30px -14px ${j.color}` : "none",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <p className="serif" style={{ fontSize: 24, color: cur ? j.color : C.text }}>
                      {SYMBOLS[j.sym]} &nbsp;{j.name}
                    </p>
                    <p style={{ fontSize: 13, color: C.dim, marginTop: 4 }}>{j.tag}</p>
                    <p className="lbl" style={{ marginTop: 8, color: completed ? j.color : C.dim }}>
                      {status}
                    </p>
                    {dream && !placeholder && (
                      <p style={{ fontSize: 11.5, color: C.gold, marginTop: 6 }}>
                        {SYMBOLS.dream} Dream Reward: {dream}
                      </p>
                    )}
                  </div>
                  {cur && <span style={{ color: j.color, fontSize: 13 }}>● current</span>}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
