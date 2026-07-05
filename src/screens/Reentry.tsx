import { C } from "../data/colors";
import { wrap, pad } from "../components/layout";
import { InstallBanner } from "../components/InstallBanner";
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
            <h1 className="serif t-display" style={{ lineHeight: 1.15, marginBottom: 12 }}>
              No reset.
            </h1>
            <p className="serif t-subhead" style={{ fontStyle: "italic", color: C.dim, marginBottom: 8 }}>
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
                  <p className="serif t-subhead">
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

            {/* El que vuelve tras una ausencia es justo quien más riesgo tiene de
                perder el localStorage (desalojo de Safari): nudge de instalación. */}
            {app.installNudge !== "none" && (
              <div style={{ marginTop: 30 }}>
                <InstallBanner
                  offer={app.installNudge}
                  onInstall={app.promptInstall}
                  onDismiss={app.dismissInstall}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
