import type { Chapter, Journey, MilestoneType } from "../types";
import { C } from "./colors";

/* ============================================================
   JOURNEYS — cada Journey es un sprint de 7 días.
   Nombres evocadores (no "Start"/"Energy"/"Focus").
   The Ember e Iron Quiet están totalmente implementados;
   Still Water queda como placeholder (sin plan).
   Los ids de milestone son estables → persisten en store.milestones.
   ============================================================ */

/** Etiqueta + icono por tipo de milestone (para la UI). */
export const MS_T: Record<MilestoneType, { label: string; ico: string }> = {
  letter: { label: "Letter", ico: "letter" },
  goal: { label: "Dare Goal", ico: "goal" },
  action: { label: "One-time Action", ico: "bolt" },
  motivator: { label: "Motivator", ico: "bulb" },
  science: { label: "Science", ico: "moon" },
};

export const JOURNEYS: Journey[] = [
  // ======================= 01 — THE EMBER =======================
  {
    id: "ember",
    name: "The Ember",
    sym: "spark",
    color: C.green,
    tag: "Real energy, rebuilt daily.",
    problem: "I can't get myself to start.",
    promise: "Start before you feel ready.",
    lesson: "You don't need motivation. You need a smaller first step.",
    bias: ["walk", "forest", "small"],
    identity: { id: "starter", name: "Starter", line: "Starts before feeling ready." },
    dreamPrompt: "What would make finishing this Journey feel worth it?",
    dreamOptions: [
      { id: "painting", emoji: "🎨", label: "Painting class" },
      { id: "fitbit", emoji: "⌚", label: "Fitbit Air" },
      { id: "massage", emoji: "💆", label: "Massage" },
      { id: "sephora", emoji: "💄", label: "Sephora €30" },
      { id: "book", emoji: "📚", label: "New book" },
      { id: "trainers", emoji: "👟", label: "New trainers" },
      { id: "dinner", emoji: "🍽️", label: "Dinner somewhere nice" },
      { id: "custom", emoji: "✍️", label: "Create my own", custom: true },
    ],
    chapters: [
      {
        n: "I", name: "Strike the Match", sym: "spark", goal: "Make the first action tiny.", days: [1, 1],
        milestones: [
          { id: "ember-1-letter", t: "letter", title: "You don't have a motivation problem", body: "You've been told to find motivation. It rarely shows up on time. But you don't have a motivation problem — you have a starting problem. The first minute is the whole battle. DARE removes the decision so all that's left is the smallest possible first step. Take it, and the rest tends to follow." },
          { id: "ember-1-goal", t: "goal", title: "Complete one 3-minute Dare", goalHint: "Start a check-in — we'll give you a 3-minute Small Dare." },
          { id: "ember-1-motivator", t: "motivator", title: "The first minute is the whole battle", body: "Resistance is loudest before you move and quietest once you have. You don't need to win the day — just the first minute. Everything after it is easier than it looked from the couch." },
        ],
      },
      {
        n: "II", name: "Leave the Door", sym: "forest", goal: "Remove negotiation.", days: [2, 3],
        milestones: [
          { id: "ember-2-letter", t: "letter", title: "The door is the hardest part", body: "Not the walk. Not the weather. The door. Once you're outside, staying out is easy — it's crossing the threshold your brain fights. So make the door the only decision. Shoes, door, done. The rest is just walking." },
          { id: "ember-2-action", t: "action", title: "Lay out tomorrow's shoes", action: "text", body: "Put tomorrow's shoes by the door tonight. Tiny friction removed now is a Dare completed later." },
          { id: "ember-2-goal", t: "goal", title: "Complete one outside Dare", goalHint: "Check in from outside, or choose a destination — we'll send you out." },
          { id: "ember-2-science", t: "science", title: "Why daylight and walking change your state", scienceId: "daylight" },
        ],
      },
      {
        n: "III", name: "Find the Rhythm", sym: "rhythm", goal: "Repeat without forcing.", days: [4, 5],
        milestones: [
          { id: "ember-3-letter", t: "letter", title: "Rhythm beats intensity", body: "You don't need a hard day. You need a repeatable one. Rhythm is what turns a few good days into an identity. Keep the bar low enough that tomorrow is never in doubt." },
          { id: "ember-3-action", t: "action", title: "Build your Companion Shelf", action: "companionShelf", body: "Name the podcast, series, playlist and album that make movement enjoyable. DARE will pair them with your Dares." },
          { id: "ember-3-goal", t: "goal", title: "Use two different Companion types", goalHint: "Complete two Dares with different companions (e.g. a podcast walk and a series-and-strength)." },
          { id: "ember-3-goal2", t: "goal", title: "Give energy feedback twice", goalHint: "After a Dare, answer 'More energy than before?' — do it twice." },
          { id: "ember-3-motivator", t: "motivator", title: "Small wins build self-trust", body: "Every kept promise, however small, is a vote for the person you're becoming. Self-trust is not a feeling — it's a track record." },
        ],
      },
      {
        n: "IV", name: "Proof of Fire", sym: "dream", goal: "Convert action into identity.", days: [6, 7],
        milestones: [
          { id: "ember-4-letter", t: "letter", title: "You are collecting proof", body: "Seven days ago you waited for motivation. Now you have evidence: a Proof Library that says you start. That's the whole game. Identity isn't declared — it's accumulated." },
          { id: "ember-4-goal", t: "goal", title: "Complete your fifth Dare", goalHint: "Keep going — your fifth completed Dare closes this chapter." },
          { id: "ember-4-goal2", t: "goal", title: "Complete one Dare when energy is low", goalHint: "On a low day, use the 3-minute version — it still counts." },
          { id: "ember-4-action", t: "action", title: "Write one line: what changed?", action: "text", body: "One line. What's different after seven days? Save it — it's the first entry in who you're becoming." },
          { id: "ember-4-motivator", t: "motivator", title: "Identity is a vote count", body: "You don't become someone who starts by deciding it. You become it by starting, again, until the evidence is undeniable." },
        ],
      },
    ],
    plan: [
      { day: 1, title: "Just Start", cat: "small", dareId: "out-the-door" },
      { day: 2, title: "Movement Creates Energy", cat: "walk", dareId: "podcast-mile" },
      { day: 3, title: "Leave the Door", cat: "walk", dareId: "leave-door" },
      { day: 4, title: "First Strength", cat: "dumbbells", dareId: "iron-first-weight" },
      { day: 5, title: "Rhythm", cat: "walk" },
      { day: 6, title: "Low Energy Proof", cat: "small" },
      { day: 7, title: "Proof of Fire", cat: "forest", chapter: true, dream: true },
    ],
  },

  // ======================= 02 — IRON QUIET =======================
  {
    id: "iron",
    name: "Iron Quiet",
    sym: "strength",
    color: C.coral,
    tag: "Strength without noise.",
    problem: "I want to feel stronger, but exercise feels boring and mentally heavy.",
    promise: "Build strength without turning it into another obligation.",
    lesson: "Muscle is energy stored in the body.",
    bias: ["dumbbells", "carry", "tabata", "fitboxing", "padel", "pool"],
    identity: { id: "builder", name: "Builder", line: "Uses strength to create energy." },
    dreamPrompt: "What would feeling stronger be worth?",
    dreamOptions: [
      { id: "top", emoji: "🎽", label: "New training top" },
      { id: "fitbit", emoji: "⌚", label: "Fitbit Air" },
      { id: "massage", emoji: "💆", label: "Massage" },
      { id: "padel", emoji: "🎾", label: "Padel class" },
      { id: "sephora", emoji: "💄", label: "Sephora €30" },
      { id: "swimsuit", emoji: "🩱", label: "New swimsuit" },
      { id: "headphones", emoji: "🎧", label: "New headphones" },
      { id: "custom", emoji: "✍️", label: "Create my own", custom: true },
    ],
    chapters: [
      {
        n: "I", name: "First Weight", sym: "strength", goal: "Remove friction around dumbbells.", days: [1, 1],
        milestones: [
          { id: "iron-1-letter", t: "letter", title: "Strength is not a workout. It is a signal.", body: "Every time you lift, your body gets a message: this system is worth maintaining. You're not chasing a look or burning anything. You're telling your body to keep the lights on. Twelve minutes is enough to send the signal." },
          { id: "iron-1-action", t: "action", title: "Put your dumbbells where you can see them", action: "text", body: "Out of the cupboard, into the room you live in. Visible weights get lifted. Hidden ones don't." },
          { id: "iron-1-goal", t: "goal", title: "Complete one 12-minute strength Dare", goalHint: "Check in at home — we'll give you a standing dumbbell Dare." },
          { id: "iron-1-science", t: "science", title: "Why muscle supports long-term energy", scienceId: "muscle-energy" },
        ],
      },
      {
        n: "II", name: "Make It Play", sym: "strong", goal: "Make exercise feel fun, not homework.", days: [2, 3],
        milestones: [
          { id: "iron-2-letter", t: "letter", title: "Play counts as training", body: "The best training is the kind you'd do anyway. Water, a bag to hit, a game with a friend. If it doesn't feel like homework, you'll come back. That's the whole strategy." },
          { id: "iron-2-action", t: "action", title: "Create your Boss Playlist", action: "bossPlaylist", body: "The one that makes you feel unstoppable. Name it, pick the platform, choose the first song. It's the soundtrack to your Tabatas." },
          { id: "iron-2-goal", t: "goal", title: "Complete one standing tabata", goalHint: "8 minutes, standing — check in with energy 5+ at home." },
          { id: "iron-2-goal2", t: "goal", title: "Complete one water / pool or play-based Dare", goalHint: "Choose Pool or Padel as your destination in the check-in." },
          { id: "iron-2-science", t: "science", title: "Why short intensity works", scienceId: "tabata" },
        ],
      },
      {
        n: "III", name: "Load the Body", sym: "forge", goal: "Add real stimulus without overwhelming.", days: [4, 5],
        milestones: [
          { id: "iron-3-letter", t: "letter", title: "Muscle is a battery, not a look", body: "Forget the mirror. Muscle is active tissue that stores energy, steadies your glucose, holds your posture and keeps you resilient as you age. You're charging a battery, not decorating a shelf." },
          { id: "iron-3-goal", t: "goal", title: "Complete two strength Dares", goalHint: "Two strength or carry Dares this chapter." },
          { id: "iron-3-goal2", t: "goal", title: "Complete one Strong Dare", goalHint: "When energy is high, take a Strong-level Dare." },
          { id: "iron-3-motivator", t: "motivator", title: "Strong does not need to be loud", body: "You don't have to grunt, post, or suffer. Quiet, consistent strength outlasts the loud kind every time." },
          { id: "iron-3-science", t: "science", title: "Strength, confidence and the brain", scienceId: "dumbbells" },
        ],
      },
      {
        n: "IV", name: "Quiet Power", sym: "dream", goal: "Convert exercise into identity.", days: [6, 7],
        milestones: [
          { id: "iron-4-letter", t: "letter", title: "Quiet power is still power", body: "You didn't become stronger by doing more. You became stronger by making it easier to start. That's a skill that outlasts any program." },
          { id: "iron-4-goal", t: "goal", title: "Complete your favourite strength-related Dare", goalHint: "Pick the one that gave you the most energy and repeat it." },
          { id: "iron-4-action", t: "action", title: "Write one line: what felt stronger?", action: "text", body: "One line. What feels stronger than a week ago — body, or the ease of starting?" },
          { id: "iron-4-motivator", t: "motivator", title: "You are building a body that gives energy back", body: "The work compounds. Every session is a deposit into a body that returns energy, steadier moods and quiet confidence." },
        ],
      },
    ],
    plan: [
      { day: 1, title: "First Weight", cat: "dumbbells", dareId: "iron-first-weight" },
      { day: 2, title: "Water Energy", cat: "pool", dareId: "water-reset" },
      { day: 3, title: "Micro Tabata", cat: "tabata", dareId: "micro-tabata" },
      { day: 4, title: "Downstairs Power", cat: "fitboxing", dareId: "shadow-rounds" },
      { day: 5, title: "Carry Strength", cat: "carry", dareId: "carry-strength" },
      { day: 6, title: "Active Recovery", cat: "recovery" },
      { day: 7, title: "Quiet Power", cat: "dumbbells", chapter: true, dream: true },
    ],
  },

  // ======================= 03 — STILL WATER (placeholder) =======================
  {
    id: "water",
    name: "Still Water",
    sym: "calm",
    color: C.purple,
    tag: "A quieter head, a looser body.",
    problem: "My body is tense and my head won't slow down.",
    promise: "A calmer nervous system, one small reset at a time.",
    lesson: "Calm is a skill you practise, not a mood you wait for.",
    bias: ["recovery", "focus", "pool", "forest"],
    identity: { id: "calm-maker", name: "Calm Maker", line: "Chooses calm over spiraling." },
    dreamPrompt: "What would a quieter head be worth?",
    dreamOptions: [
      { id: "massage", emoji: "💆", label: "Massage" },
      { id: "spa", emoji: "🛁", label: "Spa afternoon" },
      { id: "book", emoji: "📚", label: "New book" },
      { id: "custom", emoji: "✍️", label: "Create my own", custom: true },
    ],
    chapters: [
      { n: "I", name: "Unclench", sym: "soft", goal: "Let the shoulders drop.", days: [1, 2], milestones: [] },
      { n: "II", name: "The Slow Return", sym: "water", goal: "Come back to the body.", days: [3, 4], milestones: [] },
      { n: "III", name: "Deep Water", sym: "calm", goal: "Float. Breathe. Repeat.", days: [5, 6], milestones: [] },
      { n: "IV", name: "Clear", sym: "focus", goal: "Calm as a default.", days: [7, 7], milestones: [] },
    ],
    plan: [], // placeholder — sin plan aún
  },
];

export const SPRINT_DAYS = 7;

export function journeyById(id: string): Journey {
  return JOURNEYS.find((j) => j.id === id) ?? JOURNEYS[0];
}

/** Capítulo activo dado el nº de días completados (0-index de día = progreso). */
export function chapterOf(j: Journey, daysDone: number): Chapter & { idx: number } {
  const dayNum = Math.min(SPRINT_DAYS, daysDone + 1); // el día "en curso"
  const idx = Math.max(
    0,
    j.chapters.findIndex((c) => dayNum >= c.days[0] && dayNum <= c.days[1]),
  );
  return { ...j.chapters[idx], idx };
}

/** Total de milestones de un Journey (para el % de completion). */
export function totalMilestones(j: Journey): number {
  return j.chapters.reduce((n, c) => n + c.milestones.length, 0);
}
