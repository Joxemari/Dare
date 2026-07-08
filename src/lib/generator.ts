import { DARES } from "../data/dares";
import { WILDCARDS } from "../data/wildcards";
import { modeOfCat } from "../data/modes";
import { vibeBonus, vibeConfig } from "./companions";
import type { Avoid, Cat, Checkin, CurrentLoc, Dare, EnergyLevel, Journey, Loc, MentalState } from "../types";

/** Energía (1-10) DERIVADA del nivel de Energy elegido en el check-in (ya no
 *  se pregunta el estado mental: Energy es una pregunta directa). */
const ENERGY_LEVEL_TO_NUMBER: Record<EnergyLevel, number> = { tired: 2, calm: 4, normal: 6, high: 9 };
/** Nivel de Energy → `MentalState` equivalente, para reutilizar el scoring y
 *  las etiquetas `Dare.states` existentes (p. ej. "high" ≈ "active"). */
const ENERGY_LEVEL_TO_STATE: Record<EnergyLevel, MentalState> = { tired: "tired", calm: "calm", normal: "normal", high: "active" };

export function energyForLevel(level: EnergyLevel): number {
  return ENERGY_LEVEL_TO_NUMBER[level];
}

export function stateForLevel(level: EnergyLevel): MentalState {
  return ENERGY_LEVEL_TO_STATE[level];
}

/* --------------------- DARE GENERATOR ---------------------
   Scoring, no cadena de if/else. Optimiza la probabilidad de
   EMPEZAR, no el entrenamiento perfecto.

   Contexto (check-in): Time / Place / Energy. PLACE ES UN HARD FILTER (salvo
   "Take me somewhere"): un Dare nunca sale si no puede hacerse en el Place
   elegido — antes "outside" se usaba tanto para paseos urbanos como para
   bosque, y un check-in de City podía devolver un Dare de Forest. Ahora cada
   Loc es explícito y "forest"/"pool"/"gym"/"padel" son DESTINO puro (solo
   alcanzables vía "anywhere"). */

/** Place del check-in → localizaciones de Dare admisibles (HARD FILTER). */
export function placeToLocs(loc: CurrentLoc): Loc[] {
  switch (loc) {
    case "home":
      return ["home"];
    case "city":
      return ["city"];
    case "park":
      return ["park"];
    // En la cama / en casa a mínima fricción: misma loc que Home (`home`). La
    // intensidad la acota la pregunta de Energy, no el Place.
    case "bed":
      return ["home"];
    // Oficina: tareas de escritorio (loc `home`) o salir a la calle (`city`).
    case "office":
      return ["home", "city"];
    // Gimnasio: fuerza/cardio (loc `gym`).
    case "gym":
      return ["gym"];
    // Heredado: la UI ya no lo ofrece, pero un check-in guardado puede traerlo.
    case "travelling":
      return ["city"];
    // "Take me somewhere": DARE elige un DESTINO (no te quedas donde estás,
    // nunca "home").
    case "anywhere":
      return ["city", "park", "forest", "pool", "gym", "padel"];
  }
}

/** Localizaciones admisibles para el check-in (hard filter de Place). */
export function allowedLocs(ci: Checkin): Loc[] {
  return placeToLocs(ci.loc);
}

/** Bucket de Time del check-in: 5 / 10 / 20 / 30 (30 = "30+", sin techo). */
const TIME_LEVELS = [5, 10, 20, 30] as const;

function timeLevelIndex(time: number): number {
  const idx = TIME_LEVELS.indexOf(time as (typeof TIME_LEVELS)[number]);
  return idx === -1 ? 1 : idx;
}

/** Minutos máximos de Dare admisibles para un bucket de Time (con un poco de
 *  margen; 30 = "30+" queda abierto). */
function ceilingForLevel(idx: number): number {
  const t = TIME_LEVELS[Math.max(0, Math.min(TIME_LEVELS.length - 1, idx))];
  switch (t) {
    case 5:
      return 7;
    case 10:
      return 13;
    case 20:
      return 23;
    default:
      return 999;
  }
}

/**
 * IDs de Dares vistos recientemente, más reciente primero y sin duplicados.
 * `history` va en orden cronológico (lo más nuevo al final): `completed` y
 * `todaysDares` del store encajan tal cual. Alimenta la penalización por
 * repetición del generador — la magia del "reveal" depende de no repetir.
 */
export function recentDareIds(history: { dareId: string }[], n = 8): string[] {
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

/**
 * Qué categorías atacan cada tipo de evitación (check-in rápido de Today).
 * El Dare ofrecido ayuda a HACER CONTACTO con lo evitado, sin exigir terminarlo.
 */
const AVOID_CATS: Record<Avoid, Cat[]> = {
  admin: ["admin", "taskcontact", "close", "communication", "decision", "focus"],
  body: ["bodyreset", "walk", "recovery", "forest", "small"],
  people: ["social", "communication"],
  mind: ["focus", "emotion", "decision", "environment", "recovery"],
  none: [],
};

/** Categorías que ayudan cuando el foco está bajo (arranque de baja fricción). */
const LOW_FOCUS_CATS: Cat[] = ["focus", "decision", "environment", "emotion", "recovery", "small", "bodyreset"];
/** Categorías que aprovechan un foco alto (algo de más chicha cognitiva). */
const HIGH_FOCUS_CATS: Cat[] = ["creative", "admin", "taskcontact", "close", "dumbbells", "carry"];

/**
 * Encaje de DURACIÓN (input `time` del check-in). Premia que el Dare llene
 * ~el tiempo disponible y PENALIZA quedarse corto: un Dare de 2 min cuando hay
 * 30 no tiene sentido. El pool ya descarta los que se pasan (min <= time+2),
 * así que aquí el caso a corregir es el *undershoot*. Puro y testeable.
 *
 * `under` = minutos que el Dare deja sin usar (0 si encaja o se pasa un poco).
 * A 30 min: un Dare de 30 → +16, de 20 → ~+3, de 2 → tope −22.
 */
export function timeFitScore(time: number, min: number): number {
  const under = Math.max(0, time - min);
  return Math.max(-22, 16 - under * 1.3);
}

export function generateDare(
  ci: Checkin,
  lastCats: Cat[],
  catFeedback: Partial<Record<Cat, number>>,
  journey: Journey,
  recentIds: string[] = [],
  rejectedIds: string[] = [],
): { dare: Dare; why: string } {
  // PLACE es un hard filter SIEMPRE (salvo "anywhere", que ya admite destino).
  // Nunca se relaja, ni siquiera en el último recurso: por eso el fallback de
  // más abajo, al no encontrar nada, sigue filtrando por `inPlace`.
  const locs = allowedLocs(ci);
  const inPlace = (d: Dare) => d.locs.some((l) => locs.includes(l));
  const idx = timeLevelIndex(ci.time);
  const inEnergy = (d: Dare) => ci.energy >= d.energy[0] && ci.energy <= d.energy[1];

  // wildcard chance — la anticipación vive aquí. Los vibes que buscan
  // novedad ("Go somewhere different" / "Surprise me") suben la probabilidad.
  const wildChance = vibeConfig(ci.vibe)?.novelty ? 0.34 : 0.18;
  if (ci.time >= 10 && ci.energy >= 3 && Math.random() < wildChance) {
    // Un Dare rechazado ("Another dare") es una exclusión DURA: se quita del
    // pool de wildcards antes de comprobar si queda alguno, para no devolverlo
    // ni siquiera como último recurso (si es el único wildcard de la zona,
    // cae al scoring en vez de volver a ofrecerlo). "Reciente" sí es blando.
    const wpool = WILDCARDS.filter(
      (w) => w.min <= ceilingForLevel(idx) && inPlace(w) && inEnergy(w) && !rejectedIds.includes(w.id),
    );
    if (wpool.length) {
      // no repitas el último wildcard si hay alternativas frescas
      const fresh = wpool.filter((w) => !recentIds.includes(w.id));
      const from = fresh.length ? fresh : wpool;
      const dare = from[Math.floor(Math.random() * from.length)];
      return {
        dare,
        why: "Wildcard. The usual rules rest today — this one is for the part of you that gets bored.",
      };
    }
  }

  // Selección: 1. Place (hard, fijo) → 2. Time+Energy exactos → 3. si vacío,
  // relaja Time ±1 nivel (Place y Energy siguen fijos) → 4. si sigue vacío,
  // relaja Energy (Place sigue fijo) → 5. último recurso: cualquier Dare del
  // Place elegido. Place NUNCA se viola, en ningún escalón.
  // "small" (2-4 min) solo compite en el bucket de 5 min: en un hueco de 20/30
  // min ofrecer un Dare de 3 min no respeta el tiempo disponible, aunque
  // técnicamente "encaje" (min <= techo). Queda como comodín universal solo
  // en el último recurso (siempre respetando Place).
  const fitsTime = (d: Dare, timeIdx: number) => (d.cat !== "small" || timeIdx === 0) && d.min <= ceilingForLevel(timeIdx);
  const exact = (timeIdx: number) => DARES.filter((d) => inPlace(d) && inEnergy(d) && fitsTime(d, timeIdx));
  let pool: Dare[] = exact(idx);
  if (!pool.length) {
    for (const alt of [idx - 1, idx + 1]) {
      if (alt < 0 || alt >= TIME_LEVELS.length) continue;
      pool = exact(alt);
      if (pool.length) break;
    }
  }
  if (!pool.length) pool = DARES.filter((d) => inPlace(d) && fitsTime(d, idx));
  if (!pool.length) pool = DARES.filter((d) => inPlace(d) && d.cat !== "small");
  if (!pool.length) pool = DARES.filter((d) => inPlace(d));

  const strengthCats: Cat[] = ["dumbbells", "carry", "tabata", "fitboxing"];
  const scored = pool.map((d) => {
    let s = 0;
    if (inEnergy(d)) s += 30;
    else s -= 8 * Math.min(Math.abs(ci.energy - d.energy[0]), Math.abs(ci.energy - d.energy[1]));
    if (d.states && d.states.includes(ci.state)) s += 15;
    if ((ci.state === "blocked" || ci.state === "tired") && ["small", "recovery", "walk", "forest", "focus"].includes(d.cat)) s += 12;
    if (ci.state === "stressed" && ["forest", "recovery", "pool", "walk"].includes(d.cat)) s += 12;
    if (ci.state === "calm" && ["recovery", "focus", "emotion", "environment", "decision", "bodyreset"].includes(d.cat)) s += 12;
    if (ci.state === "active" && [...strengthCats, "padel", "pool", "forest"].includes(d.cat)) s += 10;
    // Coherencia de DURACIÓN: el Dare debe durar ~lo que el usuario tiene. Se
    // aplica siempre (no solo con energía alta), con peso decisivo: premia el
    // encaje y PENALIZA quedarse corto (un Dare de 2 min no gana un hueco de 30).
    s += timeFitScore(ci.time, d.min);
    if (journey.bias.includes(d.cat)) s += 10; // el Journey tira hacia lo suyo
    // ---- evitación (check-in rápido): empuja hacia lo que hace contacto ----
    if (ci.avoiding && ci.avoiding !== "none" && AVOID_CATS[ci.avoiding].includes(d.cat)) s += 22;
    // ---- foco (check-in rápido): baja fricción si el foco está bajo ----
    if (typeof ci.focus === "number") {
      if (ci.focus <= 4 && LOW_FOCUS_CATS.includes(d.cat)) s += 9;
      if (ci.focus >= 7 && HIGH_FOCUS_CATS.includes(d.cat)) s += 9;
    }
    if (lastCats[0] === d.cat) s -= 18;
    if (lastCats[0] === d.cat && lastCats[1] === d.cat) s -= 40;
    // Anti-aburrimiento por MODO (más ancho que la categoría): no repetir el
    // mismo modo de movimiento más de dos veces seguidas (spec). El modo del
    // Dare comparado con los de los dos últimos completados.
    const dMode = modeOfCat(d.cat);
    if (lastCats[0] && modeOfCat(lastCats[0]) === dMode) s -= 8;
    if (lastCats[0] && lastCats[1] && modeOfCat(lastCats[0]) === dMode && modeOfCat(lastCats[1]) === dMode) s -= 30;
    // penaliza repetir un Dare concreto reciente (graduado: más reciente, más penalización)
    const recentIdx = recentIds.indexOf(d.id);
    if (recentIdx >= 0) s -= Math.max(6, 26 - recentIdx * 5);
    // un Dare rechazado ("Another dare") no debe volver pronto: castigo
    // DECISIVO — mayor que cualquier combinación de bonus, para que solo gane
    // si es la única alternativa del pool.
    if (rejectedIds.includes(d.id)) s -= 500;
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

/**
 * Dare para un día de Journey SIN `dareId` prescrito (p. ej. días de
 * recuperación/foco abiertos). Se restringe DURO al Journey — nunca al pool
 * global —: primero a la categoría del día (`cat`), luego a las categorías del
 * Journey (`journey.bias`), y como último recurso a `small`. Así el Journey
 * SIEMPRE da un Dare del Journey, no un aleatorio ajeno. Evita rechazados
 * (exclusión dura) y, si puede, los vistos recientemente. Ligero scoring por
 * energía + desempate aleatorio, como `generateDare`.
 */
export function generateJourneyDayDare(
  cat: Cat,
  journey: Journey,
  ci: Checkin,
  recentIds: string[] = [],
  rejectedIds: string[] = [],
): Dare {
  const ok = (d: Dare) => !rejectedIds.includes(d.id);
  let pool = DARES.filter((d) => d.cat === cat && ok(d));
  if (!pool.length) pool = DARES.filter((d) => journey.bias.includes(d.cat) && ok(d));
  if (!pool.length) pool = DARES.filter((d) => d.cat === "small");
  // no repitas lo reciente si hay alternativas frescas dentro del Journey
  const fresh = pool.filter((d) => !recentIds.includes(d.id));
  const from = fresh.length ? fresh : pool;
  const scored = from.map((d) => {
    let s = 0;
    if (ci.energy >= d.energy[0] && ci.energy <= d.energy[1]) s += 20;
    else s -= 6 * Math.min(Math.abs(ci.energy - d.energy[0]), Math.abs(ci.energy - d.energy[1]));
    s += Math.random() * 6;
    return { d, s };
  });
  scored.sort((a, b) => b.s - a.s);
  return scored[0].d;
}

export function buildWhy(ci: Checkin, d: Dare): string {
  const e = ci.energy;
  const opener =
    ci.state === "calm"
      ? "Calm energy — this is about regulation, not intensity."
      : e <= 3
        ? "Energy is low today — so the bar is on the floor."
        : e <= 6
          ? "Medium energy: you need movement, not pressure."
          : "You have fuel today — we're spending it well.";
  const catLine: Partial<Record<Cat, string>> = {
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
    yoga: "Breath leads, the body follows.",
    taichi: "Slow movement, quiet mind.",
    qigong: "Shake the tension loose.",
    climbing: "Solve it with your body.",
    admin: "Contact, not completion. Just open it.",
    communication: "One honest message beats a perfect one unsent.",
    bodyreset: "A small reset changes your state fast.",
    environment: "Clear the space, clear the next step.",
    creative: "Start badly. Good comes later.",
    social: "One small move toward people, not away.",
    decision: "Fewer choices, more motion.",
    emotion: "Name it, breathe, let the noise drop.",
    phone: "Distance from the screen makes room for the real thing.",
    taskcontact: "Make contact with the task — you don't have to finish it.",
    close: "Close one loop instead of opening another.",
  };
  const stateLine =
    ci.state === "blocked"
      ? " Designed to be almost impossible to refuse."
      : ci.state === "stressed"
        ? " Chosen to lower the noise."
        : ci.state === "calm"
          ? " Nothing to push against, just something to settle into."
          : "";
  const line = catLine[d.cat] ?? "The smallest step still counts.";
  return opener + " " + line + stateLine;
}
