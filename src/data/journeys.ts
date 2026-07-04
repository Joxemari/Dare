import type { Chapter, Journey, Mark, MarkType } from "../types";
import { C } from "./colors";

export const CH_SIZE = 8;

export const JOURNEYS: Journey[] = [
  {
    id: "ember",
    name: "The Ember",
    sym: "✦",
    color: C.green,
    tag: "Real energy, rebuilt daily.",
    bias: [],
    chapters: [
      { n: "I", name: "Wake Up", goal: "Start tiny." },
      { n: "II", name: "Build Momentum", goal: "Build rhythm. Learn to enjoy the process." },
      { n: "III", name: "Become Strong", goal: "Add iron, rounds and the court." },
      { n: "IV", name: "Identity", goal: "Become someone who moves daily." },
    ],
  },
  {
    id: "iron",
    name: "Iron Quiet",
    sym: "△",
    color: C.coral,
    tag: "Strength without noise.",
    bias: ["dumbbells", "fitboxing", "padel"],
    chapters: [
      { n: "I", name: "First Weight", goal: "Pick things up. Put them down." },
      { n: "II", name: "The Standing Hours", goal: "Strength becomes routine." },
      { n: "III", name: "Heavier, Calmer", goal: "Load up. Slow down." },
      { n: "IV", name: "Carry Anything", goal: "Strong is just who you are now." },
    ],
  },
  {
    id: "water",
    name: "Still Water",
    sym: "☾",
    color: C.purple,
    tag: "A quieter head, a looser body.",
    bias: ["recovery", "focus", "pool", "forest"],
    chapters: [
      { n: "I", name: "Unclench", goal: "Let the shoulders drop." },
      { n: "II", name: "The Slow Return", goal: "Come back to the body." },
      { n: "III", name: "Deep Water", goal: "Float. Breathe. Repeat." },
      { n: "IV", name: "Clear", goal: "Calm as a default." },
    ],
  },
];

export function chapterOf(
  j: Journey,
  n: number,
): Chapter & { idx: number; from: number; to: number } {
  const idx = Math.min(3, Math.floor(n / CH_SIZE));
  return {
    ...j.chapters[idx],
    idx,
    from: idx * CH_SIZE,
    to: idx === 3 ? Infinity : (idx + 1) * CH_SIZE,
  };
}

/* ------------- THE EMBER — marks per chapter -------------
   Fabulous-style typed events: Letter / Dare goal /
   One-time action / Motivator. A chapter closes when all
   its marks are achieved. Dare goals hook into the engine. */
export const EV_T: Record<MarkType, { label: string; ico: string }> = {
  letter: { label: "Letter", ico: "letter" },
  goal: { label: "Dare goal", ico: "goal" },
  action: { label: "One-time action", ico: "bolt" },
  motivator: { label: "Motivator", ico: "bulb" },
};

export const EMBER_MARKS: Mark[][] = [
  [
    // I — Wake Up
    { t: "letter", title: "You don't have a motivation problem", done: true },
    { t: "action", title: "Lay out tomorrow's shoes tonight", done: true },
    { t: "goal", title: "Complete your first 3 dares", done: true },
    { t: "goal", title: "Complete one 3-minute Small Dare", done: true },
    { t: "motivator", title: "The first minute is the whole battle", done: true },
  ],
  [
    // II — Build Momentum
    { t: "letter", title: "Rhythm beats intensity", done: true },
    { t: "goal", title: "Complete 5 dares in this chapter", done: true },
    { t: "goal", title: "Move in 3 different categories", done: true },
    { t: "action", title: "Build your reward shelf — name your podcast, series and album", done: false },
    { t: "motivator", title: "Why the pines work on your nervous system", done: false },
    { t: "goal", title: "Teach the generator: give energy feedback 3 times", done: false },
  ],
  [
    // III — Become Strong
    { t: "letter", title: "Strength is quiet", done: false },
    { t: "action", title: "Put the dumbbells where you can see them", done: false },
    { t: "goal", title: "Complete 2 strength dares", done: false },
    { t: "goal", title: "Complete one Strong-level dare", done: false },
    { t: "motivator", title: "Muscle is a battery, not a look", done: false },
    { t: "goal", title: "Complete a wildcard", done: false },
  ],
  [
    // IV — Identity
    { t: "letter", title: "Someone who moves daily", done: false },
    { t: "goal", title: "Hold a 7-day flexible streak", done: false },
    { t: "goal", title: "Have one double day", done: false },
    { t: "action", title: "Write one line: what changed?", done: false },
    { t: "motivator", title: "Identity is a vote count", done: false },
  ],
];

export const CH_ICO = ["spark", "sine", "dumbbell", "flame"];
