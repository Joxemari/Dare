import type { Trait } from "../types";

/* ============================================================
   BADGES — hitos con significado, no premios por cada acción.
   (En el store persisten bajo `traits` por compatibilidad; la UI
   los llama "Badges".) Se ganan raramente y cuestan de conseguir:
   la mayoría de Dares NO desbloquean ninguno. Los ids son estables
   (persistencia en store.traits). El array `TRAITS` conserva su
   nombre por los muchos consumidores; su contenido son Badges.
   ============================================================ */
export const TRAITS: Trait[] = [
  { id: "starter", sym: "spark", name: "Starter", line: "Starts before feeling ready.", how: "Complete your first Dare" },
  { id: "proof-of-fire", sym: "dream", name: "Proof of Fire", line: "Completed The Ember.", how: "Complete The Ember" },
  { id: "builder", sym: "strength", name: "Builder", line: "Uses strength to create energy.", how: "Complete Iron Quiet or 5 strength Dares" },
  { id: "water-reset", sym: "water", name: "Water Reset", line: "Uses water to reset body and mind.", how: "Complete 3 pool / water Dares" },
  { id: "momentum-keeper", sym: "momentum", name: "Momentum Keeper", line: "Keeps showing up.", how: "Complete Dares on 3 separate days" },
  { id: "rhythm-finder", sym: "rhythm", name: "Rhythm Finder", line: "Repeats what works.", how: "Complete the same helpful category 3 times" },
  { id: "courageous", sym: "strong", name: "Courageous", line: "Does the small hard thing.", how: "Complete a Strong-level Dare" },
  { id: "forest-mind", sym: "forest", name: "Forest Mind", line: "Uses nature as medicine.", how: "Complete 3 forest / outside Dares" },
  { id: "focus-keeper", sym: "focus", name: "Focus Keeper", line: "Protects attention.", how: "Complete 3 focus Dares" },
  { id: "reset-artist", sym: "reset", name: "Reset Artist", line: "Can restart a messy day.", how: "Use the low-energy version 3 times" },
  { id: "self-investor", sym: "treat", name: "Self-Investor", line: "Makes time for herself.", how: "Schedule or complete a Date" },
  { id: "quiet-power", sym: "strength", name: "Quiet Power", line: "Builds strength without noise.", how: "Complete Iron Quiet" },
  { id: "proof-of-iron", sym: "dream", name: "Proof of Iron", line: "Completed Iron Quiet.", how: "Complete all Iron Quiet milestones" },
];

export function findTrait(id: string): Trait | undefined {
  return TRAITS.find((t) => t.id === id);
}
