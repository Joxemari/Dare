import type { Dare, Tier, Treat } from "../../types";

/* PROPUESTAS GENERADAS (muestra para valoración) — Wildcards + Treats.
   NO editar a mano salvo revisión. Al aprobar: mover los Wildcards a
   wildcards.ts y los Treats a rewards.ts (bucket por `tier`), y borrar
   este fichero. Ver docs/content-pipeline.md. */

export const PROPOSED_WILDCARDS: Dare[] = [
  {
    id: "w-golden-hour",
    title: "Golden Hour",
    cat: "walk",
    wild: true,
    min: 20,
    level: "Easy",
    energy: [3, 8],
    locs: ["outside", "forest"],
    trigger: "Chase the last light.",
    companion: "The sky doing its thing.",
    proof: "Timed my day with the light.",
    effects: { Calm: 2, Mood: 2, Energy: 1 },
    scienceId: "daylight",
    steps: [
      "Head out about an hour before sunset",
      "Walk toward the most open sky you can reach",
      "Slow down as the colour changes",
      "Stay until the light goes",
    ],
  },
  {
    id: "w-barefoot-earth",
    title: "Barefoot",
    cat: "recovery",
    wild: true,
    min: 5,
    level: "Easy",
    energy: [1, 8],
    locs: ["outside", "forest"],
    states: ["stressed", "tired"],
    trigger: "Shoes off. Feet down.",
    companion: "Just the ground.",
    proof: "Let the ground hold me for a minute.",
    effects: { Calm: 2, Recovery: 1 },
    scienceId: "nature",
    steps: [
      "Find grass, sand or bare earth",
      "Shoes and socks off",
      "Stand still and feel the ground for a few minutes",
      "Notice the temperature and texture",
    ],
  },
  {
    id: "w-offline-hour",
    title: "Airplane Mode",
    cat: "focus",
    wild: true,
    min: 30,
    level: "Easy",
    energy: [2, 8],
    locs: ["home"],
    trigger: "One switch. Everything off.",
    companion: "One analog thing.",
    proof: "Took an hour off the grid.",
    effects: { Calm: 2, Focus: 2 },
    scienceId: "shutdown-ritual",
    steps: [
      "Phone to airplane mode, out of reach",
      "Pick one analog thing: a book, a pen, a walk",
      "Do only that for thirty minutes",
      "Come back when you're ready, not when it pings",
    ],
  },
];

export const PROPOSED_TREATS: Array<Treat & { tier: Tier }> = [
  { tier: "common", text: "A big glass of cold water and a proper sit-down.", fits: ["dumbbells", "tabata", "carry", "fitboxing"] },
  { tier: "common", text: "Open the window wide and breathe for a minute.", fits: ["recovery", "small"] },
  { tier: "common", text: "Tell one person the thing you just did. Say it out loud." },
  { tier: "rare", text: "The nice notebook and ten minutes to scribble nothing useful.", fits: ["focus"] },
  { tier: "rare", text: "A long soak with the good salts.", avoid: ["pool"], fits: ["dumbbells", "carry", "recovery"] },
  { tier: "golden", text: "Golden — book the 'someday' thing today.", special: "golden" },
];
