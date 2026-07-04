import { C } from "../data/colors";
import { wrap, pad } from "../components/layout";
import { findDare } from "../lib/lookup";
import type { DareApp } from "../lib/useDare";

/** Re-entry after an absence. The cheapest interaction in the app. No guilt. */
export function Reentry({ app }: { app: DareApp }) {
  const comeback = findDare("out-the-door")!;
  return (
    <div className="dare-root">
      <div style={{ ...wrap, textAlign: "center" }}>
        <div style={{ ...pad, display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <div className="rise">
            <div className="pulse" style={{ color: C.green, fontSize: 22, marginBottom: 26 }}>
              ✦
            </div>
            <h1 className="serif" style={{ fontSize: 44, lineHeight: 1.15, marginBottom: 12 }}>
              No reset.
            </h1>
            <p className="serif" style={{ fontStyle: "italic", fontSize: 20, color: C.dim, marginBottom: 8 }}>
              Take the next dare.
            </p>
            <p style={{ fontSize: 13, color: C.faint, marginBottom: 34 }}>
              Your streak sleeps. It doesn't die.
            </p>
            <div className="card" style={{ padding: 22, marginBottom: 22, textAlign: "left" }}>
              <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                <div
                  style={{
                    width: 46,
                    height: 46,
                    borderRadius: 99,
                    border: `1px solid ${C.green}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 18,
                  }}
                >
                  ✦
                </div>
                <div>
                  <p className="serif" style={{ fontSize: 21 }}>
                    {comeback.title}
                  </p>
                  <p style={{ fontSize: 12.5, color: C.dim, marginTop: 2 }}>
                    3 min · that's the whole comeback
                  </p>
                </div>
              </div>
            </div>
            <button className="btn btn-green" onClick={() => app.doComeback()}>
              Do it now
            </button>
            <button className="link" style={{ marginTop: 16 }} onClick={() => app.dismissAway()}>
              Not yet — just look around
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
