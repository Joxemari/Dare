/* ============================================================
   DARE — símbolos centrales (design tokens tipográficos).
   Fuente única de verdad para los glifos: cada Journey, cada
   sección del dare y cada Trait apunta aquí por su clave.
   Regla: NUNCA usar un símbolo suelto en la UI — siempre a
   través de este mapa, para que el vocabulario visual sea
   coherente (ver la sección "Símbolos" en CLAUDE.md).
   ============================================================ */
export const SYMBOLS = {
  spark: "✦", // Spark / Daily Dare / The Ember / start / proof
  strength: "△", // Strength / structure / ascent / Iron Quiet
  calm: "☾", // Calm / recovery / night / Still Water
  focus: "◇", // Focus / clarity / precision
  momentum: "⌁", // Momentum / current / energy flow
  dream: "◈", // Dream Reward / Journey completion / premium unlock
  treat: "✧", // Treat / Date / soft magic
  reset: "◎", // Reset / grounding / return to center
  forest: "↟", // Forest / exploration / outside
  forge: "⟁", // Forge / challenge / transformation
  sun: "☉", // Sunlight / morning / energy
  cycle: "○", // Cycle / continuity / restart
  shift: "◐", // Shift / transition
  water: "∿", // Water / pool / nervous system reset
  rhythm: "≈", // Rhythm / repeated movement
  strong: "◆", // Strong Dare / high effort
  soft: "◌", // Breath / softness / low-energy version
  wildcard: "⟡", // Wildcard / mystery / surprise
} as const;

export type SymbolKey = keyof typeof SYMBOLS;

/** Resuelve una clave a su glifo (con fallback al spark). */
export const sym = (k: SymbolKey): string => SYMBOLS[k] ?? SYMBOLS.spark;

/** Símbolo primario por Journey. */
export const JOURNEY_SYM: Record<string, SymbolKey> = {
  ember: "spark",
  iron: "strength",
  water: "calm",
};

/** Símbolos de las secciones del detalle de un Dare. */
export const SECTION_SYM = {
  why: "focus", // Why this Dare today
  trigger: "spark", // Trigger
  companion: "rhythm", // Companion
  effect: "momentum", // Expected Effect
  science: "reset", // Science Behind Today's Dare
  steps: "cycle", // Steps
  treat: "treat", // Treat Locked
  dream: "dream", // Dream Reward progress
  low: "soft", // No energy → 3-minute version
} as const;
