import { C } from "../data/colors";
import { CAT_ICO } from "../data/icons";
import { Ico } from "./Ico";
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

/** Reduce el companion a una sola palabra reconocible. */
export function companionWord(d: Dare): string {
  const c = d.companion.toLowerCase();
  if (/silence/.test(c)) return "Silence";
  if (/podcast/.test(c)) return "Podcast";
  if (/audiobook/.test(c)) return "Audiobook";
  if (/series|netflix|episode|show/.test(c)) return "Netflix";
  if (/playlist/.test(c)) return "Playlist";
  if (/album/.test(c)) return "Album";
  if (/song|music/.test(c)) return "Music";
  if (/coffee/.test(c)) return "Coffee";
  if (/friend/.test(c)) return "Friend";
  if (/skincare/.test(c)) return "Skincare";
  if (/class/.test(c)) return "Class";
  if (/daylight|sunlight|light|morning|sun/.test(c)) return "Daylight";
  // companions concretos de los Dares de activación
  if (/timer/.test(c)) return "Timer";
  if (/water/.test(c)) return "Water";
  if (/inbox|search bar/.test(c)) return "Inbox";
  if (/notes|calendar|messages|banking|app/.test(c)) return "App";
  if (/\bpen\b/.test(c)) return "Pen";
  if (/blank page|\bpage\b/.test(c)) return "Page";
  if (/window/.test(c)) return "Window";
  if (/chair/.test(c)) return "Chair";
  if (/table|corner|surface/.test(c)) return "Space";
  if (/shoes/.test(c)) return "Shoes";
  if (/breath|deep breath/.test(c)) return "Breath";
  if (/quiet|room/.test(c)) return "Quiet";
  // fallback: primera palabra con significado (salta artículos y números)
  const skip = new Set(["a", "an", "the", "one", "your", "my", "two", "cold", "single"]);
  const words = d.companion.replace(/[^A-Za-z0-9\s]/g, "").split(/\s+/).filter(Boolean);
  const w = words.find((x) => !skip.has(x.toLowerCase()) && /[a-z]/i.test(x)) ?? words[0] ?? "";
  return w ? w[0].toUpperCase() + w.slice(1) : "Companion";
}

/** Icono del companion según su palabra (line-art, sin emoji). */
function companionIco(word: string): string {
  if (word === "Silence" || word === "Daylight") return "moon";
  if (word === "Coffee" || word === "Skincare") return "spark";
  if (word === "Friend" || word === "Class") return "person";
  return "headphones";
}

/** Efecto esperado principal (mayor intensidad) para el strip de metadata. */
function topEffect(d: Dare): string {
  const entries = Object.entries(d.effects) as [string, number][];
  if (!entries.length) return "Reset";
  return entries.sort((a, b) => b[1] - a[1])[0][0];
}

export function Meta({ dare }: { dare: Dare }) {
  const companion = companionWord(dare);
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
