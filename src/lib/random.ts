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

/** Tira un Treat Draw: common 70% / rare 24% / golden 6%. Sin "double XP". */
export function rollTreat(): TreatDraw {
  const r = Math.random();
  if (r < 0.06) {
    const g = TREATS.golden[Math.floor(Math.random() * TREATS.golden.length)];
    return { tier: "golden", text: g.text, special: g.special };
  }
  if (r < 0.3) {
    return { tier: "rare", text: TREATS.rare[Math.floor(Math.random() * TREATS.rare.length)] };
  }
  return { tier: "common", text: TREATS.common[Math.floor(Math.random() * TREATS.common.length)] };
}
