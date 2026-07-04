import { C } from "../data/colors";
import { JOURNEYS, chapterOf } from "../data/journeys";
import { wrap, pad } from "../components/layout";
import type { DareApp } from "../lib/useDare";

/** Journey picker — every journey keeps its own progress. */
export function Journeys({ app }: { app: DareApp }) {
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
            Every journey keeps its own progress.
            <br />
            Switch whenever you want.
          </p>
          {JOURNEYS.map((j) => {
            const cur = j.id === app.store.journeyId;
            const p = app.store.journeyProgress[j.id];
            const ch = chapterOf(j, p);
            return (
              <button
                key={j.id}
                className="card"
                onClick={() => {
                  app.setJourney(j.id);
                  app.setScreen("journey");
                }}
                style={{
                  padding: 20,
                  marginBottom: 12,
                  width: "100%",
                  textAlign: "left",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  color: C.text,
                  borderColor: cur ? j.color + "88" : C.line,
                  boxShadow: cur ? `0 0 30px -14px ${j.color}` : "none",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <p className="serif" style={{ fontSize: 24, color: cur ? j.color : C.text }}>
                      {j.sym} &nbsp;{j.name}
                    </p>
                    <p style={{ fontSize: 13, color: C.dim, marginTop: 4 }}>{j.tag}</p>
                    <p className="lbl" style={{ marginTop: 8 }}>
                      {p > 0 ? `Chapter ${ch.n} — ${ch.name} · ${p} dares in` : "Not started"}
                    </p>
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
