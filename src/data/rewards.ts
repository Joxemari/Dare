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

/** Treats por rareza. Los golden NO son "double XP" — son treats reales.
    Pool amplio a propósito: la variedad mantiene viva la recompensa
    post-Dare (ver `rollTreat`, que además la SESGA cuando has completado
    con poca motivación o has probado algo nuevo). */
export const TREATS = {
  common: [
    "Fresh orange juice.",
    "One coffee, sitting down, phone face-down.",
    "A croissant from the good bakery.",
    "One episode of your series tonight, zero guilt.",
    "The next episode of your show — unlocked, guilt-free.",
    "Your favourite album, from track one, doing nothing else.",
    "Ten minutes in the sun. That's the whole treat.",
    "A matcha, slowly.",
    "Ten minutes of your guilty-pleasure scroll, timer on.",
    "The good chocolate — one square, actually tasted.",
    "A hot tea and a window.",
    "One chapter of the book you're avoiding.",
  ],
  rare: [
    "Ice cream today — in whatever weather this is.",
    "A long hot shower with no clock.",
    "A skincare ritual, unhurried.",
    "Thirty guilt-free minutes of absolutely anything.",
    "Read outside for fifteen minutes.",
    "Buy flowers.",
    "A bath, candle, the works.",
    "A whole podcast episode with your feet up.",
    "Order the fancy coffee, not the usual.",
    "An afternoon nap you don't apologise for.",
  ],
  golden: [
    { text: "Golden Treat — dinner tonight is whatever you want.", special: "golden" as const },
    { text: "Date credit — you've earned a self-date this week.", special: "date" as const },
    { text: "Dream Reward boost — you're closer than the counter says.", special: "dreamBoost" as const },
    { text: "Choose your own Treat. This card is the permission.", special: "choose" as const },
    { text: "Golden Treat — buy the thing you keep putting in the basket.", special: "golden" as const },
    { text: "A whole slow morning this weekend, no plans. You earned it.", special: "choose" as const },
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
  "🍵 Tea house afternoon",
  "🎧 Record shop crate-dig",
  "🏊 Swim then sauna",
  "🥐 New bakery across town",
  "🌅 Sunrise viewpoint",
  "🎾 A sport you've never tried",
];

export type { TreatDraw };
