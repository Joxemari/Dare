import React, { useState, useEffect, useRef } from "react";

/* ============================================================
   DARE — Daily Actions. Real Energy.  ·  prototype v2
   In-memory state (production persists to localStorage).
   New in v2: Journeys→Chapters, tarot draw, wildcards,
   reward draws, multi-dare days, Just dare me, re-entry.
   ============================================================ */

const C = {
  bg: "#111111", card: "#1C1C1C", card2: "#191917",
  text: "#F6F6F3", dim: "#8B8B85", faint: "#5A5A55",
  green: "#A8C46A", purple: "#B494F7", coral: "#FF6B6B", gold: "#FFC857",
  line: "#2A2A28",
};

const CATS = {
  forest:    { color: C.green,  label: "Forest" },
  walk:      { color: C.green,  label: "Walk" },
  dumbbells: { color: C.coral,  label: "Dumbbells" },
  fitboxing: { color: C.coral,  label: "Fitboxing" },
  pool:      { color: C.purple, label: "Pool" },
  padel:     { color: C.gold,   label: "Padel" },
  recovery:  { color: C.purple, label: "Recovery" },
  focus:     { color: C.gold,   label: "Focus" },
  small:     { color: C.green,  label: "Small Dare" },
};

const LEVELS = { Easy: 1, Medium: 2, Strong: 3 };
const colorOf = (d) => (d.wild ? C.gold : CATS[d.cat].color);

/* ------------------------- DARES ------------------------- */
const DARES = [
  // SMALL (3 min)
  { id: "out-the-door", title: "Out the Door", cat: "small", min: 3, xp: 10, level: "Easy", energy: [1, 10], locs: ["home", "outside", "forest"], reward: "Fresh air",
    steps: ["Put on shoes", "Step outside", "Walk for 3 minutes", "Come back if you want"] },
  { id: "one-song", title: "One Song Standing", cat: "small", min: 3, xp: 10, level: "Easy", energy: [1, 10], locs: ["home"], reward: "One great song",
    steps: ["Play one song you love", "Stand up", "Move, sway or shadowbox until it ends", "That was it"] },
  { id: "water-window", title: "Water & Window", cat: "small", min: 3, xp: 10, level: "Easy", energy: [1, 10], locs: ["home"], reward: "A clear head",
    steps: ["Drink a glass of water", "Open a window", "20 slow bodyweight squats", "Done"] },

  // FOREST
  { id: "operation-forest", title: "Operation Forest", cat: "forest", min: 18, xp: 35, level: "Easy", energy: [4, 7], locs: ["forest", "outside"], reward: "Your current podcast",
    steps: ["Put on shoes", "Start your favorite podcast", "Walk to the pines", "Every time a segment ends: 10 squats", "Walk back and mark complete"] },
  { id: "pine-reset", title: "Pine Reset", cat: "forest", min: 12, xp: 25, level: "Easy", energy: [1, 5], locs: ["forest", "outside"], reward: "Silence", states: ["stressed", "tired", "blocked"],
    steps: ["Leave the phone in your pocket", "Walk slowly into the pines", "Breathe in 4, out 6", "Notice three sounds", "Turn back whenever you want"] },
  { id: "forest-intervals", title: "Forest Intervals", cat: "forest", min: 25, xp: 50, level: "Strong", energy: [7, 10], locs: ["forest", "outside"], reward: "Your loudest playlist",
    steps: ["Warm up: 5 min easy walk", "Brisk pace to the pines", "5 × 30-second hill strides, walk back down", "Easy walk home"] },
  { id: "dawn-pines", title: "Dawn Pines", cat: "forest", min: 20, xp: 40, level: "Medium", energy: [4, 8], locs: ["forest", "outside"], reward: "Coffee after",
    steps: ["Shoes on before you think about it", "Walk to the forest at an easy pace", "One loop among the trees", "Coffee is waiting when you're back"] },

  // WALK
  { id: "podcast-mile", title: "Podcast Mile", cat: "walk", min: 20, xp: 35, level: "Easy", energy: [3, 7], locs: ["outside", "forest"], reward: "Your current podcast",
    steps: ["Pick one episode", "Press play only once you're walking", "Walk until the segment ends", "Head home"] },
  { id: "album-side-a", title: "Album Side A", cat: "walk", min: 25, xp: 40, level: "Medium", energy: [4, 8], locs: ["outside", "forest"], reward: "The full album, walking",
    steps: ["Choose an album, start at track one", "Walk the whole side A", "No skipping songs", "Turn around at the halfway track"] },
  { id: "errand-run", title: "The Real Errand", cat: "walk", min: 10, xp: 20, level: "Easy", energy: [2, 7], locs: ["outside"], reward: "One thing off your list",
    steps: ["Pick one real errand within walking distance", "Walk there — no car", "Do the thing", "Walk back. Two wins."] },
  { id: "night-walk", title: "Night Walk", cat: "walk", min: 15, xp: 30, level: "Easy", energy: [2, 6], locs: ["outside"], reward: "Quiet streets", states: ["stressed", "tired"],
    steps: ["Coat on, headphones optional", "Walk around the block, slow", "Let the day settle", "Come home lighter"] },

  // DUMBBELLS (standing / seated — never hands on the floor)
  { id: "netflix-iron", title: "Netflix & Iron", cat: "dumbbells", min: 20, xp: 45, level: "Medium", energy: [5, 9], locs: ["home"], reward: "Next episode of your series",
    steps: ["Press play on your show", "Every 5 minutes: 10 goblet squats", "Then 10 curls, 10 shoulder presses", "Repeat until the episode ends", "You trained. It barely noticed."] },
  { id: "standing-five", title: "The Standing Five", cat: "dumbbells", min: 12, xp: 30, level: "Medium", energy: [4, 8], locs: ["home"], reward: "Your loudest playlist",
    steps: ["Two rounds of five moves, 10 reps each:", "Goblet squat", "Curl", "Shoulder press", "Bent-over row", "30-second farmer hold"] },
  { id: "heavy-carry", title: "Heavy Carry", cat: "dumbbells", min: 8, xp: 20, level: "Easy", energy: [3, 7], locs: ["home"], reward: "Done in 8 minutes",
    steps: ["Grab both dumbbells", "Walk laps around the house or up the stairs", "Rest when grip fails", "Repeat until the timer ends"] },
  { id: "coffee-lifts", title: "Coffee Lifts", cat: "dumbbells", min: 10, xp: 25, level: "Easy", energy: [3, 7], locs: ["home"], reward: "Coffee after",
    steps: ["Start the coffee", "While it brews: squats, curls, presses", "3 easy sets, nothing heroic", "Drink the coffee you earned"] },

  // FITBOXING
  { id: "round-one", title: "Round One", cat: "fitboxing", min: 30, xp: 60, level: "Strong", energy: [7, 10], locs: ["gym"], reward: "The best shower of the week",
    steps: ["The gym is downstairs. That's the whole trick.", "Wrap up, glove up", "Take the class — just follow along", "Hit the bag like it owes you money"] },
  { id: "shadow-rounds", title: "Shadow Rounds", cat: "fitboxing", min: 10, xp: 25, level: "Medium", energy: [5, 8], locs: ["home"], reward: "Loud music",
    steps: ["Music up", "3 rounds × 2 minutes of shadowboxing", "1 minute rest between rounds", "Light feet, loose shoulders"] },

  // POOL
  { id: "twenty-lengths", title: "Twenty Lengths", cat: "pool", min: 30, xp: 55, level: "Strong", energy: [6, 10], locs: ["pool"], reward: "Pool time",
    steps: ["Pack the bag before you can argue", "Swim 20 lengths, any style, any pace", "Rest at the wall whenever", "Float for the last two minutes"] },
  { id: "water-reset", title: "Water Reset", cat: "pool", min: 20, xp: 35, level: "Easy", energy: [3, 6], locs: ["pool"], reward: "Weightlessness", states: ["stressed", "tired"],
    steps: ["Easy swim, no counting", "Slow breaststroke, long exhales", "Finish floating on your back", "Water does the rest"] },

  // PADEL
  { id: "book-the-court", title: "Book the Court", cat: "padel", min: 30, xp: 60, level: "Strong", energy: [7, 10], locs: ["padel"], reward: "It's a game, not a workout",
    steps: ["Text a friend now — before the dare cools down", "Book the court", "Play. Just play.", "Winner buys nothing. It's not about that."] },
  { id: "wall-rally", title: "Wall Rally", cat: "padel", min: 15, xp: 30, level: "Medium", energy: [5, 8], locs: ["padel", "outside"], reward: "Your loudest playlist",
    steps: ["Racket and one ball", "Rally against the wall", "Count your longest streak", "Beat it once, then stop"] },

  // RECOVERY (no hand-supported positions)
  { id: "floor-breath", title: "Floor & Breath", cat: "recovery", min: 10, xp: 20, level: "Easy", energy: [1, 4], locs: ["home"], reward: "Stillness", states: ["blocked", "tired", "stressed"],
    steps: ["Lie on the mat, knees bent", "Box breathing: 4 in, 4 hold, 4 out, 4 hold", "Gentle knee-to-chest, one side at a time", "Legs up the wall for 3 minutes"] },
  { id: "shoulders-undone", title: "Shoulders, Undone", cat: "recovery", min: 8, xp: 15, level: "Easy", energy: [1, 5], locs: ["home", "outside"], reward: "Less noise in the body",
    steps: ["Stand tall", "Slow neck circles, both ways", "Shoulder rolls, big and slow", "Reach up, then let everything drop. Twice."] },
  { id: "hot-cold", title: "Hot / Cold Finish", cat: "recovery", min: 5, xp: 15, level: "Easy", energy: [1, 8], locs: ["home"], reward: "Instant reboot",
    steps: ["Normal shower", "Last 30 seconds: as cold as you can stand", "Breathe through it", "Step out new"] },

  // FOCUS
  { id: "the-unblock", title: "The Unblock", cat: "focus", min: 10, xp: 20, level: "Easy", energy: [1, 6], locs: ["home", "outside"], reward: "Free time after", states: ["blocked", "stressed"],
    steps: ["Walk outside for 3 minutes — no phone", "Come back", "Write the single next tiny step of the stuck thing", "Do only that step"] },
  { id: "sunlight-first", title: "Sunlight First", cat: "focus", min: 5, xp: 15, level: "Easy", energy: [1, 7], locs: ["outside", "home"], reward: "A real morning",
    steps: ["Go outside within an hour of waking", "Face the light, eyes soft", "Two minutes, no phone", "Now the day can start"] },
  { id: "clear-desk", title: "Clear Desk, Clear Mind", cat: "focus", min: 10, xp: 20, level: "Easy", energy: [2, 6], locs: ["home"], reward: "One playlist", states: ["blocked"],
    steps: ["One playlist, press play", "Clear the desk until it ends", "Everything has a place or the bin", "Sit down at a clean surface"] },
];

/* ----------------------- WILDCARDS ----------------------- */
const WILDCARDS = [
  { id: "w-sunset-swim", title: "Sunset Swim", cat: "pool", wild: true, min: 25, xp: 50, level: "Medium", energy: [4, 9], locs: ["pool"], reward: "The light itself",
    steps: ["Time it with the sunset", "Swim easy while the light drops", "Stop counting anything", "Leave when the sky says so"] },
  { id: "w-unturned", title: "The Unturned Street", cat: "walk", wild: true, min: 15, xp: 35, level: "Medium", energy: [3, 8], locs: ["outside"], reward: "Somewhere new",
    steps: ["Walk your usual route", "At the first street you've never turned into — turn", "Follow it until it surprises you", "Find your way back"] },
  { id: "w-night-pines", title: "Night Pines", cat: "forest", wild: true, min: 15, xp: 40, level: "Medium", energy: [3, 8], locs: ["forest", "outside"], reward: "One album, in the dark",
    steps: ["Go at dusk", "One album, no phone light", "Walk into the pines and stand still for one song", "Come back slowly"] },
  { id: "w-cold-dawn", title: "Cold Dawn", cat: "recovery", wild: true, min: 5, xp: 25, level: "Medium", energy: [2, 8], locs: ["home"], reward: "Being awake before the world",
    steps: ["Catch the first light from the window or the street", "Then: shower, last 30 seconds cold", "Breathe through it", "The day starts owing you one"] },
  { id: "w-rain-shine", title: "Rain or Shine", cat: "walk", wild: true, min: 10, xp: 30, level: "Medium", energy: [3, 8], locs: ["outside"], reward: "Weather, unfiltered",
    steps: ["Check nothing. Go out exactly as the sky is", "Walk 10 minutes in whatever weather this is", "Let it be part of the dare", "Come back with a story"] },
];

/* ------------------------ JOURNEYS ------------------------ */
const CH_SIZE = 8;
const JOURNEYS = [
  { id: "ember", name: "The Ember", sym: "✦", color: C.green, tag: "Real energy, rebuilt daily.", bias: [],
    chapters: [
      { n: "I", name: "Wake Up", goal: "Start tiny." },
      { n: "II", name: "Build Momentum", goal: "Build rhythm. Learn to enjoy the process." },
      { n: "III", name: "Become Strong", goal: "Add iron, rounds and the court." },
      { n: "IV", name: "Identity", goal: "Become someone who moves daily." },
    ] },
  { id: "iron", name: "Iron Quiet", sym: "△", color: C.coral, tag: "Strength without noise.", bias: ["dumbbells", "fitboxing", "padel"],
    chapters: [
      { n: "I", name: "First Weight", goal: "Pick things up. Put them down." },
      { n: "II", name: "The Standing Hours", goal: "Strength becomes routine." },
      { n: "III", name: "Heavier, Calmer", goal: "Load up. Slow down." },
      { n: "IV", name: "Carry Anything", goal: "Strong is just who you are now." },
    ] },
  { id: "water", name: "Still Water", sym: "☾", color: C.purple, tag: "A quieter head, a looser body.", bias: ["recovery", "focus", "pool", "forest"],
    chapters: [
      { n: "I", name: "Unclench", goal: "Let the shoulders drop." },
      { n: "II", name: "The Slow Return", goal: "Come back to the body." },
      { n: "III", name: "Deep Water", goal: "Float. Breathe. Repeat." },
      { n: "IV", name: "Clear", goal: "Calm as a default." },
    ] },
];
function chapterOf(j, n) {
  const idx = Math.min(3, Math.floor(n / CH_SIZE));
  return { ...j.chapters[idx], idx, from: idx * CH_SIZE, to: idx === 3 ? Infinity : (idx + 1) * CH_SIZE };
}

/* ------------- THE EMBER — marks per chapter -------------
   Fabulous-style typed events: Letter / Dare goal /
   One-time action / Motivator. A chapter closes when all
   its marks are achieved. Dare goals hook into the engine. */
const EV_T = {
  letter: { label: "Letter", ico: "letter" },
  goal: { label: "Dare goal", ico: "goal" },
  action: { label: "One-time action", ico: "bolt" },
  motivator: { label: "Motivator", ico: "bulb" },
};
const EMBER_MARKS = [
  [ // I — Wake Up
    { t: "letter", title: "You don't have a motivation problem", done: true },
    { t: "action", title: "Lay out tomorrow's shoes tonight", done: true },
    { t: "goal", title: "Complete your first 3 dares", done: true },
    { t: "goal", title: "Complete one 3-minute Small Dare", done: true },
    { t: "motivator", title: "The first minute is the whole battle", done: true },
  ],
  [ // II — Build Momentum
    { t: "letter", title: "Rhythm beats intensity", done: true },
    { t: "goal", title: "Complete 5 dares in this chapter", done: true },
    { t: "goal", title: "Move in 3 different categories", done: true },
    { t: "action", title: "Build your reward shelf — name your podcast, series and album", done: false },
    { t: "motivator", title: "Why the pines work on your nervous system", done: false },
    { t: "goal", title: "Teach the generator: give energy feedback 3 times", done: false },
  ],
  [ // III — Become Strong
    { t: "letter", title: "Strength is quiet", done: false },
    { t: "action", title: "Put the dumbbells where you can see them", done: false },
    { t: "goal", title: "Complete 2 strength dares", done: false },
    { t: "goal", title: "Complete one Strong-level dare", done: false },
    { t: "motivator", title: "Muscle is a battery, not a look", done: false },
    { t: "goal", title: "Complete a wildcard", done: false },
  ],
  [ // IV — Identity
    { t: "letter", title: "Someone who moves daily", done: false },
    { t: "goal", title: "Hold a 7-day flexible streak", done: false },
    { t: "goal", title: "Have one double day", done: false },
    { t: "action", title: "Write one line: what changed?", done: false },
    { t: "motivator", title: "Identity is a vote count", done: false },
  ],
];
const CH_ICO = ["spark", "sine", "dumbbell", "flame"];

/* ------------------------- TAROT --------------------------
   Major Arcana only. Voice: Co-Star — blunt, dry, applicable. */
const TAROT = [
  { id: "fool", num: "0", name: "The Fool", msg: "You don't need a plan to take a first step. Overpreparing is a form of hiding. Start before you feel ready — readiness is a byproduct, not a prerequisite." },
  { id: "magician", num: "I", name: "The Magician", msg: "Everything you need is already within reach: shoes, water, twenty minutes. The gap between wanting and doing is one gesture. Make it." },
  { id: "chariot", num: "VII", name: "The Chariot", msg: "Direction beats intensity. Pick one thing and drag it across the line, even slowly. Momentum is steering, not speed." },
  { id: "strength", num: "VIII", name: "Strength", msg: "Force is loud; strength is quiet. Do the hard thing gently, without drama, without an audience. That is what endurance actually looks like." },
  { id: "hermit", num: "IX", name: "The Hermit", msg: "Solitude is not withdrawal — it's maintenance. Take the walk alone. What you're looking for tends to appear when nobody is watching." },
  { id: "wheel", num: "X", name: "Wheel of Fortune", msg: "You don't control the day you were dealt. You control the next thirty minutes. Spend them like they're the only ones that count — statistically, they are." },
  { id: "hanged", num: "XII", name: "The Hanged Man", msg: "Stuck is a perspective problem, not a capability problem. Stop pushing the same door. Invert one small thing and watch the problem change shape." },
  { id: "death", num: "XIII", name: "Death", msg: "Endings are logistics, not tragedies. Drop one habit, excuse or plan that expired weeks ago. Whatever you keep alive artificially is billing you in energy." },
  { id: "temperance", num: "XIV", name: "Temperance", msg: "Today is not for extremes. Mix effort with ease inside the same hour. The sustainable version of you outperforms the heroic one over any distance that matters." },
  { id: "tower", num: "XVI", name: "The Tower", msg: "If the routine collapsed, good — it was load-bearing on excuses. Build the next version smaller and truer. One brick today is enough." },
  { id: "star", num: "XVII", name: "The Star", msg: "Recovery counts as progress. Refill quietly: water, air, one slow thing. Hope is a practice with logistics, not a mood." },
  { id: "sun", num: "XIX", name: "The Sun", msg: "Take the win at face value. Go outside, do the simple thing, let it be enough. Not everything meaningful has to be difficult." },
];
function sample(arr, n) {
  const a = [...arr], out = [];
  while (out.length < n && a.length) out.push(a.splice(Math.floor(Math.random() * a.length), 1)[0]);
  return out;
}

/* Minimal line-art per arcana — Labyrinthos-style geometry in DARE's language */
function TarotArt({ id, size = 64 }) {
  const P = { fill: "none", stroke: C.gold, strokeWidth: 1.4, strokeLinecap: "round", strokeLinejoin: "round" };
  const art = {
    fool: <>
      <circle cx="22" cy="16" r="7" {...P} />
      <path d="M6 52 L34 44" {...P} />
      <path d="M34 44 L34 60" {...P} strokeDasharray="2 3" />
      <circle cx="40" cy="40" r="2.4" fill={C.gold} stroke="none" />
    </>,
    magician: <>
      <path d="M14 20 C14 12, 26 12, 26 20 C26 28, 38 28, 38 20 C38 12, 26 12, 26 20 C26 28, 14 28, 14 20 Z" {...P} />
      <path d="M26 34 L26 56" {...P} />
      <circle cx="26" cy="60" r="2" fill={C.gold} stroke="none" />
    </>,
    chariot: <>
      <path d="M12 18 L12 44 M40 18 L40 44" {...P} />
      <circle cx="26" cy="50" r="8" {...P} />
      <path d="M26 42 L26 58 M18 50 L34 50" {...P} />
    </>,
    strength: <>
      <path d="M14 30 C14 22, 26 22, 26 30 C26 38, 38 38, 38 30 C38 22, 26 22, 26 30 C26 38, 14 38, 14 30 Z" {...P} />
      <path d="M10 52 Q26 44 42 52" {...P} />
    </>,
    hermit: <>
      <path d="M26 10 L26 20" {...P} />
      <path d="M26 20 L18 30 L26 40 L34 30 Z" {...P} />
      <circle cx="26" cy="30" r="2.4" fill={C.gold} stroke="none" />
      <path d="M26 40 L26 60" {...P} strokeDasharray="2 3" />
    </>,
    wheel: <>
      <circle cx="26" cy="34" r="16" {...P} />
      <path d="M26 18 L26 50 M10 34 L42 34 M15 23 L37 45 M37 23 L15 45" {...P} strokeWidth="1" />
      <circle cx="26" cy="34" r="3" {...P} />
    </>,
    hanged: <>
      <path d="M12 12 L40 12" {...P} />
      <path d="M26 12 L26 26" {...P} />
      <path d="M26 26 L16 44 L36 44 Z" {...P} />
      <circle cx="26" cy="52" r="3" {...P} />
    </>,
    death: <>
      <path d="M6 40 L46 40" {...P} />
      <path d="M12 40 A14 14 0 0 1 40 40" {...P} />
      <path d="M18 52 L34 52" {...P} strokeDasharray="2 3" />
    </>,
    temperance: <>
      <path d="M10 22 L22 22 L16 34 Z" {...P} />
      <path d="M30 40 L42 40 L36 52 Z" {...P} />
      <path d="M18 30 Q28 34 34 42" {...P} strokeDasharray="2 3" />
    </>,
    tower: <>
      <path d="M18 60 L18 20 L34 20 L34 60" {...P} />
      <path d="M14 20 L38 20" {...P} />
      <path d="M42 8 L32 20 L38 22 L28 34" {...P} />
      <circle cx="14" cy="42" r="1.6" fill={C.gold} stroke="none" />
      <circle cx="40" cy="48" r="1.6" fill={C.gold} stroke="none" />
    </>,
    star: <>
      <path d="M26 12 L28.5 24 L40 26.5 L28.5 29 L26 41 L23.5 29 L12 26.5 L23.5 24 Z" {...P} strokeWidth="1.2" />
      <path d="M8 52 Q17 48 26 52 T44 52" {...P} />
    </>,
    sun: <>
      <circle cx="26" cy="32" r="10" {...P} />
      <path d="M26 12 L26 17 M26 47 L26 52 M6 32 L11 32 M41 32 L46 32 M12 18 L16 22 M36 42 L40 46 M40 18 L36 22 M16 42 L12 46" {...P} strokeWidth="1.1" />
    </>,
  }[id];
  return <svg width={size} height={size * 1.35} viewBox="0 0 52 70" aria-hidden="true">{art}</svg>;
}

/* ---------------------- REWARD DRAWS ----------------------
   Concrete, buyable, doable — variable reward is the hook. */
const DRAWS = {
  common: [
    "Buy yourself a fresh orange juice.",
    "One coffee, sitting down, phone face-down.",
    "A croissant from the good bakery.",
    "Tonight: one episode of your current series, zero guilt.",
    "Your favorite album, from track one, while doing nothing else.",
    "Ten minutes in the sun. That's it. That's the reward.",
  ],
  rare: [
    "Ice cream today — in whatever weather this is.",
    "A long shower with no clock.",
    "Order the fancy coffee. The one with a surname.",
    "Thirty guilt-free minutes of absolutely anything.",
  ],
  golden: [
    { text: "Golden ticket — dinner tonight is whatever you want.", x2: false },
    { text: "Double XP — applied.", x2: true },
    { text: "Buy yourself one small thing this week. This card is the permission.", x2: false },
  ],
};
function rollDraw() {
  const r = Math.random();
  if (r < 0.06) { const g = DRAWS.golden[Math.floor(Math.random() * DRAWS.golden.length)]; return { tier: "golden", text: g.text, x2: g.x2 }; }
  if (r < 0.30) return { tier: "rare", text: DRAWS.rare[Math.floor(Math.random() * DRAWS.rare.length)], x2: false };
  return { tier: "common", text: DRAWS.common[Math.floor(Math.random() * DRAWS.common.length)], x2: false };
}
const TIER = { common: { color: C.green, label: "Reward" }, rare: { color: C.purple, label: "Rare reward" }, golden: { color: C.gold, label: "Golden reward" } };

/* ------------------------- BADGES ------------------------- */
const BADGES = [
  { id: "showed-up", ico: "spark", name: "I showed up", how: "Complete your first dare" },
  { id: "small-dare", ico: "spark", name: "Small dare", how: "Complete a 3-minute dare" },
  { id: "no-excuses", ico: "bolt", name: "No excuses", how: "Complete a dare with energy ≤ 3" },
  { id: "forest-explorer", ico: "pine", name: "Forest explorer", how: "3 forest dares" },
  { id: "strength", ico: "dumbbell", name: "Strength unlocked", how: "First dumbbells or Fitboxing dare" },
  { id: "clear-mind", ico: "moon", name: "Clear mind", how: "3 recovery or focus dares" },
  { id: "wildcard", ico: "spark", name: "Wildcard", how: "Complete a wildcard dare" },
  { id: "week", ico: "check", name: "Week unbroken", how: "7-day flexible streak" },
  { id: "twice", ico: "bolt", name: "Double day", how: "Two dares in one day" },
  { id: "night", ico: "moon", name: "Night mover", how: "Complete a dare after 9 pm" },
  { id: "water-soul", ico: "waves", name: "Water soul", how: "First pool dare" },
  { id: "chapter", ico: "mountain", name: "Chapter closed", how: "Finish a chapter" },
];

/* --------------------- DARE GENERATOR --------------------- */
function generateDare(ci, lastCats, catFeedback, journey) {
  // wildcard chance — anticipation lives here
  if (ci.time >= 10 && ci.energy >= 3 && Math.random() < 0.18) {
    const wpool = WILDCARDS.filter((w) => w.min <= ci.time + 2 && w.locs.includes(ci.loc));
    if (wpool.length) {
      const dare = wpool[Math.floor(Math.random() * wpool.length)];
      return { dare, why: "Wildcard. The usual rules rest today — this one is for the part of you that gets bored." };
    }
  }
  let pool;
  if (ci.time === 3) {
    pool = DARES.filter((d) => d.cat === "small");
  } else {
    pool = DARES.filter((d) => d.cat !== "small" && d.min <= ci.time + 2 && d.locs.includes(ci.loc));
    if (ci.energy <= 3 || ci.state === "blocked" || ci.state === "tired") {
      const easy = pool.filter((d) => d.level === "Easy" && d.min <= 12);
      pool = easy.length ? easy : DARES.filter((d) => d.cat === "small");
    }
  }
  if (!pool.length) pool = DARES.filter((d) => d.cat === "small");

  const scored = pool.map((d) => {
    let s = 0;
    if (ci.energy >= d.energy[0] && ci.energy <= d.energy[1]) s += 30;
    else s -= 8 * Math.min(Math.abs(ci.energy - d.energy[0]), Math.abs(ci.energy - d.energy[1]));
    if (d.states && d.states.includes(ci.state)) s += 15;
    if ((ci.state === "blocked" || ci.state === "tired") && ["small", "recovery", "walk", "forest", "focus"].includes(d.cat)) s += 12;
    if (ci.state === "stressed" && ["forest", "recovery", "pool", "walk"].includes(d.cat)) s += 12;
    if (ci.state === "active" && ["dumbbells", "fitboxing", "padel", "pool", "forest"].includes(d.cat)) s += 10;
    if (ci.energy >= 5) s += Math.max(0, 10 - Math.abs(ci.time - d.min) * 0.6);
    if (journey.bias.includes(d.cat)) s += 10; // the journey pulls its own way
    if (lastCats[0] === d.cat) s -= 18;
    if (lastCats[0] === d.cat && lastCats[1] === d.cat) s -= 40;
    s += (catFeedback[d.cat] || 0) * 6;
    s += Math.random() * 6;
    return { d, s };
  });
  scored.sort((a, b) => b.s - a.s);
  const dare = scored[0].d;
  return { dare, why: buildWhy(ci, dare) };
}

function buildWhy(ci, d) {
  const e = ci.energy;
  const opener =
    e <= 3 ? "Energy is low today — so the bar is on the floor." :
    e <= 6 ? "Medium energy: you need movement, not pressure." :
    "You have fuel today — we're spending it well.";
  const catLine = {
    forest: "The pines do half the work.",
    walk: "Music first. Movement follows.",
    dumbbells: "Strength, without the gym ritual.",
    fitboxing: "Hit something. Legally.",
    pool: "Water resets the nervous system.",
    padel: "Play counts as training.",
    recovery: "Rest is part of the work.",
    focus: "Clarity is also energy.",
    small: "Something is better than nothing. Always.",
  }[d.cat];
  const stateLine =
    ci.state === "blocked" ? " Designed to be almost impossible to refuse." :
    ci.state === "stressed" ? " Chosen to lower the noise." : "";
  return opener + " " + catLine + stateLine;
}

/* ------------------------- STYLES ------------------------- */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,400&family=Space+Grotesk:wght@300;400;500&display=swap');
.dare-root { background:${C.bg}; color:${C.text}; font-family:'Space Grotesk',system-ui,sans-serif; font-weight:300; min-height:100vh; }
.serif { font-family:'Cormorant Garamond',Georgia,serif; font-weight:400; }
.lbl { font-size:10px; letter-spacing:0.22em; text-transform:uppercase; color:${C.dim}; font-weight:400; }
.card { background:${C.card}; border:1px solid ${C.line}; border-radius:20px; }
.pill { border:1px solid ${C.line}; background:transparent; color:${C.dim}; border-radius:999px; padding:9px 0; font-size:13px; font-family:inherit; font-weight:300; cursor:pointer; transition:all .18s; text-align:center; }
.pill.on { background:${C.green}; color:#111; border-color:${C.green}; font-weight:500; }
.btn { display:block; width:100%; border:none; border-radius:999px; padding:15px; font-size:15px; font-family:inherit; font-weight:500; cursor:pointer; transition:transform .15s, opacity .15s; }
.btn:active { transform:scale(.98); }
.btn-green { background:${C.green}; color:#111; }
.btn-ghost { background:${C.text}; color:#111; }
.btn-line { background:transparent; color:${C.text}; border:1px solid ${C.line}; }
.link { background:none; border:none; color:${C.dim}; font-size:12.5px; font-family:inherit; cursor:pointer; text-decoration:underline; text-underline-offset:3px; }
.pulse { animation:darePulse 2.6s ease-in-out infinite; }
@keyframes darePulse { 0%,100%{opacity:.55; transform:scale(1);} 50%{opacity:1; transform:scale(1.08);} }
.rise { animation:dareRise .5s ease both; }
@keyframes dareRise { from{opacity:0; transform:translateY(10px);} to{opacity:1; transform:translateY(0);} }
.flip { animation:dareFlip .45s ease both; }
@keyframes dareFlip { from{transform:rotateY(90deg); opacity:0;} to{transform:rotateY(0); opacity:1;} }
.tcard { background:linear-gradient(160deg, #1E1E1B, #171715); border:1px solid ${C.gold}44; border-radius:14px; cursor:pointer; font-family:inherit; color:${C.text}; padding:0; transition:transform .18s, border-color .18s; }
.tcard:hover { transform:translateY(-4px); border-color:${C.gold}99; }
.nav-b { background:none; border:none; cursor:pointer; font-family:inherit; display:flex; flex-direction:column; align-items:center; gap:3px; font-size:10px; letter-spacing:.08em; padding:4px 10px; }
.hscroll { display:flex; gap:10px; overflow-x:auto; padding-bottom:6px; scrollbar-width:none; }
.hscroll::-webkit-scrollbar { display:none; }
button:focus-visible { outline:2px solid ${C.green}; outline-offset:2px; border-radius:8px; }
@media (prefers-reduced-motion: reduce) { .pulse,.rise,.flip{ animation:none; } .btn,.tcard{ transition:none; } }
`;

/* ---------------------- SMALL PIECES ---------------------- */
/* Icon set — line-art, same language as the Arcana cards. No emoji. */
const ICONS = {
  pine: <><path d="M8 12 L12 6 L16 12" /><path d="M6 17 L12 9.5 L18 17" /><path d="M12 17 L12 21" /></>,
  headphones: <><path d="M5 15 v-1 a7 7 0 0 1 14 0 v1" /><rect x="4" y="14" width="3.4" height="6" rx="1.6" /><rect x="16.6" y="14" width="3.4" height="6" rx="1.6" /></>,
  dumbbell: <><path d="M8.5 12 H15.5" /><path d="M6.5 8.5 V15.5 M4.5 10 V14 M17.5 8.5 V15.5 M19.5 10 V14" /></>,
  bag: <><rect x="9" y="8" width="6" height="11" rx="3" /><path d="M12 8 V5 M10 4.5 H14" /></>,
  waves: <><path d="M4 10 Q6.5 7.5 9 10 T14 10 T19 10" /><path d="M4 15 Q6.5 12.5 9 15 T14 15 T19 15" /></>,
  racket: <><circle cx="12" cy="8.5" r="5" /><path d="M12 13.5 V20" /><circle cx="10.5" cy="7.2" r="0.4" /><circle cx="13.5" cy="7.2" r="0.4" /><circle cx="10.5" cy="9.8" r="0.4" /><circle cx="13.5" cy="9.8" r="0.4" /></>,
  moon: <path d="M14.5 3.5 a8.5 8.5 0 1 0 6 14.5 a7 7 0 0 1 -6 -14.5 Z" />,
  eye: <><path d="M3 12 Q12 5.5 21 12 Q12 18.5 3 12 Z" /><circle cx="12" cy="12" r="2.4" /></>,
  spark: <path d="M12 4 Q12.7 11.3 20 12 Q12.7 12.7 12 20 Q11.3 12.7 4 12 Q11.3 11.3 12 4 Z" />,
  letter: <><rect x="4" y="6" width="16" height="12" rx="2" /><path d="M4.5 7 L12 13 L19.5 7" /></>,
  goal: <><circle cx="12" cy="12" r="7" /><circle cx="12" cy="12" r="3.2" /><circle cx="12" cy="12" r="0.6" /></>,
  bolt: <path d="M13 3 L6.5 13 H11 L10 21 L17.5 10.5 H13 Z" />,
  bulb: <><path d="M12 3.5 a5.8 5.8 0 0 1 3.4 10.5 c-.8.6-1.1 1.4-1.1 2.3 h-4.6 c0-.9-.3-1.7-1.1-2.3 A5.8 5.8 0 0 1 12 3.5 Z" /><path d="M10.2 19 H13.8 M10.8 21 H13.2" /></>,
  flame: <path d="M12 3.5 C15.3 7.6 16.8 10 16.8 13.2 A4.8 4.8 0 0 1 7.2 13.2 C7.2 10.4 9.4 7.6 12 3.5 Z" />,
  sine: <path d="M4 12 Q8 5.5 12 12 T20 12" />,
  mountain: <><path d="M3 18.5 L9 8 L13.6 16" /><path d="M11.2 12 L15 6.5 L21 18.5" /></>,
  bars: <><path d="M6 19 V12" /><path d="M12 19 V5.5" /><path d="M18 19 V15" /></>,
  person: <><circle cx="12" cy="8" r="3.4" /><path d="M5.5 19.5 a6.5 6.5 0 0 1 13 0" /></>,
  check: <path d="M5 12.5 L10 17.5 L19 7" />,
};
const CAT_ICO = { forest: "pine", walk: "headphones", dumbbells: "dumbbell", fitboxing: "bag", pool: "waves", padel: "racket", recovery: "moon", focus: "eye", small: "spark" };
function Ico({ name, size = 18, color = "currentColor", sw = 1.5, style }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, ...style }} aria-hidden="true">{ICONS[name]}</svg>;
}

function Dots({ n, color }) {
  return (
    <span style={{ display: "inline-flex", gap: 4 }}>
      {[0, 1, 2].map((i) => (
        <span key={i} style={{ width: 5, height: 5, borderRadius: 99, background: i < n ? color : C.line }} />
      ))}
    </span>
  );
}

function Nav({ tab, go }) {
  const items = [
    { id: "home", ico: "spark", label: "Today", color: C.green },
    { id: "journey", ico: "mountain", label: "Journey", color: C.purple },
    { id: "progress", ico: "bars", label: "Progress", color: C.gold },
    { id: "you", ico: "person", label: "You", color: C.text },
  ];
  return (
    <div style={{ position: "sticky", bottom: 0, background: "rgba(17,17,17,.92)", backdropFilter: "blur(8px)", borderTop: `1px solid ${C.line}`, display: "flex", justifyContent: "space-around", padding: "10px 0 14px" }}>
      {items.map((it) => (
        <button key={it.id} className="nav-b" onClick={() => go(it.id)} style={{ color: tab === it.id ? it.color : C.faint }}>
          <Ico name={it.ico} size={17} sw={1.6} />
          {it.label}
        </button>
      ))}
    </div>
  );
}

function Meta({ dare }) {
  const cat = CATS[dare.cat];
  return (
    <div style={{ display: "flex", justifyContent: "center", gap: 22, borderTop: `1px solid ${C.line}`, borderBottom: `1px solid ${C.line}`, padding: "14px 0", margin: "18px 0" }}>
      {[
        [CAT_ICO[dare.cat], "Place", cat.label],
        ["headphones", "During", dare.reward.length > 14 ? dare.reward.slice(0, 13) + "…" : dare.reward],
        ["spark", "After", "Reward draw"],
      ].map(([ico, k, v], i) => (
        <div key={i} style={{ textAlign: "center" }}>
          <div style={{ marginBottom: 4, display: "flex", justifyContent: "center" }}><Ico name={ico} size={16} color={C.dim} sw={1.4} /></div>
          <div className="lbl" style={{ fontSize: 9 }}>{k}</div>
          <div style={{ fontSize: 12, marginTop: 2 }}>{v}</div>
        </div>
      ))}
    </div>
  );
}

/* ============================ APP ============================ */
export default function App() {
  /* demo seed — mid-journey so every screen has life */
  const [screen, setScreen] = useState("onboarding");
  const [obIdx, setObIdx] = useState(0);
  const [xp, setXp] = useState(1050);
  const [done, setDone] = useState(12);
  const [streak, setStreak] = useState(6);
  const [badges, setBadges] = useState(["showed-up", "small-dare", "forest-explorer", "strength"]);
  const [lastCats, setLastCats] = useState(["forest", "walk"]);
  const [catCounts, setCatCounts] = useState({ forest: 4, walk: 3, dumbbells: 3, small: 1, recovery: 1 });
  const [feedback, setFeedback] = useState({ forest: 2, walk: 1 });
  const [journeyId, setJourneyId] = useState("ember");
  const [jprog, setJprog] = useState({ ember: 12, iron: 0, water: 0 });
  const [checkin, setCheckin] = useState({ energy: null, time: null, loc: null, state: null });
  const [lastCheckin, setLastCheckin] = useState({ energy: 6, time: 20, loc: "forest", state: "normal" });
  const [today, setToday] = useState(null); // {dare, why, revealed, completed}
  const [daresToday, setDaresToday] = useState(0);
  const [cardOptions] = useState(() => sample(TAROT, 3));
  const [card, setCard] = useState(null);
  const [draw, setDraw] = useState(null); // {tier,text,x2}
  const [drawFlipped, setDrawFlipped] = useState(false);
  const [lastGain, setLastGain] = useState(0);
  const [pendingFb, setPendingFb] = useState(false);
  const [fbNote, setFbNote] = useState(false);
  const [newBadges, setNewBadges] = useState([]);
  const [away, setAway] = useState(false);
  const [openCh, setOpenCh] = useState(1);
  const [secs, setSecs] = useState(0);
  const [paused, setPaused] = useState(false);
  const tRef = useRef(null);

  const now = new Date();
  const dateStr = now.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" }).toUpperCase();
  const greet = now.getHours() < 12 ? "Good morning." : now.getHours() < 19 ? "Good afternoon." : "Good evening.";
  const journey = JOURNEYS.find((j) => j.id === journeyId);
  const jd = jprog[journeyId];
  const chapter = chapterOf(journey, jd);
  const level = Math.floor(xp / 200) + 1;

  /* timer */
  useEffect(() => {
    if (screen === "timer" && !paused && secs > 0) {
      tRef.current = setTimeout(() => setSecs((s) => s - 1), 1000);
      return () => clearTimeout(tRef.current);
    }
  }, [screen, paused, secs]);
  useEffect(() => { if (screen === "timer" && secs === 0 && today && !today.completed) finishDare(); }, [secs]); // eslint-disable-line

  function runCheckin(ci) {
    const c = ci || checkin;
    setLastCheckin(c);
    const { dare, why } = generateDare(c, lastCats, feedback, journey);
    setToday({ dare, why, revealed: false, completed: false });
    setScreen("home");
  }
  const justDareMe = () => runCheckin(lastCheckin);

  function startDare() { setSecs(today.dare.min * 60); setPaused(false); setScreen("timer"); }

  function swapToSmall() {
    const smalls = DARES.filter((d) => d.cat === "small");
    const dare = smalls[Math.floor(Math.random() * smalls.length)];
    setToday({ dare, why: "No energy is a valid state. This is the whole ask.", revealed: true, completed: false });
    setScreen("detail");
  }

  function finishDare() {
    const d = today.dare;
    const roll = rollDraw();
    const gain = d.xp * (roll.x2 ? 2 : 1);
    const counts = { ...catCounts, [d.cat]: (catCounts[d.cat] || 0) + 1 };
    const nToday = daresToday + 1;
    const h = new Date().getHours();
    const earned = [];
    const has = (id) => badges.includes(id) || earned.includes(id);
    if (!has("showed-up")) earned.push("showed-up");
    if (d.cat === "small" && !has("small-dare")) earned.push("small-dare");
    if (checkin.energy !== null && checkin.energy <= 3 && !has("no-excuses")) earned.push("no-excuses");
    if (counts.forest >= 3 && !has("forest-explorer")) earned.push("forest-explorer");
    if ((d.cat === "dumbbells" || d.cat === "fitboxing") && !has("strength")) earned.push("strength");
    if ((counts.recovery || 0) + (counts.focus || 0) >= 3 && !has("clear-mind")) earned.push("clear-mind");
    if (d.wild && !has("wildcard")) earned.push("wildcard");
    if (d.cat === "pool" && !has("water-soul")) earned.push("water-soul");
    if (nToday >= 2 && !has("twice")) earned.push("twice");
    if (h >= 21 && !has("night")) earned.push("night");
    if (streak + 1 >= 7 && !has("week")) earned.push("week");
    if ((jd + 1) % CH_SIZE === 0 && chapter.idx < 3 && !has("chapter")) earned.push("chapter");

    setCatCounts(counts);
    setXp(xp + gain);
    setDone(done + 1);
    setDaresToday(nToday);
    setJprog({ ...jprog, [journeyId]: jd + 1 });
    if (nToday === 1) setStreak(streak + 1);
    setLastCats([d.cat, lastCats[0]]);
    setBadges([...badges, ...earned]);
    setNewBadges(earned);
    setDraw(roll);
    setDrawFlipped(false);
    setLastGain(gain);
    setToday({ ...today, completed: true });
    setPendingFb(true);
    setScreen("complete");
  }

  function giveFeedback(delta) {
    const cat = today.dare.cat;
    setFeedback({ ...feedback, [cat]: (feedback[cat] || 0) + delta });
    setPendingFb(false);
    setFbNote(true);
  }

  function oneMore() {
    setToday(null); setFbNote(false); setPendingFb(false);
    setCheckin({ energy: null, time: null, loc: null, state: null });
    setScreen("checkin");
  }

  function resetDemo() {
    setScreen("onboarding"); setObIdx(0); setXp(0); setDone(0); setStreak(0);
    setBadges([]); setLastCats([]); setCatCounts({}); setFeedback({});
    setJourneyId("ember"); setJprog({ ember: 0, iron: 0, water: 0 });
    setCheckin({ energy: null, time: null, loc: null, state: null });
    setToday(null); setDaresToday(0); setCard(null); setDraw(null);
    setPendingFb(false); setFbNote(false); setNewBadges([]); setAway(false);
  }

  const wrap = { maxWidth: 420, margin: "0 auto", minHeight: "100vh", display: "flex", flexDirection: "column" };
  const pad = { padding: "28px 24px", flex: 1 };

  /* ---------------------- ONBOARDING ---------------------- */
  if (screen === "onboarding") {
    const slides = [
      { h: "You don't need motivation.", s: "Motivation is unreliable. Starting isn't." },
      { h: "You need one dare a day.", s: "One small action. Chosen for you." },
      { h: "We decide. You begin.", s: "No lists. No plans. No decisions." },
      { h: "DARE", s: "Daily Actions. Real Energy.", last: true },
    ];
    const sl = slides[obIdx];
    return (
      <div className="dare-root"><style>{CSS}</style>
        <div style={{ ...wrap, justifyContent: "space-between", padding: "60px 32px 48px", textAlign: "center" }}
          onClick={() => !sl.last && setObIdx(obIdx + 1)}>
          <div className="pulse" style={{ color: C.green, fontSize: 22 }}>✦</div>
          <div className="rise" key={obIdx}>
            <h1 className="serif" style={{ fontSize: sl.last ? 56 : 38, lineHeight: 1.15, margin: "0 0 18px", letterSpacing: sl.last ? "0.18em" : 0 }}>{sl.h}</h1>
            <p style={{ color: sl.last ? C.green : C.dim, fontSize: 15 }}>{sl.s}</p>
          </div>
          <div>
            {sl.last ? (
              <button className="btn btn-green" onClick={() => setScreen("home")}>Start</button>
            ) : (
              <p className="lbl">Tap to continue · {obIdx + 1} / 4</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  /* ---------------------- RE-ENTRY ------------------------- */
  if (away) {
    const comeback = DARES.find((d) => d.id === "out-the-door");
    return (
      <div className="dare-root"><style>{CSS}</style>
        <div style={{ ...wrap, textAlign: "center" }}>
          <div style={{ ...pad, display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <div className="rise">
              <div className="pulse" style={{ color: C.green, fontSize: 22, marginBottom: 26 }}>✦</div>
              <h1 className="serif" style={{ fontSize: 44, lineHeight: 1.15, marginBottom: 12 }}>No reset.</h1>
              <p className="serif" style={{ fontStyle: "italic", fontSize: 20, color: C.dim, marginBottom: 8 }}>Take the next dare.</p>
              <p style={{ fontSize: 13, color: C.faint, marginBottom: 34 }}>Your streak sleeps. It doesn't die.</p>
              <div className="card" style={{ padding: 22, marginBottom: 22, textAlign: "left" }}>
                <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                  <div style={{ width: 46, height: 46, borderRadius: 99, border: `1px solid ${C.green}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>✦</div>
                  <div>
                    <p className="serif" style={{ fontSize: 21 }}>{comeback.title}</p>
                    <p style={{ fontSize: 12.5, color: C.dim, marginTop: 2 }}>3 min · that's the whole comeback</p>
                  </div>
                </div>
              </div>
              <button className="btn btn-green" onClick={() => {
                setAway(false);
                setToday({ dare: comeback, why: "You were away. This is the whole comeback — nothing more is asked.", revealed: true, completed: false });
                setScreen("detail");
              }}>Do it now</button>
              <button className="link" style={{ marginTop: 16 }} onClick={() => setAway(false)}>Not yet — just look around</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ------------------------- HOME ------------------------- */
  if (screen === "home") {
    return (
      <div className="dare-root"><style>{CSS}</style>
        <div style={wrap}>
          <div style={pad}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span className="lbl">{dateStr}</span>
              <span style={{ display: "flex", gap: 10, alignItems: "center" }}>
                {daresToday > 1 && <span style={{ fontSize: 11, color: C.gold }}>✦ {daresToday} today</span>}
                <span style={{ color: C.green, fontSize: 14 }}>✦</span>
              </span>
            </div>
            <h1 className="serif" style={{ fontSize: 40, lineHeight: 1.12, margin: "22px 0 8px" }}>{greet}<br />One dare today.</h1>
            <p className="lbl" style={{ color: journey.color, marginTop: 10 }}>{journey.name} · Chapter {chapter.n} — {chapter.name}</p>

            {/* tarot draw */}
            {!card ? (
              <div style={{ margin: "24px 0 26px" }}>
                <p className="lbl" style={{ marginBottom: 12 }}>Draw your card for today</p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                  {cardOptions.map((c, i) => (
                    <button key={c.id} className="tcard" style={{ aspectRatio: "5 / 8.5", position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => setCard(c)} aria-label="Face-down tarot card">
                      <div style={{ position: "absolute", inset: 6, border: `1px solid ${C.gold}33`, borderRadius: 9, pointerEvents: "none" }} />
                      <div style={{ position: "absolute", inset: 11, border: `1px solid ${C.gold}18`, borderRadius: 6, pointerEvents: "none" }} />
                      {["8%", "8%", "78%", "78%"].map((t, k) => (
                        <span key={k} style={{ position: "absolute", top: k < 2 ? "6%" : "88%", left: k % 2 ? "82%" : "10%", color: C.gold, opacity: 0.35, fontSize: 8 }}>✦</span>
                      ))}
                      <span className="pulse" style={{ color: C.gold, fontSize: 18, opacity: 0.75, animationDelay: `${i * 0.4}s` }}>✦</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="card flip" style={{ margin: "24px 0 26px", padding: 16, borderColor: C.gold + "44", display: "flex", gap: 16, alignItems: "stretch" }}>
                <div style={{ flexShrink: 0, width: 88, border: `1px solid ${C.gold}55`, borderRadius: 10, background: "linear-gradient(170deg,#1E1E1B,#161614)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-between", padding: "8px 4px" }}>
                  <span style={{ fontSize: 9, letterSpacing: "0.18em", color: C.gold }}>{card.num}</span>
                  <TarotArt id={card.id} size={54} />
                  <span className="lbl" style={{ fontSize: 7.5, color: C.gold, textAlign: "center", letterSpacing: "0.14em" }}>{card.name.toUpperCase()}</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
                  <p className="lbl" style={{ color: C.gold, marginBottom: 5 }}>{card.num} · {card.name}</p>
                  <p style={{ fontSize: 13.5, lineHeight: 1.55, color: C.text }}>{card.msg}</p>
                </div>
              </div>
            )}

            {/* dare card states */}
            {!today && (
              <div className="card rise" style={{ padding: 26, textAlign: "center" }}>
                <div className="pulse" style={{ fontSize: 22, color: C.green, marginBottom: 12 }}>✦</div>
                <p className="lbl" style={{ marginBottom: 6 }}>Your dare of the day</p>
                <p style={{ color: C.dim, fontSize: 13.5, marginBottom: 20 }}>20 seconds. Then we choose for you.</p>
                <button className="btn btn-green" style={{ marginBottom: 10 }} onClick={() => setScreen("checkin")}>Start check-in</button>
                <button className="btn btn-line" onClick={justDareMe}>Just dare me ✦</button>
                <p style={{ fontSize: 11, color: C.faint, marginTop: 10 }}>Skips the questions. Uses what we know.</p>
              </div>
            )}

            {today && !today.revealed && (
              <button className="card rise" onClick={() => { setToday({ ...today, revealed: true }); setScreen("detail"); }}
                style={{ padding: 30, textAlign: "center", width: "100%", cursor: "pointer", fontFamily: "inherit", color: C.text, borderColor: today.dare.wild ? C.gold + "66" : C.line, boxShadow: `0 0 40px -18px ${colorOf(today.dare)}` }}>
                <div className="pulse" style={{ fontSize: 26, color: colorOf(today.dare), marginBottom: 14 }}>✦</div>
                <p className="lbl" style={{ marginBottom: 16, color: today.dare.wild ? C.gold : C.dim }}>{today.dare.wild ? "✦ Wildcard sealed ✦" : "Sealed dare"}</p>
                <div style={{ display: "flex", justifyContent: "center", gap: 24, marginBottom: 18, fontSize: 12, color: C.dim }}>
                  <span><Dots n={LEVELS[today.dare.level]} color={colorOf(today.dare)} /></span>
                  <span>Reward draw after</span>
                  <span>+{today.dare.xp} XP</span>
                </div>
                <p style={{ fontSize: 14, color: today.dare.wild ? C.gold : C.green }}>Tap to reveal</p>
              </button>
            )}

            {today && today.revealed && !today.completed && (
              <div className="card rise" style={{ padding: 24, borderColor: today.dare.wild ? C.gold + "55" : C.line }}>
                <div style={{ display: "flex", gap: 14, alignItems: "center", marginBottom: 18 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 99, border: `1px solid ${colorOf(today.dare)}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, boxShadow: `0 0 24px -8px ${colorOf(today.dare)}` }}><Ico name={CAT_ICO[today.dare.cat]} size={22} color={colorOf(today.dare)} sw={1.4} /></div>
                  <div>
                    <p className="lbl" style={{ color: colorOf(today.dare), marginBottom: 3 }}>{today.dare.wild ? "Wildcard" : "Today's dare"}</p>
                    <p className="serif" style={{ fontSize: 22 }}>{today.dare.title}</p>
                    <p style={{ fontSize: 12.5, color: C.dim, marginTop: 2 }}>{today.dare.min} min · {today.dare.level} · +{today.dare.xp} XP</p>
                  </div>
                </div>
                <button className="btn btn-green" onClick={startDare}>Start dare</button>
                <div style={{ textAlign: "center", marginTop: 12 }}>
                  <button className="link" onClick={() => setScreen("detail")}>See steps & why</button>
                </div>
              </div>
            )}

            {today && today.completed && (
              <div className="card rise" style={{ padding: 26, textAlign: "center" }}>
                <div style={{ color: C.green, fontSize: 22, marginBottom: 10 }}>✓</div>
                <p className="serif" style={{ fontSize: 22, marginBottom: 4 }}>Done for today.</p>
                <p style={{ color: C.dim, fontSize: 13, marginBottom: 18 }}>{today.dare.title} · +{lastGain} XP</p>
                <button className="btn btn-line" onClick={oneMore}>One more dare ✦</button>
              </div>
            )}

            {pendingFb && today && today.completed && (
              <div className="card rise" style={{ padding: 22, marginTop: 16, borderColor: C.gold + "44" }}>
                <p className="lbl" style={{ color: C.gold, marginBottom: 6 }}>30 minutes later</p>
                <p style={{ fontSize: 14.5, marginBottom: 14 }}>More energy than before?</p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {[["Much more", 2], ["A little more", 1], ["Same", 0], ["Less", -1]].map(([t, v]) => (
                    <button key={t} className="pill" onClick={() => giveFeedback(v)}>{t}</button>
                  ))}
                </div>
                <p style={{ fontSize: 11, color: C.faint, marginTop: 10 }}>In the real app this appears 30 min after completing.</p>
              </div>
            )}
            {fbNote && (
              <p className="rise" style={{ fontSize: 12.5, color: C.dim, marginTop: 14, textAlign: "center" }}>Noted. This shapes tomorrow's dare. ✦</p>
            )}
          </div>
          <Nav tab="home" go={setScreen} />
        </div>
      </div>
    );
  }

  /* ------------------------ CHECK-IN ----------------------- */
  if (screen === "checkin") {
    const ready = checkin.energy && checkin.time && checkin.loc && checkin.state;
    const locs = [["home", "Home"], ["outside", "Outside"], ["forest", "Forest"], ["pool", "Pool"], ["gym", "Gym"], ["padel", "Padel"]];
    const states = [["blocked", "Blocked"], ["tired", "Tired"], ["normal", "Normal"], ["active", "Active"], ["stressed", "Stressed"]];
    return (
      <div className="dare-root"><style>{CSS}</style>
        <div style={wrap}>
          <div style={pad}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 26 }}>
              <button className="link" style={{ textDecoration: "none", fontSize: 16 }} onClick={() => setScreen("home")}>←</button>
              <span className="lbl">Quick check-in</span>
              <span style={{ width: 16 }} />
            </div>
            <h2 className="serif" style={{ fontSize: 30, marginBottom: 4 }}>How are you today?</h2>
            <p style={{ color: C.dim, fontSize: 13, marginBottom: 18 }}>This helps me choose your perfect dare.</p>
            <button className="btn btn-line" style={{ marginBottom: 26, fontSize: 13.5, padding: 12 }} onClick={justDareMe}>Just dare me — skip the questions ✦</button>

            <p className="lbl" style={{ marginBottom: 10 }}>Energy</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(10,1fr)", gap: 5, marginBottom: 22 }}>
              {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                <button key={n} className={"pill" + (checkin.energy === n ? " on" : "")} style={{ padding: "8px 0", fontSize: 12 }} onClick={() => setCheckin({ ...checkin, energy: n })}>{n}</button>
              ))}
            </div>

            <p className="lbl" style={{ marginBottom: 10 }}>Time available</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, marginBottom: 22 }}>
              {[3, 10, 20, 30].map((t) => (
                <button key={t} className={"pill" + (checkin.time === t ? " on" : "")} onClick={() => setCheckin({ ...checkin, time: t })}>{t} min</button>
              ))}
            </div>

            <p className="lbl" style={{ marginBottom: 10 }}>Where are you?</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginBottom: 22 }}>
              {locs.map(([id, t]) => (
                <button key={id} className={"pill" + (checkin.loc === id ? " on" : "")} onClick={() => setCheckin({ ...checkin, loc: id })}>{t}</button>
              ))}
            </div>

            <p className="lbl" style={{ marginBottom: 10 }}>Mental state</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginBottom: 34 }}>
              {states.map(([id, t]) => (
                <button key={id} className={"pill" + (checkin.state === id ? " on" : "")} onClick={() => setCheckin({ ...checkin, state: id })}>{t}</button>
              ))}
            </div>

            <button className="btn btn-ghost" disabled={!ready} style={{ opacity: ready ? 1 : 0.35 }} onClick={() => runCheckin()}>Get my dare</button>
            <p className="pulse" style={{ textAlign: "center", color: C.green, marginTop: 22 }}>✦</p>
          </div>
        </div>
      </div>
    );
  }

  /* ---------------------- DARE DETAIL ---------------------- */
  if (screen === "detail" && today) {
    const d = today.dare, col = colorOf(d);
    return (
      <div className="dare-root"><style>{CSS}</style>
        <div style={wrap}>
          <div style={pad}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 22 }}>
              <button className="link" style={{ textDecoration: "none", fontSize: 16 }} onClick={() => setScreen("home")}>←</button>
              <span className="lbl" style={{ color: d.wild ? C.gold : C.dim }}>{d.wild ? "✦ Wildcard ✦" : "Your dare"}</span>
              <span style={{ width: 16 }} />
            </div>
            <div style={{ textAlign: "center" }} className="rise">
              <div style={{ width: 74, height: 74, borderRadius: 99, border: `1px solid ${col}`, margin: "0 auto 16px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, boxShadow: `0 0 44px -12px ${col}` }}><Ico name={CAT_ICO[d.cat]} size={30} color={col} sw={1.3} /></div>
              <p className="lbl" style={{ color: col, marginBottom: 8 }}>{d.level} level</p>
              <h2 className="serif" style={{ fontSize: 34, marginBottom: 8 }}>{d.title}</h2>
              <p style={{ color: C.dim, fontSize: 13.5 }}>{d.min} minutes · +{d.xp} XP</p>
              <Meta dare={d} />
            </div>

            <div className="card" style={{ padding: 18, marginBottom: 14, background: C.card2 }}>
              <p className="lbl" style={{ color: C.gold, marginBottom: 6 }}>Why this dare today</p>
              <p style={{ fontSize: 14, lineHeight: 1.55, color: C.text }}>{today.why}</p>
            </div>

            <div className="card" style={{ padding: 18, marginBottom: 18, borderColor: C.gold + "33", display: "flex", gap: 14, alignItems: "center" }}>
              <span style={{ fontSize: 18, color: C.gold }}>✦</span>
              <div>
                <p className="lbl" style={{ color: C.gold, marginBottom: 3 }}>Reward</p>
                <p style={{ fontSize: 13.5, lineHeight: 1.45 }}><b style={{ fontWeight: 500 }}>{d.reward}</b> during the dare. A sealed reward draw when you finish — sometimes it's golden.</p>
              </div>
            </div>

            <p className="lbl" style={{ marginBottom: 12 }}>Steps</p>
            <div style={{ marginBottom: 28 }}>
              {d.steps.map((s, i) => (
                <div key={i} style={{ display: "flex", gap: 12, alignItems: "baseline", padding: "9px 0", borderBottom: i < d.steps.length - 1 ? `1px solid ${C.line}` : "none" }}>
                  <span style={{ color: col, fontSize: 11, minWidth: 16 }}>{i + 1}</span>
                  <span style={{ fontSize: 14.5, lineHeight: 1.4 }}>{s}</span>
                </div>
              ))}
            </div>

            <button className="btn btn-green" onClick={startDare}>Start dare</button>
            <div style={{ textAlign: "center", marginTop: 16 }}>
              <button className="link" onClick={swapToSmall}>No energy → 3-minute version</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ------------------------- TIMER ------------------------- */
  if (screen === "timer" && today) {
    const d = today.dare, col = colorOf(d);
    const total = d.min * 60;
    const frac = secs / total;
    const R = 96, CIRC = 2 * Math.PI * R;
    const mm = String(Math.floor(secs / 60)).padStart(2, "0");
    const ss = String(secs % 60).padStart(2, "0");
    return (
      <div className="dare-root"><style>{CSS}</style>
        <div style={{ ...wrap, textAlign: "center" }}>
          <div style={{ ...pad, display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <p className="serif" style={{ fontSize: 30, marginBottom: 4 }}>On the move.</p>
            <p style={{ color: C.dim, fontSize: 13, marginBottom: 30 }}>{d.title} · reward active: {d.reward}</p>
            <div style={{ position: "relative", width: 220, height: 220, margin: "0 auto 30px" }}>
              <svg width="220" height="220" style={{ transform: "rotate(-90deg)" }}>
                <circle cx="110" cy="110" r={R} fill="none" stroke={C.line} strokeWidth="3" />
                <circle cx="110" cy="110" r={R} fill="none" stroke={col} strokeWidth="3" strokeLinecap="round"
                  strokeDasharray={CIRC} strokeDashoffset={CIRC * (1 - frac)} style={{ transition: "stroke-dashoffset 1s linear" }} />
              </svg>
              <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <span className="lbl" style={{ marginBottom: 6 }}>Time left</span>
                <span className="serif" style={{ fontSize: 46 }}>{mm}:{ss}</span>
                <button className="link" style={{ marginTop: 8, textDecoration: "none", fontSize: 18 }} onClick={() => setPaused(!paused)} style={{ marginTop: 8 }}>{paused ? "Resume" : "Pause"}</button>
              </div>
            </div>
            <p style={{ fontSize: 13, color: C.dim, marginBottom: 30 }}>Step 1 — {d.steps[0]}</p>
            <button className="btn btn-ghost" onClick={finishDare}>Finish dare</button>
            <button className="link" style={{ marginTop: 14 }} onClick={() => { setSecs(3); setPaused(false); }}>(demo) skip to the end</button>
          </div>
        </div>
      </div>
    );
  }

  /* ---------------------- COMPLETION ---------------------- */
  if (screen === "complete" && today) {
    const t = draw ? TIER[draw.tier] : TIER.common;
    return (
      <div className="dare-root"><style>{CSS}</style>
        <div style={{ ...wrap, textAlign: "center", position: "relative", overflow: "hidden" }}>
          {["12%", "78%", "30%", "64%", "88%"].map((x, i) => (
            <span key={i} className="pulse" style={{ position: "absolute", left: x, top: `${10 + i * 15}%`, color: C.gold, opacity: 0.4, fontSize: 9 + (i % 3) * 3, animationDelay: `${i * 0.5}s` }}>✦</span>
          ))}
          <div style={{ ...pad, display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <div className="rise">
              <div style={{ width: 80, height: 80, borderRadius: 99, border: `1px solid ${C.green}`, margin: "0 auto 22px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, color: C.green, boxShadow: `0 0 60px -14px ${C.green}` }}>✓</div>
              <h2 className="serif" style={{ fontSize: 38, marginBottom: 6 }}>Dare completed.</h2>
              <p style={{ color: C.green, fontSize: 19, marginBottom: 16 }}>+{lastGain} XP{draw && draw.x2 ? " (doubled ✦)" : ""}</p>
              <p className="serif" style={{ fontStyle: "italic", fontSize: 18, color: C.dim, marginBottom: 24 }}>The hard part is over.</p>

              {/* reward draw */}
              {draw && !drawFlipped ? (
                <button className="tcard pulse" style={{ width: 180, height: 100, margin: "0 auto 24px", display: "block" }} onClick={() => setDrawFlipped(true)}>
                  <span style={{ color: C.gold, fontSize: 16 }}>✦</span>
                  <p className="lbl" style={{ marginTop: 8 }}>Your reward draw</p>
                  <p style={{ fontSize: 11, color: C.faint, marginTop: 4 }}>Tap to reveal</p>
                </button>
              ) : draw && (
                <div className="card flip" style={{ padding: 18, margin: "0 auto 24px", maxWidth: 280, borderColor: t.color + "66", boxShadow: draw.tier === "golden" ? `0 0 44px -12px ${C.gold}` : "none" }}>
                  <p className="lbl" style={{ color: t.color, marginBottom: 6 }}>✦ {t.label}</p>
                  <p className="serif" style={{ fontSize: 18, lineHeight: 1.35 }}>{draw.text}</p>
                </div>
              )}

              {newBadges.length > 0 && (
                <div className="card" style={{ padding: 14, marginBottom: 24, display: "inline-block" }}>
                  {newBadges.map((id) => {
                    const b = BADGES.find((x) => x.id === id);
                    return <p key={id} style={{ fontSize: 13 }}><Ico name={b.ico} size={13} color={C.gold} style={{ verticalAlign: "-2px" }} /> &nbsp;New badge — {b.name}</p>;
                  })}
                </div>
              )}
              <button className="btn btn-ghost" onClick={() => setScreen("home")}>Back home</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ----------------- JOURNEY PICKER ------------------------ */
  if (screen === "journeys") {
    return (
      <div className="dare-root"><style>{CSS}</style>
        <div style={wrap}>
          <div style={pad}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 24 }}>
              <button className="link" style={{ textDecoration: "none", fontSize: 16 }} onClick={() => setScreen("journey")}>←</button>
              <span className="lbl">Choose a journey</span>
              <span style={{ width: 16 }} />
            </div>
            <p className="serif" style={{ fontStyle: "italic", fontSize: 18, color: C.dim, marginBottom: 24, textAlign: "center" }}>Every journey keeps its own progress.<br />Switch whenever you want.</p>
            {JOURNEYS.map((j) => {
              const cur = j.id === journeyId;
              const p = jprog[j.id];
              const ch = chapterOf(j, p);
              return (
                <button key={j.id} className="card" onClick={() => { setJourneyId(j.id); setScreen("journey"); }}
                  style={{ padding: 20, marginBottom: 12, width: "100%", textAlign: "left", cursor: "pointer", fontFamily: "inherit", color: C.text, borderColor: cur ? j.color + "88" : C.line, boxShadow: cur ? `0 0 30px -14px ${j.color}` : "none" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <p className="serif" style={{ fontSize: 24, color: cur ? j.color : C.text }}>{j.sym} &nbsp;{j.name}</p>
                      <p style={{ fontSize: 13, color: C.dim, marginTop: 4 }}>{j.tag}</p>
                      <p className="lbl" style={{ marginTop: 8 }}>{p > 0 ? `Chapter ${ch.n} — ${ch.name} · ${p} dares in` : "Not started"}</p>
                    </div>
                    {cur && <span style={{ color: j.color, fontSize: 13 }}>● current</span>}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  /* ------------------------ JOURNEY ------------------------ */
  if (screen === "journey") {
    const hints = journey.bias.length ? journey.bias : ["forest", "walk", "dumbbells", "recovery", "pool", "focus"];
    const isEmber = journeyId === "ember";
    const mDone = isEmber ? EMBER_MARKS.flat().filter((m) => m.done).length : 0;
    const mTot = isEmber ? EMBER_MARKS.flat().length : 0;
    return (
      <div className="dare-root"><style>{CSS}</style>
        <div style={wrap}>
          <div style={pad}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <p className="lbl">Your journey</p>
              <button className="link" onClick={() => setScreen("journeys")}>Change journey</button>
            </div>
            <h2 className="serif" style={{ fontSize: 34, marginBottom: 2, color: journey.color }}>{journey.sym} {journey.name}</h2>
            <p style={{ color: C.dim, fontSize: 13.5, marginBottom: 14 }}>{journey.tag}</p>

            {/* marks band — Fabulous's 53% · 16/30 */}
            {isEmber && (
              <div className="card" style={{ padding: "14px 18px", marginBottom: 22, borderColor: journey.color + "44", display: "flex", justifyContent: "space-around", textAlign: "center" }}>
                <div>
                  <p className="serif" style={{ fontSize: 26, color: journey.color }}>{Math.round((mDone / mTot) * 100)}%</p>
                  <p className="lbl" style={{ fontSize: 8.5 }}>completion</p>
                </div>
                <div style={{ width: 1, background: C.line }} />
                <div>
                  <p className="serif" style={{ fontSize: 26 }}>{mDone}/{mTot}</p>
                  <p className="lbl" style={{ fontSize: 8.5 }}>marks achieved</p>
                </div>
              </div>
            )}

            {/* the days ahead */}
            <p className="lbl" style={{ marginBottom: 12 }}>The days ahead</p>
            <div className="hscroll" style={{ marginBottom: 8 }}>
              {Array.from({ length: 7 }, (_, i) => {
                const isToday = i === 0;
                const isWild = i === 3;
                const milestone = !isToday && (jd + i) % CH_SIZE === 0 && chapter.idx < 3;
                return (
                  <div key={i} style={{ minWidth: 64, textAlign: "center" }}>
                    <div style={{
                      width: 52, height: 52, margin: "0 auto 6px", borderRadius: 99,
                      border: `1px solid ${isToday ? journey.color : isWild ? C.gold + "77" : C.line}`,
                      display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17,
                      color: isToday ? journey.color : isWild ? C.gold : C.dim,
                      opacity: isToday ? 1 : 0.75,
                      boxShadow: isToday ? `0 0 22px -8px ${journey.color}` : isWild ? `0 0 18px -8px ${C.gold}` : "none",
                    }}>
                      {isToday ? (today && today.completed ? <Ico name="check" size={18} color={journey.color} /> : "✦") : isWild ? "?" : <Ico name={CAT_ICO[hints[i % hints.length]]} size={19} color={C.dim} sw={1.3} />}
                    </div>
                    <p style={{ fontSize: 10, color: isToday ? C.text : C.faint }}>{isToday ? "Today" : `+${i}`}</p>
                    {milestone && <p style={{ fontSize: 9, color: C.gold }}>chapter ✦</p>}
                  </div>
                );
              })}
            </div>
            <p style={{ fontSize: 12.5, color: C.dim, marginBottom: 26 }}>Tomorrow leans {CATS[hints[1 % hints.length]].label.toLowerCase()}. The rest stays sealed until its day.</p>

            {/* milestone path — chapters unlock in order */}
            {journey.chapters.map((c, i) => {
              const from = i * CH_SIZE, to = (i + 1) * CH_SIZE;
              const state = i < 3 && jd >= to ? "done" : jd >= from ? "now" : "locked";
              const marks = isEmber ? EMBER_MARKS[i] : null;
              const chDone = marks ? marks.filter((m) => m.done).length : 0;
              const open = openCh === i && state !== "locked" && marks;
              const nodeCol = state === "done" ? C.green : state === "now" ? journey.color : C.faint;
              return (
                <div key={c.n}>
                  {i > 0 && (
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, padding: "8px 0" }}>
                      {[0, 1, 2].map((d) => <span key={d} style={{ width: 3, height: 3, borderRadius: 99, background: state === "locked" ? C.line : C.faint }} />)}
                    </div>
                  )}
                  <button onClick={() => marks && state !== "locked" && setOpenCh(open ? null : i)}
                    style={{ display: "flex", gap: 16, alignItems: "center", width: "100%", background: "none", border: "none", cursor: marks && state !== "locked" ? "pointer" : "default", fontFamily: "inherit", color: C.text, textAlign: "left", padding: 0 }}>
                    <div style={{ position: "relative", width: 60, height: 60, flexShrink: 0 }}>
                      <div style={{ width: 60, height: 60, borderRadius: 99, border: `1.5px solid ${nodeCol}`, display: "flex", alignItems: "center", justifyContent: "center", opacity: state === "locked" ? 0.45 : 1, boxShadow: state === "now" ? `0 0 26px -8px ${journey.color}` : "none" }}>
                        <Ico name={CH_ICO[i]} size={24} color={nodeCol} sw={1.4} />
                      </div>
                      {state === "done" && (
                        <div style={{ position: "absolute", right: -2, bottom: -2, width: 20, height: 20, borderRadius: 99, background: C.green, display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <Ico name="check" size={11} color="#111" sw={2.4} />
                        </div>
                      )}
                    </div>
                    <div style={{ flex: 1, opacity: state === "locked" ? 0.5 : 1 }}>
                      <p className="lbl" style={{ marginBottom: 3 }}>Chapter {c.n}</p>
                      <p className="serif" style={{ fontSize: 20 }}>{c.name}</p>
                      <p style={{ fontSize: 12, color: C.dim, marginTop: 2 }}>
                        {state === "locked" ? "Not yet unlocked" : marks ? `${chDone}/${marks.length} marks achieved` : c.goal}
                      </p>
                    </div>
                    {marks && state !== "locked" && <span style={{ color: C.faint, fontSize: 13 }}>{open ? "▾" : "▸"}</span>}
                  </button>

                  {open && (
                    <div className="rise" style={{ margin: "12px 0 4px 76px" }}>
                      {marks.map((m, k) => (
                        <div key={k} className="card" style={{ padding: "12px 14px", marginBottom: 8, display: "flex", gap: 12, alignItems: "center", borderColor: m.done ? C.line : journey.color + "44" }}>
                          <Ico name={EV_T[m.t].ico} size={16} color={m.done ? C.dim : journey.color} sw={1.4} />
                          <div style={{ flex: 1 }}>
                            <p className="lbl" style={{ fontSize: 8, marginBottom: 2 }}>{EV_T[m.t].label} · {k + 1}/{marks.length}</p>
                            <p style={{ fontSize: 13, lineHeight: 1.35 }}>{m.title}</p>
                          </div>
                          {m.done
                            ? <Ico name="check" size={14} color={C.green} sw={2} />
                            : <span style={{ fontSize: 12, color: C.coral }}>Start</span>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
            {!isEmber && <p style={{ fontSize: 12, color: C.faint, marginTop: 16 }}>The marks for this journey are still being written. Dares count all the same.</p>}
            <p style={{ fontSize: 12.5, color: C.faint, textAlign: "center", marginTop: 22 }}>Missed a day? No reset. Take the next dare.</p>
          </div>
          <Nav tab="journey" go={setScreen} />
        </div>
      </div>
    );
  }

  /* ------------------------ PROGRESS ----------------------- */
  if (screen === "progress") {
    const bestCat = Object.entries(feedback).sort((a, b) => b[1] - a[1])[0];
    return (
      <div className="dare-root"><style>{CSS}</style>
        <div style={wrap}>
          <div style={pad}>
            <p className="lbl" style={{ marginBottom: 20 }}>Your progress</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 24 }}>
              <div className="card" style={{ padding: 18 }}>
                <p className="lbl" style={{ marginBottom: 6 }}>Total XP</p>
                <p className="serif" style={{ fontSize: 36 }}>{xp.toLocaleString()} <span style={{ color: C.gold, fontSize: 18 }}>✦</span></p>
                <p style={{ fontSize: 12, color: C.dim }}>Level {level}</p>
              </div>
              <div className="card" style={{ padding: 18 }}>
                <p className="lbl" style={{ marginBottom: 6 }}>Flexible streak</p>
                <p className="serif" style={{ fontSize: 36 }}>{streak} <Ico name="bolt" size={17} color={C.coral} style={{ display: "inline", verticalAlign: "-1px" }} /></p>
                <p style={{ fontSize: 12, color: C.dim }}>days · no pressure</p>
              </div>
            </div>
            {bestCat && bestCat[1] > 0 && (
              <div className="card" style={{ padding: 16, marginBottom: 24, background: C.card2 }}>
                <p style={{ fontSize: 13.5, lineHeight: 1.5 }}><Ico name={CAT_ICO[bestCat[0]]} size={14} color={C.green} style={{ verticalAlign: "-2px" }} /> {CATS[bestCat[0]].label} dares give you the most energy so far. The generator knows.</p>
              </div>
            )}
            <p className="lbl" style={{ marginBottom: 14 }}>Badges — {badges.length} / {BADGES.length}</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginBottom: 12 }}>
              {BADGES.map((b) => {
                const got = badges.includes(b.id);
                return (
                  <div key={b.id} style={{ textAlign: "center", opacity: got ? 1 : 0.32 }} title={b.how}>
                    <div style={{ width: 52, height: 52, margin: "0 auto 6px", borderRadius: 99, border: `1px solid ${got ? C.gold + "66" : C.line}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, boxShadow: got ? `0 0 20px -8px ${C.gold}` : "none" }}><Ico name={b.ico} size={20} color={got ? C.gold : C.faint} sw={1.4} /></div>
                    <p style={{ fontSize: 9.5, color: got ? C.text : C.faint, lineHeight: 1.25 }}>{b.name}</p>
                  </div>
                );
              })}
            </div>
          </div>
          <Nav tab="progress" go={setScreen} />
        </div>
      </div>
    );
  }

  /* --------------------------- YOU -------------------------- */
  const lvlFrac = (xp % 200) / 200;
  const RY = 34, CY = 2 * Math.PI * RY;
  const catList = Object.entries(catCounts).sort((a, b) => b[1] - a[1]);
  const maxCat = catList.length ? catList[0][1] : 1;
  const bestFb = Object.entries(feedback).sort((a, b) => b[1] - a[1])[0];
  return (
    <div className="dare-root"><style>{CSS}</style>
      <div style={wrap}>
        <div style={pad}>
          <p className="lbl" style={{ marginBottom: 20 }}>You</p>

          {/* identity + level ring */}
          <div style={{ display: "flex", gap: 18, alignItems: "center", marginBottom: 22 }}>
            <div style={{ position: "relative", width: 84, height: 84, flexShrink: 0 }}>
              <svg width="84" height="84" style={{ transform: "rotate(-90deg)" }}>
                <circle cx="42" cy="42" r={RY} fill="none" stroke={C.line} strokeWidth="3" />
                <circle cx="42" cy="42" r={RY} fill="none" stroke={C.gold} strokeWidth="3" strokeLinecap="round"
                  strokeDasharray={CY} strokeDashoffset={CY * (1 - lvlFrac)} />
              </svg>
              <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <span className="serif" style={{ fontSize: 26, lineHeight: 1 }}>{level}</span>
                <span className="lbl" style={{ fontSize: 7.5 }}>Level</span>
              </div>
            </div>
            <div>
              <h2 className="serif" style={{ fontSize: 26, lineHeight: 1.15 }}>Someone who<br />moves daily.</h2>
              <p style={{ fontSize: 12, color: C.dim, marginTop: 6 }}>{xp.toLocaleString()} XP · {200 - (xp % 200)} to level {level + 1}</p>
            </div>
          </div>

          {/* stats grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 22 }}>
            {[[done, "dares", C.green], [streak, "day streak", C.coral], [badges.length, "badges", C.gold]].map(([v, k, col], i) => (
              <div key={i} className="card" style={{ padding: "14px 8px", textAlign: "center" }}>
                <p className="serif" style={{ fontSize: 28, color: col }}>{v}</p>
                <p className="lbl" style={{ fontSize: 8.5, marginTop: 2 }}>{k}</p>
              </div>
            ))}
          </div>

          {/* your patterns */}
          {catList.length > 0 && (
            <div className="card" style={{ padding: 18, marginBottom: 14 }}>
              <p className="lbl" style={{ marginBottom: 14 }}>Your patterns</p>
              {catList.slice(0, 5).map(([cat, n]) => (
                <div key={cat} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                  <span style={{ width: 20, display: "flex" }}><Ico name={CAT_ICO[cat]} size={15} color={CATS[cat].color} sw={1.4} /></span>
                  <span style={{ width: 76, fontSize: 12, color: C.dim }}>{CATS[cat].label}</span>
                  <div style={{ flex: 1, height: 3, background: C.line, borderRadius: 99 }}>
                    <div style={{ height: 3, width: `${(n / maxCat) * 100}%`, background: CATS[cat].color, borderRadius: 99, opacity: 0.8 }} />
                  </div>
                  <span style={{ fontSize: 11, color: C.faint, width: 18, textAlign: "right" }}>{n}</span>
                </div>
              ))}
              {bestFb && bestFb[1] > 0 && (
                <p style={{ fontSize: 12.5, color: C.dim, marginTop: 12, lineHeight: 1.5 }}>
                  <Ico name={CAT_ICO[bestFb[0]]} size={14} color={C.green} style={{ verticalAlign: "-2px" }} /> {CATS[bestFb[0]].label} is what actually gives you energy. The generator leans on this.
                </p>
              )}
            </div>
          )}

          {/* today's card */}
          {card && (
            <div className="card" style={{ padding: "14px 18px", marginBottom: 14, borderColor: C.gold + "33", display: "flex", gap: 12, alignItems: "center" }}>
              <TarotArt id={card.id} size={26} />
              <p style={{ fontSize: 12.5, color: C.dim }}><span style={{ color: C.gold }}>{card.num} · {card.name}</span> is your card today.</p>
            </div>
          )}

          {/* current journey */}
          <div className="card" style={{ padding: 18, marginBottom: 14 }}>
            <p className="lbl" style={{ marginBottom: 6 }}>Current journey</p>
            <p className="serif" style={{ fontSize: 20, color: journey.color }}>{journey.sym} {journey.name}</p>
            <p style={{ fontSize: 12.5, color: C.dim, marginTop: 3 }}>Chapter {chapter.n} — {chapter.name} · {jd} dares in</p>
          </div>

          {/* manifesto */}
          <div className="card" style={{ padding: 18, marginBottom: 26, background: C.card2 }}>
            <p className="serif" style={{ fontStyle: "italic", fontSize: 17, lineHeight: 1.55, color: C.dim }}>
              DARE is not a trainer. It is a Chief Energy Officer: one decision removed, one action begun, every day.
            </p>
          </div>

          <div style={{ textAlign: "center", display: "flex", flexDirection: "column", gap: 12 }}>
            <button className="link" onClick={() => setAway(true)}>(demo) simulate days away</button>
            <button className="link" onClick={() => { setScreen("onboarding"); setObIdx(0); }}>Replay onboarding</button>
            <button className="link" style={{ color: C.coral }} onClick={resetDemo}>Reset demo data</button>
          </div>
          <p style={{ fontSize: 11, color: C.faint, textAlign: "center", marginTop: 26 }}>Prototype — state lives in memory. The production build persists to localStorage.</p>
        </div>
        <Nav tab="you" go={setScreen} />
      </div>
    </div>
  );
}
