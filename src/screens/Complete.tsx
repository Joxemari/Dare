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

            <h2 className="serif" style={{ fontSize: 38, marginBottom: 6 }}>
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
                  <p className="serif" style={{ fontSize: 22, lineHeight: 1.3 }}>
                    {treat.text}
                  </p>
                </div>
              )
            )}

            {/* energy feedback */}
            {treatFlipped &&
              (app.showPendingFb ? null : app.fbNote ? (
                <p style={{ fontSize: 12.5, color: C.dim, marginBottom: 22 }}>Noted. This shapes tomorrow's dare.</p>
              ) : (
                <div className="card" style={{ padding: 18, marginBottom: 24, maxWidth: 320, margin: "0 auto 24px" }}>
                  <p style={{ fontSize: 14.5, marginBottom: 12 }}>More energy than before?</p>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    {([["Much more", 2], ["A little more", 1], ["Same", 0], ["Less", -1]] as const).map(([lbl, v]) => (
                      <button key={lbl} className="pill" onClick={() => app.giveFeedback(v)}>
                        {lbl}
                      </button>
                    ))}
                  </div>
                </div>
              ))}

            <button className="btn btn-ghost" onClick={() => app.setScreen("home")}>
              Back home
            </button>

            {/* pie sutil — la evidencia queda guardada, sin gritarlo */}
            <p className="lbl" style={{ fontSize: 8.5, marginTop: 18, color: C.faint }}>
              {SYMBOLS.spark} Saved to Proof Library
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
