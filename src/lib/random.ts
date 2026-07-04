import { DRAWS } from "../data/draws";
import type { RewardDraw } from "../types";

/** Pick `n` distinct random items from `arr`. */
export function sample<T>(arr: readonly T[], n: number): T[] {
  const a = [...arr];
  const out: T[] = [];
  while (out.length < n && a.length) {
    out.push(a.splice(Math.floor(Math.random() * a.length), 1)[0]);
  }
  return out;
}

/** Roll a reward draw: common 70% / rare 24% / golden 6%. */
export function rollDraw(): RewardDraw {
  const r = Math.random();
  if (r < 0.06) {
    const g = DRAWS.golden[Math.floor(Math.random() * DRAWS.golden.length)];
    return { tier: "golden", text: g.text, x2: g.x2 };
  }
  if (r < 0.3) {
    return { tier: "rare", text: DRAWS.rare[Math.floor(Math.random() * DRAWS.rare.length)], x2: false };
  }
  return { tier: "common", text: DRAWS.common[Math.floor(Math.random() * DRAWS.common.length)], x2: false };
}
