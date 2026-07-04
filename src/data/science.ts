import type { Science } from "../types";

/* ============================================================
   Biblioteca de ciencia — "Science Behind Today's Dare".
   Reglas (spec): nada de neurociencia falsa, nada de "dopamine
   hack", nada de claims médicos. Lenguaje prudente:
   "research suggests", "may support", "can help", "is associated
   with", "over time".
   ============================================================ */
export const SCIENCE: Science[] = [
  {
    id: "walking-outdoors",
    category: "Walking outdoors",
    title: "Walking outdoors changes your state",
    text: "Walking, especially outdoors, can support alertness and mood. Research suggests that gentle movement helps interrupt avoidance loops — the point is to change your state, not to exhaust you.",
    evidence: "Strong",
    effects: { Energy: 2, Mood: 2, Focus: 1 },
    longTerm: "Regular walking is associated with better cardiovascular and cognitive health over time.",
  },
  {
    id: "daylight",
    category: "Daylight",
    title: "Daylight sets your clock",
    text: "Getting daylight early can help regulate your body clock, which may support alertness during the day and better sleep at night.",
    evidence: "Strong",
    effects: { Energy: 2, Mood: 2, Calm: 1 },
  },
  {
    id: "strength-training",
    category: "Strength training",
    title: "Strength is a signal, not a workout",
    text: "Strength training can support mood, confidence and long-term metabolic health. Building muscle also improves the body's ability to store and use glucose, which may help energy feel more stable over time.",
    evidence: "Strong",
    effects: { Strength: 3, Confidence: 3, Energy: 2, Mood: 2 },
    longTerm: "Muscle supports strength, posture, glucose metabolism and resilience as you age.",
  },
  {
    id: "dumbbells",
    category: "Dumbbells",
    title: "Weights give your brain feedback",
    text: "Lifting weights gives your brain clear feedback: effort, control, completion. That loop can support confidence and self-efficacy, especially on days when motivation is low.",
    evidence: "Moderate",
    effects: { Strength: 3, Confidence: 3, Energy: 2 },
  },
  {
    id: "music-effort",
    category: "Music and perceived effort",
    title: "Music lowers perceived effort",
    text: "Listening to music you like can lower how hard movement feels and make it easier to keep going. The effort is the same; your brain just negotiates less.",
    evidence: "Moderate",
    effects: { Energy: 2, Mood: 2 },
  },
  {
    id: "nature",
    category: "Nature exposure",
    title: "Why the pines work on you",
    text: "Time among trees is associated with lower stress and a calmer nervous system. Nature exposure can support attention recovery and mood.",
    evidence: "Moderate",
    effects: { Calm: 3, Mood: 2, Focus: 1 },
  },
  {
    id: "breath-recovery",
    category: "Breath / recovery",
    title: "Recovery is part of the work",
    text: "Slow breathing and gentle mobility can help shift the body out of a stressed state. Recovery supports adaptation — the body gets stronger between efforts, not only during them.",
    evidence: "Moderate",
    effects: { Calm: 3, Recovery: 3, Mood: 1 },
  },
  {
    id: "swimming",
    category: "Swimming / water",
    title: "Water reduces impact and resets input",
    text: "Water reduces impact and changes sensory input. Swimming can support recovery, calm and full-body conditioning without the harsh feeling of a typical workout.",
    evidence: "Moderate",
    effects: { Calm: 3, Recovery: 3, Energy: 1, Mood: 2 },
  },
  {
    id: "padel",
    category: "Social play / padel",
    title: "Play counts as training",
    text: "Social, playful movement combines effort with connection. It can support mood and make activity feel like something you get to do, not something you have to do.",
    evidence: "Emerging",
    effects: { Energy: 2, Mood: 3, Confidence: 1 },
  },
  {
    id: "tabata",
    category: "Tabata / short intervals",
    title: "Short intervals, before your brain negotiates",
    text: "Short intervals can improve cardiovascular fitness without requiring a long workout. For low-motivation days, the benefit is psychological too: the session ends before your brain has time to negotiate.",
    evidence: "Moderate",
    effects: { Energy: 3, Mood: 2, Strength: 2, Focus: 2 },
  },
  {
    id: "fitboxing",
    category: "Fitboxing / boxing-style movement",
    title: "Turn stress into movement",
    text: "Boxing-style movement combines coordination, rhythm, intensity and stress release. It can help shift the body from mental overload into physical action.",
    evidence: "Emerging",
    effects: { Energy: 3, Mood: 3, Confidence: 2 },
  },
  {
    id: "carries",
    category: "Carries / functional strength",
    title: "Pick things up, carry them",
    text: "Carries build functional strength, grip, posture and core without any floor work. They are simple, hard to do wrong, and translate directly to real life.",
    evidence: "Moderate",
    effects: { Strength: 3, Confidence: 2, Energy: 2 },
  },
  {
    id: "tiny-actions",
    category: "Tiny actions and self-efficacy",
    title: "The first minute is the whole battle",
    text: "Starting is the hardest part. Tiny actions can lower resistance and build self-efficacy — each small win is evidence that you are someone who starts.",
    evidence: "Moderate",
    effects: { Energy: 1, Confidence: 2, Mood: 1 },
  },
  {
    id: "behavioral-activation",
    category: "Behavioral activation",
    title: "Action first, motivation second",
    text: "Behavioral activation research suggests that doing the action can come before the mood to do it. You don't wait to feel ready — the readiness follows the action.",
    evidence: "Strong",
    effects: { Energy: 2, Mood: 2, Confidence: 1 },
  },
  {
    id: "muscle-energy",
    category: "Muscle and long-term energy",
    title: "Muscle is a battery, not a look",
    text: "Muscle is not just about appearance. It is active tissue that supports strength, posture, glucose metabolism and resilience as you age.",
    evidence: "Strong",
    effects: { Strength: 3, Energy: 2 },
    longTerm: "More muscle is associated with more stable energy and healthier aging.",
  },
  {
    id: "brain-movement",
    category: "Brain and movement",
    title: "Movement moves the mind",
    text: "Movement increases blood flow and can support attention, mood and cognitive performance. Today's Dare is designed to change your state, not exhaust you.",
    evidence: "Strong",
    effects: { Focus: 2, Mood: 2, Energy: 2 },
  },
  {
    id: "low-energy",
    category: "Tiny actions and self-efficacy",
    title: "Low-energy days still count",
    text: "On low-energy days, the goal is not performance. The goal is to preserve identity: you are still someone who starts. Small actions keep momentum alive.",
    evidence: "Moderate",
    effects: { Mood: 1, Confidence: 1 },
  },
];

export function findScience(id: string | undefined | null): Science | undefined {
  if (!id) return undefined;
  return SCIENCE.find((s) => s.id === id);
}
