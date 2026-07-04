import type { Trait } from "../types";

/* ============================================================
   Traits — identidad, no "badges". Se conservan visualmente como
   círculos con glow, pero cada uno afirma una identidad.
   Los ids son estables (persistencia en store.traits).
   ============================================================ */
export const TRAITS: Trait[] = [
  { id: "starter", sym: "spark", name: "Starter", line: "Starts before feeling ready.", how: "Complete your first Dare" },
  { id: "minimalist", sym: "soft", name: "Minimalist", line: "Makes the action small enough to begin.", how: "Complete a 3-minute Small Dare" },
  { id: "unblocked", sym: "reset", name: "Unblocked", line: "Moves through resistance.", how: "Complete a Dare with energy ≤ 3" },
  { id: "explorer", sym: "forest", name: "Explorer", line: "Goes outside instead of staying stuck.", how: "Complete an outside Dare" },
  { id: "builder", sym: "strength", name: "Builder", line: "Uses strength to create energy.", how: "Complete Iron Quiet" },
  { id: "clearer", sym: "focus", name: "Clearer", line: "Uses movement to clear mental noise.", how: "Complete 3 focus or recovery Dares" },
  { id: "wildcard", sym: "wildcard", name: "Wild Card", line: "Accepts unexpected Dares.", how: "Complete a wildcard Dare" },
  { id: "momentum-keeper", sym: "momentum", name: "Momentum Keeper", line: "Restarts quickly.", how: "Come back after a missed day" },
  { id: "extra-spark", sym: "spark", name: "Extra Spark", line: "Completes more than one Dare in a day.", how: "Two Dares in one day" },
  { id: "water-reset", sym: "water", name: "Water Reset", line: "Uses water to reset body and mind.", how: "Complete a pool Dare" },
  { id: "strength-builder", sym: "strength", name: "Strength Builder", line: "Chooses strength without drama.", how: "Complete a strength Dare" },
  { id: "forest-mind", sym: "forest", name: "Forest Mind", line: "Uses nature as medicine.", how: "Complete 3 forest Dares" },
  { id: "morning-starter", sym: "sun", name: "Morning Starter", line: "Begins before the day takes over.", how: "Complete a Dare before noon" },
  { id: "night-mover", sym: "calm", name: "Night Mover", line: "Moves even late in the day.", how: "Complete a Dare after 9 pm" },
  { id: "self-investor", sym: "treat", name: "Self-Investor", line: "Makes time for herself.", how: "Schedule a Date" },
  { id: "courageous", sym: "strong", name: "Courageous", line: "Does the small hard thing.", how: "Complete a Strong-level Dare" },
  { id: "consistent", sym: "cycle", name: "Consistent", line: "Keeps promises without perfection.", how: "Reach a 7-day Momentum" },
  { id: "reset-artist", sym: "reset", name: "Reset Artist", line: "Can restart a messy day.", how: "Restart after a gap" },
  { id: "focus-keeper", sym: "focus", name: "Focus Keeper", line: "Protects attention.", how: "Complete 2 focus Dares" },
  { id: "body-listener", sym: "soft", name: "Body Listener", line: "Adapts instead of forcing.", how: "Use the 3-minute version on a low day" },
  { id: "calm-maker", sym: "calm", name: "Calm Maker", line: "Chooses calm over spiraling.", how: "Complete a recovery Dare while stressed" },
  { id: "door-opener", sym: "forest", name: "Door Opener", line: "Leaves the house when stuck.", how: "Complete an outside Dare while blocked" },
  { id: "rhythm-finder", sym: "rhythm", name: "Rhythm Finder", line: "Repeats what works.", how: "Repeat a category two days running" },
  { id: "proof-of-fire", sym: "dream", name: "Proof of Fire", line: "Completes The Ember.", how: "Complete The Ember" },
  { id: "quiet-power", sym: "strength", name: "Quiet Power", line: "Builds strength without noise.", how: "Complete a strength Dare in Iron Quiet" },
  { id: "proof-of-iron", sym: "dream", name: "Proof of Iron", line: "Completes Iron Quiet.", how: "Complete Iron Quiet" },
];

export function findTrait(id: string): Trait | undefined {
  return TRAITS.find((t) => t.id === id);
}
