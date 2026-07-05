import { TREATS } from "../data/rewards";
import type { Cat, Tier, Treat, TreatDraw } from "../types";

/** Escoge `n` elementos distintos al azar de `arr`. */
export function sample<T>(arr: readonly T[], n: number): T[] {
  const a = [...arr];
  const out: T[] = [];
  while (out.length < n && a.length) {
    out.push(a.splice(Math.floor(Math.random() * a.length), 1)[0]);
  }
  return out;
}

/**
 * Elige un treat del pool respetando el contexto del Dare completado:
 * los que CHOCAN con la categoría (`avoid`) quedan excluidos; los que
 * ENCAJAN (`fits`) pesan ×3 — se priman sin volverse un guion (la
 * sorpresa sigue siendo parte del treat). Fallback defensivo: si el
 * filtro vaciara el pool, se elige entre todos.
 *
 * Exportada para poder testearla con pools sintéticos y `rand` sembrado.
 */
export function pickTreat(pool: readonly Treat[], cat: Cat | null, rand: () => number): Treat {
  const eligible = cat ? pool.filter((t) => !t.avoid?.includes(cat)) : pool;
  const usable = eligible.length ? eligible : pool;
  const weights = usable.map((t) => (cat && t.fits?.includes(cat) ? 3 : 1));
  const total = weights.reduce((a, b) => a + b, 0);
  let x = rand() * total;
  for (let i = 0; i < usable.length; i++) {
    x -= weights[i];
    if (x < 0) return usable[i];
  }
  return usable[usable.length - 1];
}

/**
 * Tira un Treat Draw. Base: common 70% / rare 24% / golden 6% (sin "double XP").
 *
 * Combina las DOS intenciones del sistema de recompensas:
 *  - `cat` (contexto): categoría del Dare recién completado; dentro del tier
 *    elegido, `pickTreat` excluye los `avoid` y prima los `fits` (×3).
 *  - `boost` (0..1): SESGA la TIRADA hacia mejores tiers cuando el Dare merece
 *    premio extra según la ciencia del hábito — completar con poca motivación
 *    ("reward low-motivation completion strongly") o probar algo nuevo ("reward
 *    trying new activities, not only streaks"). A boost=1: golden ~16%, rare ~44%.
 *
 * `rand` es inyectable para que los tests sean deterministas (por defecto,
 * `Math.random`: la tirada real sigue siendo una sorpresa).
 */
export function rollTreat(cat: Cat | null = null, boost = 0, rand: () => number = Math.random): TreatDraw {
  const b = Math.max(0, Math.min(1, boost));
  const goldenP = 0.06 + 0.1 * b;
  const rareP = 0.3 + 0.2 * b;
  const r = rand();
  const tier: Tier = r < goldenP ? "golden" : r < rareP ? "rare" : "common";
  const t = pickTreat(TREATS[tier], cat, rand);
  return t.special ? { tier, text: t.text, special: t.special } : { tier, text: t.text };
}
