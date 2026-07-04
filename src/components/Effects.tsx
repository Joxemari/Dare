import { C, EFFECT_COLOR } from "../data/colors";
import type { EffectMap } from "../types";

/** Expected Effect — categorías de sensación con "+", "++", "+++". */
export function Effects({ effects }: { effects: EffectMap }) {
  const rows = Object.entries(effects) as [keyof EffectMap, 1 | 2 | 3][];
  if (!rows.length) return null;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {rows.map(([k, v]) => (
        <div key={k} style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ width: 84, fontSize: 12.5, color: C.text }}>{k}</span>
          <div style={{ display: "flex", gap: 4, flex: 1 }}>
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                style={{
                  height: 4,
                  flex: 1,
                  borderRadius: 99,
                  background: i < v ? EFFECT_COLOR[k as keyof typeof EFFECT_COLOR] : C.line,
                }}
              />
            ))}
          </div>
          <span style={{ fontSize: 11, color: EFFECT_COLOR[k as keyof typeof EFFECT_COLOR], width: 26, textAlign: "right" }}>
            {"+".repeat(v)}
          </span>
        </div>
      ))}
    </div>
  );
}
