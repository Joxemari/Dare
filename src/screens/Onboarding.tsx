import { C } from "../data/colors";
import { SYMBOLS } from "../data/symbols";
import { wrap } from "../components/layout";
import { DareWord } from "../components/Wordmark";
import type { DareApp } from "../lib/useDare";

/* Onboarding — 3 pantallas visuales, SIN scroll cada una. Entrar en un ritual,
   no leer un tutorial. Símbolos del mapa central, glow suave, dark:
     1) Intro a DARE (marca SUTIL: favicon ✦ + "DARE", sin logo grande ni
        eslogan pesado; un símbolo con glow).
     2) La idea (no necesitas motivación, sino un primer paso más pequeño).
     3) El método (Dare · Companion · Treat + Journey). */

const screenStyle = { ...wrap, justifyContent: "space-between", padding: "72px 32px 48px", textAlign: "center" } as const;

/** Marca sutil: favicon ✦ (con pulso) + "DARE". Sin eslogan. */
function BrandMark() {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 9 }}>
      <span className="pulse" aria-hidden="true" style={{ color: C.green, fontSize: 18, lineHeight: 1 }}>
        {SYMBOLS.spark}
      </span>
      <DareWord style={{ fontSize: 14, letterSpacing: "0.34em", textIndent: "0.34em" }} />
    </div>
  );
}

/** 1 · Intro — qué es DARE, con marca sutil + un símbolo con glow. */
function Screen1({ app }: { app: DareApp }) {
  return (
    <div style={screenStyle}>
      <div style={{ marginTop: 20 }}>
        <BrandMark />
      </div>

      <div className="rise">
        {/* símbolo (favicon) con glow de horizonte — la "imagen" de la intro */}
        <div style={{ position: "relative", display: "flex", justifyContent: "center", marginBottom: 24 }}>
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              width: 220,
              height: 220,
              borderRadius: "50%",
              background: `radial-gradient(circle, ${C.green}22 0%, transparent 70%)`,
              top: -78,
            }}
          />
          <span aria-hidden="true" style={{ position: "relative", color: C.green, fontSize: 54, lineHeight: 1 }}>
            {SYMBOLS.spark}
          </span>
        </div>
        <h1 className="serif t-display" style={{ lineHeight: 1.12, margin: "0 0 14px" }}>
          A dare a day.
        </h1>
        <p style={{ color: C.green, fontSize: 16, marginBottom: 14 }}>Daily actions. Real energy.</p>
        <p style={{ color: C.dim, fontSize: 13.5, lineHeight: 1.55, maxWidth: 300, margin: "0 auto" }}>
          One small action, chosen for you — enough to start now, no plan to read.
        </p>
      </div>

      <div>
        <button className="btn btn-green" onClick={() => app.setObIdx(1)}>
          Continue
        </button>
      </div>
    </div>
  );
}

/** 2 · La idea — no necesitas motivación, sino un primer paso más pequeño. */
function Screen2({ app }: { app: DareApp }) {
  return (
    <div style={screenStyle}>
      <div style={{ marginTop: 20 }}>
        <BrandMark />
      </div>

      <div className="rise">
        <h1 className="serif t-display" style={{ lineHeight: 1.12, margin: "0 0 16px" }}>
          You don't need
          <br />
          motivation.
        </h1>
        <p style={{ color: C.green, fontSize: 16, marginBottom: 14 }}>You need one smaller first step.</p>
        <p style={{ color: C.dim, fontSize: 13.5, lineHeight: 1.55, maxWidth: 300, margin: "0 auto" }}>
          Just one action for today — small enough to start right now.
        </p>
      </div>

      <div>
        <button className="btn btn-green" onClick={() => app.setObIdx(2)}>
          Continue
        </button>
      </div>
    </div>
  );
}

/** 3 · El método — Dare · Companion · Treat + Journey (OK como estaba). */
function Screen3({ app }: { app: DareApp }) {
  const orbs: [string, string, string][] = [
    [SYMBOLS.spark, "Dare", C.green],
    [SYMBOLS.rhythm, "Companion", C.purple],
    [SYMBOLS.treat, "Treat", C.gold],
  ];
  return (
    <div style={screenStyle}>
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
              <p className="lbl-sm" style={{ marginTop: 8, color: col }}>
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
        <h1 className="serif t-display" style={{ lineHeight: 1.12, margin: "0 0 16px" }}>
          Start first.
          <br />
          Feel better second.
        </h1>
        <p style={{ color: C.green, fontSize: 16, marginBottom: 14 }}>Check in. Reveal your Dare. Collect proof.</p>
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
  return (
    <div className="dare-root">
      {app.obIdx === 0 ? <Screen1 app={app} /> : app.obIdx === 1 ? <Screen2 app={app} /> : <Screen3 app={app} />}
    </div>
  );
}
