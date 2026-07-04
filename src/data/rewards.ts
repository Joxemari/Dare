import type { Tier, TreatDraw } from "../types";
import { C } from "./colors";

/* ============================================================
   Sistema de recompensas — separadas a propósito (spec):
     Trigger    → antes del Dare (vive en cada Dare)
     Companion  → durante el Dare (vive en cada Dare)
     Treat      → después: recompensa corta e inmediata (Treat Draw)
     Date       → semanal, tipo Artist's Way (30 min – 3 h)
     Dream      → elegido antes del Journey, se abre al terminarlo
   ============================================================ */

/** Treats por rareza. Los golden NO son "double XP" — son treats reales. */
export const TREATS = {
  common: [
    "Fresh orange juice.",
    "One coffee, sitting down, phone face-down.",
    "A croissant from the good bakery.",
    "One episode of your series tonight, zero guilt.",
    "Your favourite album, from track one, doing nothing else.",
    "Ten minutes in the sun. That's the whole treat.",
    "A matcha, slowly.",
  ],
  rare: [
    "Ice cream today — in whatever weather this is.",
    "A long hot shower with no clock.",
    "A skincare ritual, unhurried.",
    "Thirty guilt-free minutes of absolutely anything.",
    "Read outside for fifteen minutes.",
    "Buy flowers.",
  ],
  golden: [
    { text: "Golden Treat — dinner tonight is whatever you want.", special: "golden" as const },
    { text: "Date credit — you've earned a self-date this week.", special: "date" as const },
    { text: "Dream Reward boost — you're closer than the counter says.", special: "dreamBoost" as const },
    { text: "Choose your own Treat. This card is the permission.", special: "choose" as const },
  ],
} as const;

export const TIER: Record<Tier, { color: string; label: string }> = {
  common: { color: C.green, label: "Treat" },
  rare: { color: C.purple, label: "Rare treat" },
  golden: { color: C.gold, label: "Golden treat" },
};

/** Ideas de Date (semanal / creativo). Emojis OK: son objetos reales. */
export const DATE_IDEAS = [
  "📚 Bookshop",
  "☕ Café morning",
  "🖼️ Museum",
  "🎨 Painting class",
  "🌲 Forest picnic",
  "💄 Sephora visit",
  "🌿 Botanical garden",
  "🎬 Cinema alone",
  "🏺 Ceramics workshop",
  "📷 Long walk with camera",
];

export type { TreatDraw };
