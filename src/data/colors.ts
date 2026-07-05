import type { Cat, Dare, Effect, Level } from "../types";

/** Palette — mirror of the design tokens in index.css. */
export const C = {
  bg: "#111111",
  card: "#1C1C1C",
  card2: "#141412", // superficie recesiva (apoyo): más cerca del fondo → capas reales
  text: "#F6F6F3",
  dim: "#8B8B85",
  faint: "#5A5A55",
  green: "#A8C46A",
  purple: "#B494F7",
  coral: "#FF6B6B",
  gold: "#FFC857",
  line: "#2A2A28",
  // Acentos extra para dar a cada Journey su propio color (spec: cada
  // Journey un color diferente). No son tokens de Tailwind; se usan inline.
  teal: "#5FC9D6", // Steady Current — flujo
  moss: "#8FB84E", // Wild Ground — naturaleza (verde distinto del de First Flame)
  amber: "#E8894A", // Quiet Fire — brasa
  flare: "#FF5C8A", // Bright Pulse — rosa eléctrico (cardio, ritmo)
} as const;

/** Color por Journey (spec: cada Journey un color propio). */
export const JOURNEY_COLOR: Record<string, string> = {
  ember: C.green, // First Flame — verde (arranque)
  iron: C.coral, // Iron Quiet — rojo (fuerza)
  pulse: C.flare, // Bright Pulse — rosa eléctrico (cardio)
  water: C.purple, // Still Water — púrpura (calma)
  clear: C.gold, // Clear Signal — dorado (claridad)
  current: C.teal, // Steady Current — turquesa (corriente)
  wild: C.moss, // Wild Ground — verde musgo (fuera)
  fire: C.amber, // Quiet Fire — brasa (coraje)
};

export const CATS: Record<Cat, { color: string; label: string }> = {
  forest: { color: C.green, label: "Forest" },
  walk: { color: C.green, label: "Walk" },
  dumbbells: { color: C.coral, label: "Strength" },
  fitboxing: { color: C.coral, label: "Fitboxing" },
  pool: { color: C.purple, label: "Pool" },
  padel: { color: C.gold, label: "Padel" },
  tabata: { color: C.coral, label: "Tabata" },
  carry: { color: C.coral, label: "Carry" },
  recovery: { color: C.purple, label: "Recovery" },
  focus: { color: C.gold, label: "Focus" },
  small: { color: C.green, label: "Small Dare" },
  // anti-procrastinación / activación
  admin: { color: C.gold, label: "Admin" },
  communication: { color: C.teal, label: "Communication" },
  bodyreset: { color: C.green, label: "Body Reset" },
  environment: { color: C.teal, label: "Environment Reset" },
  creative: { color: C.purple, label: "Creative Start" },
  social: { color: C.coral, label: "Social Courage" },
  decision: { color: C.gold, label: "Decision Reduction" },
  emotion: { color: C.purple, label: "Emotional Reset" },
  phone: { color: C.coral, label: "Phone Boundary" },
  taskcontact: { color: C.gold, label: "Task Contact" },
  close: { color: C.green, label: "Completion Close" },
};

export const LEVELS: Record<Level, number> = { Easy: 1, Medium: 2, Strong: 3 };

/** Color por efecto esperado (feeling-based, no neuroquímica).
 *  Agrupados por familia: energía=verde, foco/ánimo=oro, calma/recuperación/
 *  sueño=púrpura, fuerza/confianza=coral, claridad/estrés=turquesa. */
export const EFFECT_COLOR: Record<Effect, string> = {
  Energy: C.green,
  Focus: C.gold,
  Mood: C.gold,
  Calm: C.purple,
  Strength: C.coral,
  Confidence: C.coral,
  Recovery: C.purple,
  Clarity: C.teal,
  Stress: C.teal,
  Sleep: C.purple,
  Momentum: C.green,
};

export const colorOf = (d: Dare): string => (d.wild ? C.gold : CATS[d.cat].color);
