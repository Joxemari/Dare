import { TREATS } from "../data/rewards";
import type { TreatDraw } from "../types";

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
 * Tira un Treat Draw. Base: common 70% / rare 24% / golden 6% (sin "double XP").
 *
 * `boost` (0..1) SESGA la tirada hacia mejores treats. El caller lo sube
 * cuando el Dare merece premio extra según la ciencia del hábito:
 * completar con poca motivación (spec: "reward low-motivation completion
 * strongly") o probar una actividad/deporte nuevo (spec: "reward trying new
 * activities, not only streaks"). A boost=1: golden ~16%, rare ~44%.
 */
export function rollTreat(boost = 0): TreatDraw {
  const b = Math.max(0, Math.min(1, boost));
  const goldenP = 0.06 + 0.1 * b;
  const rareP = 0.3 + 0.2 * b;
  const r = Math.random();
  if (r < goldenP) {
    const g = TREATS.golden[Math.floor(Math.random() * TREATS.golden.length)];
    return { tier: "golden", text: g.text, special: g.special };
  }
  if (r < rareP) {
    return { tier: "rare", text: TREATS.rare[Math.floor(Math.random() * TREATS.rare.length)] };
  }
  return { tier: "common", text: TREATS.common[Math.floor(Math.random() * TREATS.common.length)] };
}
