import { C } from "../data/colors";
import { TIER } from "../data/rewards";
import { SYMBOLS } from "../data/symbols";
import { wrap, pad } from "../components/layout";
import { cardRevealFeedback } from "../lib/feedback";
import type { DareApp } from "../lib/useDare";

/* Pantalla de "Dare completed" — premium, oscura y celebratoria sin caer en
   lo infantil (spec bugfix pass §3). El Treat es el HÉROE: se revela con un
   tap. Nada de XP, nada de cita de proof como mensaje principal, ni bloque de
   badges. La feedback de energía sigue igual; un pie sutil recuerda que quedó
   guardado en la Proof Library. La completion de Journey vive en su propia
   pantalla (JourneyComplete), así los dos flujos no colisionan. */
export function Complete({ app }: { app: DareApp }) {
  const { treat, treatFlipped } = app;
  const t = treat ? TIER[treat.tier] : TIER.common;
  const golden = treat?.tier === "golden";

  return (
    <div className="dare-root">
      <div style={{ ...wrap, textAlign: "center", position: "relative", overflow: "hidden" }}>
        {/* símbolos de celebración ✦ ✧ ◈ ⟡ flotando en dorado */}
        {[
          { x: "16%", t: "12%", g: SYMBOLS.spark },
          { x: "78%", t: "14%", g: SYMBOLS.treat },
          { x: "30%", t: "30%", g: SYMBOLS.dream },
          { x: "70%", t: "34%", g: SYMBOLS.wildcard },
          { x: "50%", t: "8%", g: SYMBOLS.treat },
        ].map((s, i) => (
          <span
            key={i}
            className="pulse"
            style={{ position: "absolute", left: s.x, top: s.t, color: C.gold, opacity: 0.35, fontSize: 10 + (i % 3) * 4, animationDelay: `${i * 0.5}s` }}
          >
            {s.g}
          </span>
        ))}

        <div style={{ ...pad, display: "flex", flexDirection: "column", justifyContent: "center", minHeight: "100%" }}>
          <div className="rise">
            {/* corona simbólica ✦ ✧ ◈ */}
            <p style={{ fontSize: 26, letterSpacing: 10, color: C.gold, marginBottom: 20, opacity: 0.9 }}>
              {SYMBOLS.spark} {SYMBOLS.treat} {SYMBOLS.dream}
            </p>

            <h2 className="serif t-display" style={{ marginBottom: 6 }}>
              Dare completed.
            </h2>
            <p style={{ color: C.gold, fontSize: 17, marginBottom: 28 }}>
              {SYMBOLS.treat} Treat unlocked.
            </p>

            {/* treat draw — el héroe de la completion */}
            {treat && !treatFlipped ? (
              <button
                className="tcard pulse"
                style={{ width: 200, height: 116, margin: "0 auto 26px", display: "block" }}
                onClick={() => {
                  cardRevealFeedback();
                  app.setTreatFlipped(true);
                }}
              >
                <span style={{ color: C.gold, fontSize: 20 }}>{SYMBOLS.treat}</span>
                <p className="lbl" style={{ marginTop: 10 }}>
                  Your Treat
                </p>
                <p style={{ fontSize: 11.5, color: C.faint, marginTop: 6 }}>Tap to reveal</p>
              </button>
            ) : (
              treat && (
                <div
                  className="card flip"
                  style={{
                    padding: 22,
                    margin: "0 auto 26px",
                    maxWidth: 300,
                    borderColor: t.color + "77",
                    boxShadow: golden ? `0 0 54px -12px ${C.gold}` : `0 0 34px -18px ${t.color}`,
                  }}
                >
                  <p className="lbl" style={{ color: t.color, marginBottom: 10 }}>
                    {SYMBOLS.treat} {t.label}
                  </p>
                  <p className="serif t-heading" style={{ lineHeight: 1.3, marginBottom: 12 }}>
                    {treat.text}
                  </p>
                  {/* celebración + qué es el treat: se ganó al terminar el Dare */}
                  <p style={{ fontSize: 12.5, lineHeight: 1.55, color: C.dim }}>
                    You earned this. A small, real reward for finishing today's dare — enjoy it
                    {golden ? ", this one's rare." : " without guilt."}
                  </p>
                </div>
              )
            )}

            <button className="btn btn-ghost" onClick={() => app.setScreen("home")}>
              Back home
            </button>

            {/* pie sutil — la evidencia queda guardada, sin gritarlo */}
            <p className="lbl-sm" style={{ marginTop: 18, color: C.faint }}>
              {SYMBOLS.spark} Saved to Proof Library
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
