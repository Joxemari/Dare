import type { Cat, Dare, Effect, Level } from "../types";

/** Palette — mirror of the design tokens in index.css. */
export const C = {
  bg: "#111111",
  card: "#1C1C1C",
  card2: "#191917",
  text: "#F6F6F3",
  dim: "#8B8B85",
  faint: "#5A5A55",
  green: "#A8C46A",
  purple: "#B494F7",
  coral: "#FF6B6B",
  gold: "#FFC857",
  line: "#2A2A28",
} as const;

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
};

export const LEVELS: Record<Level, number> = { Easy: 1, Medium: 2, Strong: 3 };

/** Color por efecto esperado (feeling-based, no neuroquímica). */
export const EFFECT_COLOR: Record<Effect, string> = {
  Energy: C.green,
  Focus: C.gold,
  Mood: C.gold,
  Calm: C.purple,
  Strength: C.coral,
  Confidence: C.coral,
  Recovery: C.purple,
};

export const colorOf = (d: Dare): string => (d.wild ? C.gold : CATS[d.cat].color);
