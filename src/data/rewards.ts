import type { Tier, Treat, TreatDraw } from "../types";
import { C } from "./colors";

/* ============================================================
   Sistema de recompensas — separadas a propósito (spec):
     Trigger    → antes del Dare (vive en cada Dare)
     Companion  → durante el Dare (vive en cada Dare)
     Treat      → después: recompensa corta e inmediata (Treat Draw)
     Date       → semanal, tipo Artist's Way (30 min – 3 h)
     Dream      → elegido antes del Journey, se abre al terminarlo

   Treats CONSCIENTES DEL CONTEXTO: cada treat puede llevar `fits`
   (categorías con las que encaja — se prima al elegir) y `avoid`
   (categorías tras las que NO debe salir: nada de "un café sentado"
   justo después de un paseo por el bosque, ni "ducha larga" recién
   salido de la piscina). Sin tags = neutro. La lógica de selección
   vive en `lib/random.ts` (pickTreat/rollTreat); aquí SOLO datos.
   ============================================================ */

/** Treats por rareza. Los golden NO son "double XP" — son treats reales. */
export const TREATS: Record<Tier, readonly Treat[]> = {
  common: [
    // Neutros — valen tras cualquier Dare.
    { text: "Fresh orange juice." },
    { text: "A croissant from the good bakery." },
    { text: "One episode of your series tonight, zero guilt." },
    { text: "Your favourite album, from track one, doing nothing else." },
    { text: "A square of the good chocolate, eaten slowly." },
    { text: "The good snack you've been saving." },
    // Cafetería / sol — chocan justo después de haber estado fuera.
    { text: "One coffee, sitting down, phone face-down.", avoid: ["forest", "walk"] },
    { text: "A matcha, slowly.", avoid: ["forest", "walk"] },
    { text: "Ten minutes in the sun. That's the whole treat.", avoid: ["forest", "walk"] },
    // Naturaleza — alargan el momento que acaba de pasar.
    { text: "Five more minutes out there — a bench, no phone, just air.", fits: ["forest", "walk"] },
    { text: "Bring one small thing home: a leaf, a stone, whatever asked to come.", fits: ["forest"] },
    { text: "Photograph one thing that made you look twice.", fits: ["forest", "walk"] },
    // Después del esfuerzo físico.
    { text: "A cold drink you actually like, in a real glass, sitting down.", fits: ["dumbbells", "fitboxing", "tabata", "carry", "padel"] },
    { text: "Ten minutes horizontal. You've earned the floor.", fits: ["dumbbells", "tabata", "carry"] },
    { text: "One loud song at full volume. Air instruments allowed.", fits: ["fitboxing", "tabata"] },
    // Suaves / cuidado.
    { text: "Warm socks, straight from the radiator.", fits: ["pool", "recovery"] },
    { text: "Wrap yourself in the softest thing you own for a while.", fits: ["recovery", "small"] },
    { text: "A slow stretch on the floor while the kettle does its thing.", fits: ["recovery", "small"] },
    // Mentales.
    { text: "Five minutes of staring out the window, professionally.", fits: ["focus"] },
    { text: "Close every tab. One song with your eyes shut.", fits: ["focus"] },
    { text: "A big glass of cold water and a proper sit-down.", fits: ["dumbbells", "tabata", "carry", "fitboxing"] },
    { text: "Open the window wide and breathe for a minute.", fits: ["recovery", "small"] },
    { text: "Tell one person the thing you just did. Say it out loud." },
  ],
  rare: [
    { text: "Ice cream today — in whatever weather this is." },
    { text: "A skincare ritual, unhurried." },
    { text: "Thirty guilt-free minutes of absolutely anything." },
    { text: "Read outside for fifteen minutes." },
    { text: "Buy flowers." },
    { text: "Order the dessert. Yes, that one." },
    { text: "The fancy fruit — the one you always put back." },
    { text: "New playlist, headphones, nowhere in particular to be.", fits: ["focus"] },
    { text: "A real nap, with a blanket and zero alarms.", fits: ["tabata", "carry", "recovery"] },
    // Agua caliente — redundante recién salido de la piscina.
    { text: "A long hot shower with no clock.", avoid: ["pool"] },
    { text: "A bath hot enough to require negotiation.", avoid: ["pool"], fits: ["dumbbells", "carry"] },
    { text: "Twenty minutes in a café with a book and no phone.", avoid: ["forest", "walk"] },
    { text: "The nice notebook and ten minutes to scribble nothing useful.", fits: ["focus"] },
    { text: "A long soak with the good salts.", avoid: ["pool"], fits: ["dumbbells", "carry", "recovery"] },
  ],
  golden: [
    { text: "Golden Treat — dinner tonight is whatever you want.", special: "golden" },
    { text: "Date credit — you've earned a self-date this week.", special: "date" },
    { text: "Dream Reward boost — you're closer than the counter says.", special: "dreamBoost" },
    { text: "Choose your own Treat. This card is the permission.", special: "choose" },
    { text: "Golden — breakfast for dinner. Full ceremony.", special: "golden" },
    { text: "Golden — the small thing that's been sitting in your cart. It's time.", special: "golden" },
    { text: "Golden — book the 'someday' thing today.", special: "golden" },
  ],
};

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
