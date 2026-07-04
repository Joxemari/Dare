import { C } from "../data/colors";
import { wrap } from "../components/layout";
import type { DareApp } from "../lib/useDare";

const slides = [
  { h: "You don't need motivation.", s: "Motivation is unreliable. Starting isn't." },
  { h: "You need one dare a day.", s: "One small action. Chosen for you." },
  { h: "We decide. You begin.", s: "No lists. No plans. No decisions." },
  { h: "DARE", s: "Daily Actions. Real Energy.", last: true },
];

export function Onboarding({ app }: { app: DareApp }) {
  const sl = slides[app.obIdx];
  return (
    <div className="dare-root">
      <div
        style={{ ...wrap, justifyContent: "space-between", padding: "60px 32px 48px", textAlign: "center" }}
        onClick={() => !sl.last && app.setObIdx(app.obIdx + 1)}
      >
        <div className="pulse" style={{ color: C.green, fontSize: 22 }}>
          ✦
        </div>
        <div className="rise" key={app.obIdx}>
          <h1
            className="serif"
            style={{
              fontSize: sl.last ? 56 : 38,
              lineHeight: 1.15,
              margin: "0 0 18px",
              letterSpacing: sl.last ? "0.18em" : 0,
            }}
          >
            {sl.h}
          </h1>
          <p style={{ color: sl.last ? C.green : C.dim, fontSize: 15 }}>{sl.s}</p>
        </div>
        <div>
          {sl.last ? (
            <button className="btn btn-green" onClick={() => app.completeOnboarding()}>
              Start
            </button>
          ) : (
            <p className="lbl">Tap to continue · {app.obIdx + 1} / 4</p>
          )}
        </div>
      </div>
    </div>
  );
}
