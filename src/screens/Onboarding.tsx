import { C } from "../data/colors";
import { SYMBOLS } from "../data/symbols";
import { wrap } from "../components/layout";
import type { DareApp } from "../lib/useDare";

/* Onboarding — 2 pantallas visuales (antes 4). Entrar en un ritual,
   no leer un tutorial. Símbolos del mapa central, glow suave, dark. */

function Screen1({ app }: { app: DareApp }) {
  return (
    <div
      style={{ ...wrap, justifyContent: "space-between", padding: "72px 32px 48px", textAlign: "center" }}
    >
      {/* símbolo grande con glow verde / horizonte */}
      <div style={{ position: "relative", display: "flex", justifyContent: "center", marginTop: 20 }}>
        <div
          style={{
            position: "absolute",
            width: 220,
            height: 220,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${C.green}22 0%, transparent 70%)`,
            top: -70,
          }}
        />
        <span className="pulse" style={{ color: C.green, fontSize: 64, position: "relative" }}>
          {SYMBOLS.spark}
        </span>
      </div>

      <div className="rise">
        <h1 className="serif" style={{ fontSize: 40, lineHeight: 1.12, margin: "0 0 16px" }}>
          You don't need
          <br />
          motivation.
        </h1>
        <p style={{ color: C.green, fontSize: 16, marginBottom: 14 }}>
          You need one smaller first step.
        </p>
        <p style={{ color: C.dim, fontSize: 13.5, lineHeight: 1.55, maxWidth: 300, margin: "0 auto" }}>
          DARE removes the decision and gives you one action for today.
        </p>
      </div>

      <div>
        <button className="btn btn-green" onClick={() => app.setObIdx(1)}>
          Continue
        </button>
        <p className="lbl" style={{ marginTop: 14, color: C.faint }}>
          No plan to read · No streak to protect
        </p>
      </div>
    </div>
  );
}

function Screen2({ app }: { app: DareApp }) {
  const orbs: [string, string, string][] = [
    [SYMBOLS.spark, "Dare", C.green],
    [SYMBOLS.rhythm, "Companion", C.purple],
    [SYMBOLS.treat, "Treat", C.gold],
  ];
  return (
    <div
      style={{ ...wrap, justifyContent: "space-between", padding: "72px 32px 48px", textAlign: "center" }}
    >
      {/* tres orbes simbólicos + Dream Reward al fondo */}
      <div className="rise" style={{ marginTop: 24 }}>
        <div style={{ display: "flex", justifyContent: "center", gap: 14, marginBottom: 12 }}>
          {orbs.map(([g, label, col]) => (
            <div key={label} style={{ textAlign: "center" }}>
              <div
                style={{
                  width: 68,
                  height: 68,
                  borderRadius: 16,
                  border: `1px solid ${col}55`,
                  background: "linear-gradient(160deg,#1E1E1B,#161614)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: `0 0 28px -12px ${col}`,
                }}
              >
                <span style={{ color: col, fontSize: 26 }}>{g}</span>
              </div>
              <p className="lbl" style={{ fontSize: 8.5, marginTop: 8, color: col }}>
                {label}
              </p>
            </div>
          ))}
        </div>
        <p className="lbl" style={{ color: C.faint, fontSize: 9 }}>
          {SYMBOLS.dream} Dream Reward at the end of every Journey
        </p>
      </div>

      <div className="rise">
        <h1 className="serif" style={{ fontSize: 38, lineHeight: 1.12, margin: "0 0 16px" }}>
          Start first.
          <br />
          Feel better second.
        </h1>
        <p style={{ color: C.green, fontSize: 16, marginBottom: 14 }}>
          Check in. Reveal your Dare. Collect proof.
        </p>
        <p style={{ color: C.dim, fontSize: 13.5, lineHeight: 1.55, maxWidth: 300, margin: "0 auto" }}>
          Every Journey is a 7-day sprint toward real energy.
        </p>
      </div>

      <div>
        <button className="btn btn-green" onClick={() => app.completeOnboarding()}>
          Enter DARE
        </button>
        <p className="lbl" style={{ marginTop: 14, color: C.faint }}>
          One Dare. One proof.
        </p>
      </div>
    </div>
  );
}

export function Onboarding({ app }: { app: DareApp }) {
  return <div className="dare-root">{app.obIdx === 0 ? <Screen1 app={app} /> : <Screen2 app={app} />}</div>;
}
