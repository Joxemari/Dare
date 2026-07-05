import type { Cat } from "../types";

/* ============================================================
   MOVEMENT MODES — la capa de "tipo de movimiento" por encima de
   las categorías (`Cat`). DARE es physical-energy-first: cada Dare
   pertenece a un MODO, y la regla anti-aburrimiento del generador
   penaliza repetir el mismo MODO más de dos veces seguidas (más
   ancha que la penalización por `Cat`).

   Datos de dominio, SIN lógica. La lógica (anti-aburrimiento,
   recomendación) vive en `src/lib` (generator.ts, recommend.ts).
   ============================================================ */
export type MovementMode =
  | "Strong" // fuerza: mancuernas, kettlebells, carries
  | "Sweaty" // cardio divertido: fitboxing, tabata, dance cardio
  | "Outside" // aire libre: caminar, colinas, bosque, rutas
  | "Water" // piscina, reset acuático
  | "Recovery" // movilidad suave, respiración, apagado del día
  | "Soft" // mínimo de baja energía / claridad mental
  | "Play" // juego: padel, rallies — entrenar sin que lo parezca
  | "Social" // movimiento con otra persona / clase
  | "Travel"; // movimiento adaptado a estar fuera de casa

/** Metadatos por modo (copy premium, para la UI y la biblioteca). */
export const MODES: Record<MovementMode, { label: string; line: string }> = {
  Strong: { label: "Strong", line: "No gym. Just two weights." },
  Sweaty: { label: "Sweaty", line: "Boss playlist. Eight minutes." },
  Outside: { label: "Outside", line: "The outside changes you." },
  Water: { label: "Water", line: "Let water do half the work." },
  Recovery: { label: "Recovery", line: "Recovery is still training." },
  Soft: { label: "Soft", line: "Minimum still counts." },
  Play: { label: "Play", line: "This is play, not training." },
  Social: { label: "Social", line: "Movement is better with someone." },
  Travel: { label: "Travel", line: "Anywhere still counts." },
};

/** Categoría de Dare → Modo de movimiento. Fuente única de verdad. */
export const CAT_MODE: Record<Cat, MovementMode> = {
  dumbbells: "Strong",
  carry: "Strong",
  tabata: "Sweaty",
  fitboxing: "Sweaty",
  pool: "Water",
  padel: "Play",
  forest: "Outside",
  walk: "Outside",
  recovery: "Recovery",
  focus: "Soft",
  small: "Soft",
  // Categorías de anti-procrastinación / activación (check-in rápido de Today):
  // no son "movimiento" físico, así que caen en modos de baja fricción — Soft
  // por defecto, Recovery para el reset corporal/emocional y Social para lo que
  // toca a otras personas. Sirven a la regla anti-aburrimiento por MODO.
  admin: "Soft",
  communication: "Social",
  bodyreset: "Recovery",
  environment: "Soft",
  creative: "Soft",
  social: "Social",
  decision: "Soft",
  emotion: "Recovery",
  phone: "Soft",
  taskcontact: "Soft",
  close: "Soft",
};

/** Modo de una categoría (helper puro). */
export const modeOfCat = (c: Cat): MovementMode => CAT_MODE[c];
