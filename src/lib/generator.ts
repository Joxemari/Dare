import { DARES } from "../data/dares";
import { WILDCARDS } from "../data/wildcards";
import { vibeBonus, vibeConfig } from "./companions";
import type { Cat, Checkin, CurrentLoc, Dare, Dest, Journey, Loc } from "../types";

/* --------------------- DARE GENERATOR ---------------------
   Scoring, no cadena de if/else. Optimiza la probabilidad de
   EMPEZAR, no el entrenamiento perfecto.

   Contexto (check-in): `loc` es dónde está el usuario ahora;
   `dest` es a dónde acepta que DARE le mande (o null = "Not now").
   - dest = null  → solo Dares compatibles con el contexto actual.
   - dest fijado  → puede generar un Dare que exige ir allí. */

/** Contexto actual → localizaciones de Dare admisibles. */
export function currentToDareLocs(loc: CurrentLoc): Loc[] {
  switch (loc) {
    case "home":
      return ["home"];
    case "city":
      return ["outside"];
    case "park":
      return ["outside", "forest"];
    case "office":
      return ["home", "outside"];
    case "travelling":
      return ["outside", "home"];
  }
}

/** Destino elegido → localización de Dare. */
export function destToDareLoc(dest: Dest): Loc {
  switch (dest) {
    case "forest":
      return "forest";
    case "pool":
      return "pool";
    case "gym":
      return "gym";
    case "padel":
      return "padel";
    case "cafe":
      return "outside";
  }
}

/** Localizaciones admisibles para el check-in. */
export function allowedLocs(ci: Checkin): Loc[] {
  return ci.dest ? [destToDareLoc(ci.dest)] : currentToDareLocs(ci.loc);
}

/**
 * IDs de Dares vistos recientemente, más reciente primero y sin duplicados.
 * `history` va en orden cronológico (lo más nuevo al final): `completed` y
 * `todaysDares` del store encajan tal cual. Alimenta la penalización por
 * repetición del generador — la magia del "reveal" depende de no repetir.
 */
export function recentDareIds(history: { dareId: string }[], n = 5): string[] {
  const ids: string[] = [];
  const seen = new Set<string>();
  for (let i = history.length - 1; i >= 0 && ids.length < n; i--) {
    const id = history[i].dareId;
    if (!seen.has(id)) {
      seen.add(id);
      ids.push(id);
    }
  }
  return ids;
}

export function generateDare(
  ci: Checkin,
  lastCats: Cat[],
  catFeedback: Partial<Record<Cat, number>>,
  journey: Journey,
  recentIds: string[] = [],
): { dare: Dare; why: string } {
  const locs = allowedLocs(ci);
  const at = (d: Dare) => d.locs.some((l) => locs.includes(l));

  // wildcard chance — la anticipación vive aquí. Los vibes que buscan
  // novedad ("Go somewhere different" / "Surprise me") suben la probabilidad.
  const wildChance = vibeConfig(ci.vibe)?.novelty ? 0.34 : 0.18;
  if (ci.time >= 10 && ci.energy >= 3 && Math.random() < wildChance) {
    const wpool = WILDCARDS.filter((w) => w.min <= ci.time + 2 && at(w));
    if (wpool.length) {
      // no repitas el último wildcard si hay alternativas
      const fresh = wpool.filter((w) => !recentIds.includes(w.id));
      const from = fresh.length ? fresh : wpool;
      const dare = from[Math.floor(Math.random() * from.length)];
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
    pool = DARES.filter((d) => d.cat !== "small" && d.min <= ci.time + 2 && at(d));
    if (ci.energy <= 3 || ci.state === "blocked" || ci.state === "tired") {
      const easy = pool.filter((d) => d.level === "Easy" && d.min <= 12);
      pool = easy.length ? easy : DARES.filter((d) => d.cat === "small");
    }
  }
  if (!pool.length) pool = DARES.filter((d) => d.cat === "small");

  const strengthCats: Cat[] = ["dumbbells", "carry", "tabata", "fitboxing"];
  const scored = pool.map((d) => {
    let s = 0;
    if (ci.energy >= d.energy[0] && ci.energy <= d.energy[1]) s += 30;
    else s -= 8 * Math.min(Math.abs(ci.energy - d.energy[0]), Math.abs(ci.energy - d.energy[1]));
    if (d.states && d.states.includes(ci.state)) s += 15;
    if ((ci.state === "blocked" || ci.state === "tired") && ["small", "recovery", "walk", "forest", "focus"].includes(d.cat)) s += 12;
    if (ci.state === "stressed" && ["forest", "recovery", "pool", "walk"].includes(d.cat)) s += 12;
    if (ci.state === "active" && [...strengthCats, "padel", "pool", "forest"].includes(d.cat)) s += 10;
    if (ci.energy >= 5) s += Math.max(0, 10 - Math.abs(ci.time - d.min) * 0.6);
    if (journey.bias.includes(d.cat)) s += 10; // el Journey tira hacia lo suyo
    // el destino elegido empuja hacia su tipo de Dare
    if (ci.dest === "pool" && d.cat === "pool") s += 20;
    if (ci.dest === "gym" && d.cat === "fitboxing") s += 20;
    if (ci.dest === "padel" && d.cat === "padel") s += 20;
    if (ci.dest === "forest" && d.cat === "forest") s += 20;
    if (lastCats[0] === d.cat) s -= 18;
    if (lastCats[0] === d.cat && lastCats[1] === d.cat) s -= 40;
    // penaliza repetir un Dare concreto reciente (graduado: más reciente, más penalización)
    const recentIdx = recentIds.indexOf(d.id);
    if (recentIdx >= 0) s -= Math.max(6, 26 - recentIdx * 5);
    s += (catFeedback[d.cat] || 0) * 6;
    // el vibe del check-in ("¿qué lo haría menos aburrido hoy?") empuja hacia
    // la familia de companion elegida (temptation bundling)
    s += vibeBonus(ci.vibe, d);
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
    fitboxing: "Turn stress into movement.",
    pool: "Water resets the nervous system.",
    padel: "Play counts as training.",
    tabata: "Short intensity, before your brain negotiates.",
    carry: "Pick things up. Carry them.",
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
