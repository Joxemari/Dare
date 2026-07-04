import { DARES } from "../data/dares";
import { WILDCARDS } from "../data/wildcards";
import type { Cat, Checkin, Dare, Journey } from "../types";

/* --------------------- DARE GENERATOR ---------------------
   Scoring, not chained if/else. Optimizes probability of
   STARTING, not the perfect workout. */
export function generateDare(
  ci: Checkin,
  lastCats: Cat[],
  catFeedback: Partial<Record<Cat, number>>,
  journey: Journey,
): { dare: Dare; why: string } {
  // wildcard chance — anticipation lives here
  if (ci.time >= 10 && ci.energy >= 3 && Math.random() < 0.18) {
    const wpool = WILDCARDS.filter((w) => w.min <= ci.time + 2 && w.locs.includes(ci.loc));
    if (wpool.length) {
      const dare = wpool[Math.floor(Math.random() * wpool.length)];
      return {
        dare,
        why: "Wildcard. The usual rules rest today — this one is for the part of you that gets bored.",
      };
    }
  }

  let pool: Dare[];
  if (ci.time === 3) {
    pool = DARES.filter((d) => d.cat === "small");
  } else {
    pool = DARES.filter((d) => d.cat !== "small" && d.min <= ci.time + 2 && d.locs.includes(ci.loc));
    if (ci.energy <= 3 || ci.state === "blocked" || ci.state === "tired") {
      const easy = pool.filter((d) => d.level === "Easy" && d.min <= 12);
      pool = easy.length ? easy : DARES.filter((d) => d.cat === "small");
    }
  }
  if (!pool.length) pool = DARES.filter((d) => d.cat === "small");

  const scored = pool.map((d) => {
    let s = 0;
    if (ci.energy >= d.energy[0] && ci.energy <= d.energy[1]) s += 30;
    else s -= 8 * Math.min(Math.abs(ci.energy - d.energy[0]), Math.abs(ci.energy - d.energy[1]));
    if (d.states && d.states.includes(ci.state)) s += 15;
    if ((ci.state === "blocked" || ci.state === "tired") && ["small", "recovery", "walk", "forest", "focus"].includes(d.cat)) s += 12;
    if (ci.state === "stressed" && ["forest", "recovery", "pool", "walk"].includes(d.cat)) s += 12;
    if (ci.state === "active" && ["dumbbells", "fitboxing", "padel", "pool", "forest"].includes(d.cat)) s += 10;
    if (ci.energy >= 5) s += Math.max(0, 10 - Math.abs(ci.time - d.min) * 0.6);
    if (journey.bias.includes(d.cat)) s += 10; // the journey pulls its own way
    if (lastCats[0] === d.cat) s -= 18;
    if (lastCats[0] === d.cat && lastCats[1] === d.cat) s -= 40;
    s += (catFeedback[d.cat] || 0) * 6;
    s += Math.random() * 6;
    return { d, s };
  });
  scored.sort((a, b) => b.s - a.s);
  const dare = scored[0].d;
  return { dare, why: buildWhy(ci, dare) };
}

export function buildWhy(ci: Checkin, d: Dare): string {
  const e = ci.energy;
  const opener =
    e <= 3
      ? "Energy is low today — so the bar is on the floor."
      : e <= 6
        ? "Medium energy: you need movement, not pressure."
        : "You have fuel today — we're spending it well.";
  const catLine: Record<Cat, string> = {
    forest: "The pines do half the work.",
    walk: "Music first. Movement follows.",
    dumbbells: "Strength, without the gym ritual.",
    fitboxing: "Hit something. Legally.",
    pool: "Water resets the nervous system.",
    padel: "Play counts as training.",
    recovery: "Rest is part of the work.",
    focus: "Clarity is also energy.",
    small: "Something is better than nothing. Always.",
  };
  const stateLine =
    ci.state === "blocked"
      ? " Designed to be almost impossible to refuse."
      : ci.state === "stressed"
        ? " Chosen to lower the noise."
        : "";
  return opener + " " + catLine[d.cat] + stateLine;
}
