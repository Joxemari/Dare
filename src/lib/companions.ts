/* ============================================================
   companions — lógica PURA del sistema de Companions.

   Companion = recompensa DURANTE el Dare (temptation bundling).
   Este módulo NO toca DOM ni I/O: clasifica el companion de un
   Dare, resuelve una sugerencia concreta y accionable (rotando
   por fecha para no aburrir) y expone la configuración de vibes
   para sesgar el generador. Testable sin jsdom.

   Reparto (regla del repo): los DATOS (catálogo, vibes) viven en
   `data/companions.ts`; la LÓGICA vive aquí; la UI (chips, notas)
   solo presenta lo que este módulo decide.
   ============================================================ */
import type { CompanionCategory, CompanionVibe, Dare } from "../types";
import { COMPANIONS, VIBES, type VibeConfig } from "../data/companions";
import { mulberry32 } from "./prng";

/** Reduce el companion de un Dare a una sola palabra reconocible. */
export function companionWord(d: Dare): string {
  const c = d.companion.toLowerCase();
  if (/silence/.test(c)) return "Silence";
  if (/podcast/.test(c)) return "Podcast";
  if (/audiobook/.test(c)) return "Audiobook";
  if (/series|netflix|episode|show/.test(c)) return "Netflix";
  if (/youtube|video/.test(c)) return "YouTube";
  if (/playlist/.test(c)) return "Playlist";
  if (/album/.test(c)) return "Album";
  if (/song|music/.test(c)) return "Music";
  if (/coffee|café|cafe/.test(c)) return "Coffee";
  if (/friend|someone/.test(c)) return "Friend";
  if (/skincare/.test(c)) return "Skincare";
  if (/candle/.test(c)) return "Candle";
  if (/sauna|shower/.test(c)) return "Hot shower";
  if (/class/.test(c)) return "Class";
  if (/new|route|street|somewhere|different/.test(c)) return "New route";
  if (/daylight|sunlight|light|morning|sun/.test(c)) return "Daylight";
  // companions concretos de los Dares de activación (anti-procrastinación)
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

/** Clasifica una palabra de companion en su familia (o null si no encaja). */
export function companionCategory(word: string): CompanionCategory | null {
  switch (word) {
    case "Netflix":
    case "YouTube":
    case "Podcast":
    case "Audiobook":
    case "Playlist":
    case "Album":
    case "Music":
      return "entertainment";
    case "Friend":
    case "Class":
      return "social";
    case "Coffee":
    case "Skincare":
    case "Candle":
    case "Hot shower":
    case "Daylight":
      return "sensory";
    case "New route":
      return "novelty";
    default:
      return null;
  }
}

/** Familia del companion de un Dare (atajo). */
export function dareCompanionCategory(d: Dare): CompanionCategory | null {
  return companionCategory(companionWord(d));
}

/** Configuración de un vibe (o undefined si no existe). */
export function vibeConfig(vibe: CompanionVibe | null | undefined): VibeConfig | undefined {
  if (!vibe) return undefined;
  return VIBES.find((v) => v.vibe === vibe);
}

/** Hash estable de una cadena → semilla (pura, sin Date.now). */
function seedOf(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Un Companion resuelto para mostrar en el detalle del Dare. */
export interface ResolvedCompanion {
  word: string;
  label: string;
  note: string;
  category: CompanionCategory | null;
}

/**
 * Resuelve un Companion concreto y accionable para un Dare.
 *
 * - Si el vibe del check-in favorece una familia, prefiere esa; si no,
 *   usa la familia propia del companion del Dare.
 * - Elige entre los candidatos del catálogo que encajan con la categoría
 *   del Dare, ROTANDO por `seed` (fecha) para no repetir día a día.
 * - Si no hay candidato, cae al companion literal del Dare (nunca vacío).
 *
 * Determinista: mismo (dare, vibe, seed) ⇒ misma sugerencia.
 */
export function resolveCompanion(
  d: Dare,
  opts: { vibe?: CompanionVibe | null; seed?: string } = {},
): ResolvedCompanion {
  const baseWord = companionWord(d);
  const baseCat = companionCategory(baseWord);
  const cfg = vibeConfig(opts.vibe);
  // Familias objetivo: las del vibe (si sesga) o la propia del Dare.
  const targetCats: CompanionCategory[] =
    cfg && cfg.categories.length ? cfg.categories : baseCat ? [baseCat] : [];

  if (targetCats.length) {
    const candidates = COMPANIONS.filter(
      (c) =>
        targetCats.includes(c.category) &&
        (!c.cats || c.cats.length === 0 || c.cats.includes(d.cat)),
    );
    if (candidates.length) {
      const rnd = mulberry32(seedOf(`${d.id}|${opts.seed ?? ""}|${opts.vibe ?? ""}`));
      const pick = candidates[Math.floor(rnd() * candidates.length)];
      return { word: pick.word, label: pick.label, note: pick.note, category: pick.category };
    }
  }

  // Fallback: el companion literal del Dare + una nota genérica de la familia.
  return {
    word: baseWord,
    label: d.companion,
    note: companionNote(baseWord),
    category: baseCat,
  };
}

/** Nota (por qué acompañar la acción ayuda) para una palabra de companion. */
export function companionNote(word: string): string {
  const first = COMPANIONS.find((c) => c.word === word);
  if (first) return first.note;
  switch (word) {
    case "Silence":
      return "Fewer inputs to process — use the quiet as part of the reset.";
    case "Daylight":
      return "Daylight lifts alertness and helps set your body clock.";
    default:
      return "A companion makes the action enjoyable, so you're far more likely to begin.";
  }
}

/** Bonus de puntuación del generador según el vibe elegido en el check-in. */
export function vibeBonus(vibe: CompanionVibe | null | undefined, d: Dare): number {
  const cfg = vibeConfig(vibe);
  if (!cfg) return 0;
  let s = 0;
  const cat = dareCompanionCategory(d);
  if (cat && cfg.categories.includes(cat)) s += 16;
  if (cfg.bias.includes(d.cat)) s += 12;
  if (cfg.brutal && ["tabata", "fitboxing", "carry"].includes(d.cat) && d.min <= 15) s += 14;
  return s;
}
