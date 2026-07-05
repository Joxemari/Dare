import { C, EFFECT_COLOR } from "../data/colors";
import type { EffectMap } from "../types";

/** Expected Effect — categorías de sensación con "+", "++", "+++".
 *  `Stress` es un efecto de reducción: se muestra con "↓" (cuanto más intenso,
 *  más baja el estrés), no con "+". El resto son ganancias. El orden de las
 *  claves lo fija el propio Dare (el generador las ordena por relevancia). */
export function Effects({ effects }: { effects: EffectMap }) {
  const rows = Object.entries(effects) as [keyof EffectMap, 1 | 2 | 3][];
  if (!rows.length) return null;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {rows.map(([k, v]) => {
        const color = EFFECT_COLOR[k as keyof typeof EFFECT_COLOR];
        const reduces = k === "Stress";
        return (
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
                    background: i < v ? color : C.line,
                  }}
                />
              ))}
            </div>
            <span style={{ fontSize: 11, color, width: 26, textAlign: "right" }}>
              {(reduces ? "↓" : "+").repeat(v)}
            </span>
          </div>
        );
      })}
    </div>
  );
}
