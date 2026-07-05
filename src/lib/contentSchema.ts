/* ============================================================
   contentSchema — validación de Dares generados/propuestos.
   Función PURA y determinista: no toca I/O ni datos vivos.
   Recibe el Dare y un contexto (ids existentes + scienceIds
   válidos) y devuelve una lista de errores (vacía = válido).

   Es la RED DE SEGURIDAD del pipeline de contenido generativo:
   - la usan los tests de integridad (`data.test.ts`) sobre el
     corpus vivo, y
   - el test de propuestas (`_proposed/proposed.test.ts`) sobre
     el contenido que propone la generación semanal.
   Si algo generado no cumple estas reglas, `npm test` (la CI)
   se pone en rojo y la PR no se puede mergear en verde.
   ============================================================ */
import type { Cat, Dare, Effect, Level, Loc, MentalState } from "../types";

/* Conjuntos válidos en runtime. ESPEJO de las uniones de `types.ts`;
   si cambia una unión hay que actualizar aquí (y el test lo delata,
   porque el corpus vivo dejaría de validar). */
export const CATS_VALID: readonly Cat[] = [
  "forest", "walk", "dumbbells", "fitboxing", "pool",
  "padel", "tabata", "carry", "recovery", "focus", "small",
  "admin", "communication", "bodyreset", "environment", "creative",
  "social", "decision", "emotion", "phone", "taskcontact", "close",
];
export const LOCS_VALID: readonly Loc[] = ["home", "outside", "forest", "pool", "gym", "padel"];
export const LEVELS_VALID: readonly Level[] = ["Easy", "Medium", "Strong"];
export const EFFECTS_VALID: readonly Effect[] = [
  "Energy", "Focus", "Mood", "Calm", "Strength", "Confidence", "Recovery",
  "Clarity", "Stress", "Sleep", "Momentum",
];
export const STATES_VALID: readonly MentalState[] = ["blocked", "tired", "normal", "active", "stressed"];

/* Regla dura del producto: nunca trabajo de suelo con manos apoyadas. */
export const BANNED_EXERCISES = ["push-up", "push up", "plank", "burpee", "mountain climber"];
/* Vocabulario prohibido del producto (gamificación clásica / fitness tracker).
   Ver CLAUDE.md: nada de XP, niveles, "streak failed", calorías ni "burn". */
export const BANNED_VOCAB = ["xp", "level up", "streak failed", "calorie", "calories", "burn"];

/** id: minúsculas, una sola palabra por guiones, sin espacios (como los existentes). */
const ID_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export interface ValidateCtx {
  /** ids ya usados (corpus vivo + otras propuestas del lote). */
  existingIds: Iterable<string>;
  /** scienceIds válidos de la biblioteca (`SCIENCE`). */
  scienceIds: Iterable<string>;
}

/**
 * Valida un Dare (existente o propuesto). Devuelve errores legibles.
 * Vacío ⇒ el Dare cumple todas las reglas duras del dominio.
 */
export function validateDare(d: unknown, ctx: ValidateCtx): string[] {
  const errs: string[] = [];
  const ok = (cond: unknown, msg: string) => { if (!cond) errs.push(msg); };

  if (typeof d !== "object" || d === null) return ["no es un objeto"];
  const x = d as Partial<Dare>;

  // ---- campos obligatorios ----
  ok(typeof x.id === "string" && x.id.length > 0, "falta id");
  ok(typeof x.title === "string" && x.title.trim().length > 0, "falta title");
  ok(typeof x.companion === "string" && x.companion.trim().length > 0, "falta companion");
  ok(typeof x.trigger === "string" && x.trigger.trim().length > 0, "falta trigger");
  ok(typeof x.proof === "string" && x.proof.trim().length > 0, "falta proof");

  // ---- id: formato + unicidad (aditivo, nunca pisar uno existente) ----
  if (typeof x.id === "string") {
    ok(ID_RE.test(x.id), `id "${x.id}" no es kebab-case en minúsculas`);
    const existing = new Set(ctx.existingIds);
    ok(!existing.has(x.id), `id "${x.id}" ya existe (la generación debe ser aditiva)`);
  }

  // ---- enums ----
  ok(typeof x.cat === "string" && (CATS_VALID as readonly string[]).includes(x.cat), `cat inválida: ${x.cat}`);
  ok(typeof x.level === "string" && (LEVELS_VALID as readonly string[]).includes(x.level), `level inválido: ${x.level}`);

  // ---- min ----
  ok(typeof x.min === "number" && Number.isFinite(x.min) && x.min > 0 && x.min <= 90, `min fuera de rango: ${x.min}`);

  // ---- energy [lo, hi] en 1..10, lo <= hi ----
  if (!Array.isArray(x.energy) || x.energy.length !== 2) {
    errs.push("energy debe ser [lo, hi]");
  } else {
    const [lo, hi] = x.energy;
    ok(Number.isInteger(lo) && lo >= 1 && lo <= 10, `energy[0] fuera de 1..10: ${lo}`);
    ok(Number.isInteger(hi) && hi >= 1 && hi <= 10, `energy[1] fuera de 1..10: ${hi}`);
    ok(typeof lo === "number" && typeof hi === "number" && lo <= hi, `energy invertido: [${lo}, ${hi}]`);
  }

  // ---- locs ----
  if (!Array.isArray(x.locs) || x.locs.length === 0) {
    errs.push("locs vacío");
  } else {
    for (const l of x.locs) ok((LOCS_VALID as readonly string[]).includes(l), `loc inválida: ${l}`);
  }

  // ---- effects: al menos uno; claves válidas; intensidad 1..3 ----
  if (typeof x.effects !== "object" || x.effects === null || Object.keys(x.effects).length === 0) {
    errs.push("effects vacío");
  } else {
    for (const [k, v] of Object.entries(x.effects)) {
      ok((EFFECTS_VALID as readonly string[]).includes(k), `effect inválido: ${k}`);
      ok(v === 1 || v === 2 || v === 3, `intensidad de ${k} debe ser 1..3, es ${v}`);
    }
  }

  // ---- steps ----
  if (!Array.isArray(x.steps) || x.steps.length === 0) {
    errs.push("steps vacío");
  } else {
    for (const s of x.steps) ok(typeof s === "string" && s.trim().length > 0, "step vacío");
  }

  // ---- states (opcional) ----
  if (x.states !== undefined) {
    if (!Array.isArray(x.states)) errs.push("states debe ser array");
    else for (const s of x.states) ok((STATES_VALID as readonly string[]).includes(s), `state inválido: ${s}`);
  }

  // ---- scienceId (opcional pero, si está, debe existir) ----
  if (x.scienceId !== undefined) {
    const sci = new Set(ctx.scienceIds);
    ok(sci.has(x.scienceId), `scienceId "${x.scienceId}" no existe en la biblioteca`);
  }

  // ---- lenguaje prohibido ----
  const haystack = [x.title, x.trigger, x.companion, x.proof, ...(Array.isArray(x.steps) ? x.steps : [])]
    .join(" ")
    .toLowerCase();
  // Ejercicios: subcadena (frases distintivas, p. ej. "push up").
  for (const b of BANNED_EXERCISES) ok(!haystack.includes(b), `menciona ejercicio prohibido "${b}"`);
  // Vocabulario: por palabra completa, para no cazar "xp" dentro de "unexpected"
  // ni "burn" dentro de nombres propios.
  for (const b of BANNED_VOCAB) {
    const re = new RegExp(`\\b${b.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`);
    ok(!re.test(haystack), `usa vocabulario prohibido "${b}"`);
  }

  return errs;
}
