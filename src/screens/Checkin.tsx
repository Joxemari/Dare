import { C } from "../data/colors";
import { SYMBOLS } from "../data/symbols";
import { wrap, pad } from "../components/layout";
import type { CurrentLoc, Dest, MentalState } from "../types";
import type { DareApp } from "../lib/useDare";

const locs: [CurrentLoc, string][] = [
  ["home", "Home"],
  ["city", "City / street"],
  ["park", "Park / outside"],
  ["office", "Office"],
  ["travelling", "Travelling"],
];
const dests: [Dest | "none", string][] = [
  ["none", "Not now"],
  ["forest", "Forest"],
  ["pool", "Pool"],
  ["gym", "Gym / Fitboxing"],
  ["padel", "Padel"],
  ["cafe", "Café walk"],
];
const states: [MentalState, string][] = [
  ["blocked", "Blocked"],
  ["tired", "Tired"],
  ["normal", "Normal"],
  ["active", "Active"],
  ["stressed", "Stressed"],
];
const planOpts: [Dest, string][] = [
  ["forest", "Plan forest"],
  ["pool", "Plan pool"],
  ["padel", "Plan padel"],
  ["gym", "Plan Fitboxing"],
  ["cafe", "Plan café walk"],
];

export function Checkin({ app }: { app: DareApp }) {
  const { draft, setDraft, store } = app;
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
            Just dare me — skip the questions {SYMBOLS.spark}
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
            Where are you right now?
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 8, marginBottom: 22 }}>
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
            Can DARE send you somewhere?
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginBottom: 22 }}>
            {dests.map(([id, t]) => {
              // draft.dest === null significa SIN tocar → ningún botón marcado.
              const on = draft.dest === id;
              return (
                <button
                  key={id}
                  className={"pill" + (on ? " on" : "")}
                  style={{ fontSize: 12 }}
                  onClick={() => setDraft({ ...draft, dest: id })}
                >
                  {t}
                </button>
              );
            })}
          </div>

          <p className="lbl" style={{ marginBottom: 10 }}>
            Mental state
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginBottom: 26 }}>
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
                // null (sin tocar) o "none" (Not now) → sin destino
                dest: draft.dest && draft.dest !== "none" ? draft.dest : null,
                state: draft.state!,
              })
            }
          >
            Get my dare
          </button>

          {/* planning — no time now? plan it instead */}
          <div className="card" style={{ padding: 16, margin: "22px 0 0", background: C.card2 }}>
            <p className="lbl" style={{ marginBottom: 10 }}>
              {SYMBOLS.focus} Plan a Dare this week
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {planOpts.map(([dest, label]) => {
                const on = store.plannedDares.some((p) => p.dest === dest);
                return (
                  <button
                    key={dest}
                    className={"pill" + (on ? " on" : "")}
                    style={{ padding: "8px 14px", fontSize: 12, width: "auto" }}
                    aria-pressed={on}
                    onClick={() => app.togglePlanDare(dest, label.replace("Plan ", ""))}
                  >
                    {on ? "✓ " : ""}
                    {label}
                  </button>
                );
              })}
            </div>
            <p style={{ fontSize: 11, color: C.faint, marginTop: 10 }}>
              Tap to plan, tap again to remove. Planned Dares appear in Progress.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
