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
    text: "Walking increases blood flow and may support mood and cognitive function. Outdoors, daylight also helps anchor your circadian rhythm, which influences alertness and cortisol patterns. The point is to change your state, not to exhaust you.",
    evidence: "Strong",
    effects: { Energy: 2, Mood: 2, Focus: 1 },
    longTerm: "Regular walking is associated with better cardiovascular and cognitive health over time.",
  },
  {
    id: "daylight",
    category: "Daylight",
    title: "Daylight sets your clock",
    text: "Daylight, especially early, helps anchor your circadian rhythm — the internal clock that shapes alertness, sleep timing and daily cortisol patterns. Research suggests morning light may support daytime energy and better sleep at night.",
    evidence: "Strong",
    effects: { Energy: 2, Mood: 2, Calm: 1 },
  },
  {
    id: "strength-training",
    category: "Strength training",
    title: "Strength is a signal, not a workout",
    text: "Strength training recruits muscle tissue and improves neuromuscular coordination, and can support insulin sensitivity over time. It also gives the brain a clear effort → control → completion loop, which is associated with self-efficacy.",
    evidence: "Strong",
    effects: { Strength: 3, Confidence: 3, Energy: 2, Mood: 2 },
    longTerm: "Muscle supports strength, posture, glucose metabolism and resilience as you age.",
  },
  {
    id: "dumbbells",
    category: "Dumbbells",
    title: "Weights give your brain feedback",
    text: "Lifting gives your brain clear feedback: effort, control, completion. That loop is associated with confidence and self-efficacy, and working muscle tissue can help energy feel more stable over time — especially on days when motivation is low.",
    evidence: "Moderate",
    effects: { Strength: 3, Confidence: 3, Energy: 2 },
  },
  {
    id: "music-effort",
    category: "Music and perceived effort",
    title: "Music lowers perceived effort",
    text: "Research suggests music you enjoy can lower perceived effort — how hard movement feels — and make it easier to keep going. The physical effort is the same; your brain just negotiates less.",
    evidence: "Moderate",
    effects: { Energy: 2, Mood: 2 },
  },
  {
    id: "nature",
    category: "Nature exposure",
    title: "Why the pines work on you",
    text: "Nature exposure is associated with lower perceived stress and reduced mental fatigue. Fewer urban inputs may help the nervous system shift toward parasympathetic (calmer) activity and support attention recovery.",
    evidence: "Moderate",
    effects: { Calm: 3, Mood: 2, Focus: 1 },
  },
  {
    id: "breath-recovery",
    category: "Breath / recovery",
    title: "Recovery is part of the work",
    text: "Slow breathing can encourage parasympathetic activation and is associated with higher heart rate variability, one marker of a calmer nervous system. Recovery is where the body adapts — it gets stronger between efforts, not only during them.",
    evidence: "Moderate",
    effects: { Calm: 3, Recovery: 3, Mood: 1 },
  },
  {
    id: "swimming",
    category: "Swimming / water",
    title: "Water reduces impact and resets input",
    text: "Water reduces joint impact and changes sensory input. Swimming combines rhythmic breathing, full-body movement and parasympathetic recovery cues, which may support calm and recovery without the harsh feeling of a typical workout.",
    evidence: "Moderate",
    effects: { Calm: 3, Recovery: 3, Energy: 1, Mood: 2 },
  },
  {
    id: "padel",
    category: "Social play / padel",
    title: "Play counts as training",
    text: "Social, playful movement combines effort with connection. It can raise heart rate while it lifts mood, and is associated with better adherence — activity feels like something you get to do, not something you have to.",
    evidence: "Emerging",
    effects: { Energy: 2, Mood: 3, Confidence: 1 },
  },
  {
    id: "tabata",
    category: "Tabata / short intervals",
    title: "Short intervals, before your brain negotiates",
    text: "Short intervals raise heart rate quickly and can improve cardiovascular fitness over time. Brief intensity may also increase endorphins and perceived energy — and the session ends before your brain has time to negotiate.",
    evidence: "Moderate",
    effects: { Energy: 3, Mood: 2, Strength: 2, Focus: 2 },
  },
  {
    id: "fitboxing",
    category: "Fitboxing / boxing-style movement",
    title: "Turn stress into movement",
    text: "Boxing-style movement combines coordination, rhythm and intensity. It can raise heart rate, support endorphin release and convert stress into controlled physical action rather than mental overload.",
    evidence: "Emerging",
    effects: { Energy: 3, Mood: 3, Confidence: 2 },
  },
  {
    id: "carries",
    category: "Carries / functional strength",
    title: "Pick things up, carry them",
    text: "Carries load muscle tissue and challenge grip, posture and core — no floor work needed. They are simple, hard to do wrong, and translate directly to real life, which supports both strength and confidence.",
    evidence: "Moderate",
    effects: { Strength: 3, Confidence: 2, Energy: 2 },
  },
  {
    id: "tiny-actions",
    category: "Tiny actions and self-efficacy",
    title: "The first minute is the whole battle",
    text: "Starting is the hardest part. Small actions can lower resistance and build self-efficacy — each small win is evidence that you are someone who starts, which over time makes the next start easier.",
    evidence: "Moderate",
    effects: { Energy: 1, Confidence: 2, Mood: 1 },
  },
  {
    id: "behavioral-activation",
    category: "Behavioral activation",
    title: "Action first, motivation second",
    text: "Behavioral activation research suggests the action can come before the mood to do it. You don't wait to feel ready — engaging with a small, defined task can lift mood and executive function, and the readiness tends to follow.",
    evidence: "Strong",
    effects: { Energy: 2, Mood: 2, Confidence: 1 },
  },
  {
    id: "muscle-energy",
    category: "Muscle and long-term energy",
    title: "Muscle is a battery, not a look",
    text: "Muscle is active tissue, not decoration. It supports strength and posture and plays a role in glucose metabolism and insulin sensitivity, which may help energy feel steadier as you age.",
    evidence: "Strong",
    effects: { Strength: 3, Energy: 2 },
    longTerm: "More muscle is associated with more stable energy and healthier aging.",
  },
  {
    id: "brain-movement",
    category: "Brain and movement",
    title: "Movement moves the mind",
    text: "Movement increases blood flow and is associated with better attention, mood and executive function. Research also links regular activity to BDNF, a protein involved in learning. Today's Dare is designed to change your state, not exhaust you.",
    evidence: "Strong",
    effects: { Focus: 2, Mood: 2, Energy: 2 },
  },
  {
    id: "low-energy",
    category: "Tiny actions and self-efficacy",
    title: "Low-energy days still count",
    text: "On low-energy days, the goal is not performance. Small actions protect self-efficacy and keep the nervous system from associating movement with overwhelm — so momentum stays alive without cost.",
    evidence: "Moderate",
    effects: { Mood: 1, Confidence: 1 },
  },
];

export function findScience(id: string | undefined | null): Science | undefined {
  if (!id) return undefined;
  return SCIENCE.find((s) => s.id === id);
}
