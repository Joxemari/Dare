import { C } from "../data/colors";
import { CAT_ICO } from "../data/icons";
import { Ico } from "./Ico";
import { companionWord } from "../lib/companions";
import type { Dare, Loc } from "../types";

/* Trigger / Companion / After strip en el detalle del Dare.
   Reglas (spec): los chips de arriba usan UNA palabra, sin truncar. La
   explicación larga vive en las secciones de abajo. */

const PLACE_WORD: Record<Loc, string> = {
  home: "Home",
  outside: "Outside",
  forest: "Forest",
  pool: "Pool",
  gym: "Gym",
  padel: "Court",
};

function placeWord(d: Dare): string {
  return PLACE_WORD[d.locs[0]] ?? "Anywhere";
}

/** Icono del companion según su palabra (line-art, sin emoji). */
function companionIco(word: string): string {
  if (word === "Silence" || word === "Daylight") return "moon";
  if (word === "Coffee" || word === "Skincare" || word === "Candle" || word === "Hot shower") return "spark";
  if (word === "Friend" || word === "Class") return "person";
  return "headphones";
}

/** Efecto esperado principal (mayor intensidad) para el strip de metadata. */
function topEffect(d: Dare): string {
  const entries = Object.entries(d.effects) as [string, number][];
  if (!entries.length) return "Reset";
  return entries.sort((a, b) => b[1] - a[1])[0][0];
}

export function Meta({ dare, companion: companionOverride }: { dare: Dare; companion?: string }) {
  // El companion del strip debe COINCIDIR con el de la sección "Companion" del
  // detalle: si el llamador ya resolvió uno (resolveCompanion, rotado por fecha),
  // lo usamos; si no, caemos al literal del Dare.
  const companion = companionOverride ?? companionWord(dare);
  // "After/Treat" fuera: los Treats aparecen TRAS completar, no antes (spec).
  const rows: [string, string, string][] = [
    [CAT_ICO[dare.cat], "Place", placeWord(dare)],
    [companionIco(companion), "Companion", companion],
    ["spark", "Effect", topEffect(dare)],
  ];
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        gap: 22,
        borderTop: `1px solid ${C.line}`,
        borderBottom: `1px solid ${C.line}`,
        padding: "14px 0",
        margin: "18px 0",
      }}
    >
      {rows.map(([ico, k, v], i) => (
        <div key={i} style={{ textAlign: "center" }}>
          <div style={{ marginBottom: 4, display: "flex", justifyContent: "center" }}>
            <Ico name={ico} size={16} color={C.dim} sw={1.4} />
          </div>
          <div className="lbl" style={{ fontSize: 9 }}>
            {k}
          </div>
          <div style={{ fontSize: 12, marginTop: 2 }}>{v}</div>
        </div>
      ))}
    </div>
  );
}
