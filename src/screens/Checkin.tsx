import { C } from "../data/colors";
import { wrap, pad } from "../components/layout";
import type { Loc, MentalState } from "../types";
import type { DareApp } from "../lib/useDare";

const locs: [Loc, string][] = [
  ["home", "Home"],
  ["outside", "Outside"],
  ["forest", "Forest"],
  ["pool", "Pool"],
  ["gym", "Gym"],
  ["padel", "Padel"],
];
const states: [MentalState, string][] = [
  ["blocked", "Blocked"],
  ["tired", "Tired"],
  ["normal", "Normal"],
  ["active", "Active"],
  ["stressed", "Stressed"],
];

export function Checkin({ app }: { app: DareApp }) {
  const { draft, setDraft } = app;
  const ready = draft.energy && draft.time && draft.loc && draft.state;

  return (
    <div className="dare-root">
      <div style={wrap}>
        <div style={pad}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 26 }}>
            <button className="link" style={{ textDecoration: "none", fontSize: 16 }} onClick={() => app.setScreen("home")}>
              ←
            </button>
            <span className="lbl">Quick check-in</span>
            <span style={{ width: 16 }} />
          </div>
          <h2 className="serif" style={{ fontSize: 30, marginBottom: 4 }}>
            How are you today?
          </h2>
          <p style={{ color: C.dim, fontSize: 13, marginBottom: 18 }}>This helps me choose your perfect dare.</p>
          <button
            className="btn btn-line"
            style={{ marginBottom: 26, fontSize: 13.5, padding: 12 }}
            onClick={() => app.justDareMe()}
          >
            Just dare me — skip the questions ✦
          </button>

          <p className="lbl" style={{ marginBottom: 10 }}>
            Energy
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(10,1fr)", gap: 5, marginBottom: 22 }}>
            {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                className={"pill" + (draft.energy === n ? " on" : "")}
                style={{ padding: "8px 0", fontSize: 12 }}
                onClick={() => setDraft({ ...draft, energy: n })}
              >
                {n}
              </button>
            ))}
          </div>

          <p className="lbl" style={{ marginBottom: 10 }}>
            Time available
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, marginBottom: 22 }}>
            {[3, 10, 20, 30].map((t) => (
              <button
                key={t}
                className={"pill" + (draft.time === t ? " on" : "")}
                onClick={() => setDraft({ ...draft, time: t })}
              >
                {t} min
              </button>
            ))}
          </div>

          <p className="lbl" style={{ marginBottom: 10 }}>
            Where are you?
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginBottom: 22 }}>
            {locs.map(([id, t]) => (
              <button
                key={id}
                className={"pill" + (draft.loc === id ? " on" : "")}
                onClick={() => setDraft({ ...draft, loc: id })}
              >
                {t}
              </button>
            ))}
          </div>

          <p className="lbl" style={{ marginBottom: 10 }}>
            Mental state
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginBottom: 34 }}>
            {states.map(([id, t]) => (
              <button
                key={id}
                className={"pill" + (draft.state === id ? " on" : "")}
                onClick={() => setDraft({ ...draft, state: id })}
              >
                {t}
              </button>
            ))}
          </div>

          <button
            className="btn btn-ghost"
            disabled={!ready}
            style={{ opacity: ready ? 1 : 0.35 }}
            onClick={() =>
              ready &&
              app.runCheckin({
                energy: draft.energy!,
                time: draft.time!,
                loc: draft.loc!,
                state: draft.state!,
              })
            }
          >
            Get my dare
          </button>
          <p className="pulse" style={{ textAlign: "center", color: C.green, marginTop: 22 }}>
            ✦
          </p>
        </div>
      </div>
    </div>
  );
}
