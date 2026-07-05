import { C } from "../data/colors";
import { SYMBOLS } from "../data/symbols";
import type { InstallOffer } from "../lib/install";

/* ============================================================
   InstallBanner — nudge "añadir a inicio" (PWA). Presentacional:
   recibe la DECISIÓN ya tomada (`offer`, calculada por install.ts en
   el hook) y dos callbacks. Sin efectos → no se testea, como el resto
   de componentes.

   Por qué existe: instalar la app hace DURADERO el localStorage en iOS
   (Safari desaloja el de una web no instalada a los ~7 días) → protege
   el progreso del Journey. Ver src/lib/install.ts y CLAUDE.md.
   ============================================================ */

export function InstallBanner({
  offer,
  onInstall,
  onDismiss,
  compact = false,
}: {
  offer: InstallOffer;
  onInstall: () => void;
  onDismiss: () => void;
  /** `true` en Ajustes: sin botón de descartar (el usuario lo buscó). */
  compact?: boolean;
}) {
  if (offer === "none") return null;

  const line =
    offer === "ios-manual"
      ? "Tap Share, then “Add to Home Screen” to keep your thread safe."
      : "Add DARE to your home screen to keep your thread safe — and your progress from being cleared.";

  return (
    <div
      className="card"
      style={{
        padding: 16,
        display: "flex",
        gap: 14,
        alignItems: "flex-start",
        textAlign: "left",
      }}
    >
      <div
        aria-hidden="true"
        style={{
          width: 34,
          height: 34,
          flexShrink: 0,
          borderRadius: 10,
          border: `1px solid ${C.line}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: C.green,
          fontSize: 15,
        }}
      >
        {SYMBOLS.spark}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <p className="serif t-quote" style={{ color: C.text, marginBottom: 3 }}>
          Keep DARE close
        </p>
        <p style={{ fontSize: 12.5, color: C.dim, lineHeight: 1.5 }}>{line}</p>

        <div style={{ display: "flex", gap: 16, alignItems: "center", marginTop: 12 }}>
          {offer === "prompt" && (
            <button
              className="btn btn-line"
              style={{ width: "auto", padding: "7px 16px", fontSize: 12.5 }}
              onClick={onInstall}
            >
              Add to Home Screen
            </button>
          )}
          {!compact && (
            <button className="link" style={{ color: C.faint, fontSize: 12 }} onClick={onDismiss}>
              Not now
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
