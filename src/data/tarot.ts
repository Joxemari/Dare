import type { TarotCard } from "../types";

/* Major Arcana — los 22. Voice: Co-Star — blunt, dry, applicable.
   El `id` es también el nombre del WebP en `public/arcana/{id}.webp` (ver
   CLAUDE.md): minúscula, una sola palabra, sin espacios. */
export const TAROT: TarotCard[] = [
  { id: "fool", num: "0", name: "The Fool", msg: "You don't need a plan to take a first step. Overpreparing is a form of hiding. Start before you feel ready — readiness is a byproduct, not a prerequisite." },
  { id: "magician", num: "I", name: "The Magician", msg: "Everything you need is already within reach: shoes, water, twenty minutes. The gap between wanting and doing is one gesture. Make it." },
  { id: "priestess", num: "II", name: "The High Priestess", msg: "You already know the answer; you're just waiting for a permission that isn't coming. Stop polling everyone. The quiet voice was right the first time." },
  { id: "empress", num: "III", name: "The Empress", msg: "Growth isn't forced, it's fed. Tend one thing today — your body, a habit, a person — without demanding a return. Care compounds quietly." },
  { id: "emperor", num: "IV", name: "The Emperor", msg: "Freedom is built on structure, not the absence of it. Set one boundary and actually hold it. Discipline is just keeping promises you made to yourself." },
  { id: "hierophant", num: "V", name: "The Hierophant", msg: "You don't have to invent everything from scratch. Someone already solved this. Learn the rules properly before you decide which one to break." },
  { id: "lovers", num: "VI", name: "The Lovers", msg: "This isn't about romance, it's about choosing. Two paths, and picking neither is also a choice — the worst one. Name what you value, then move like you mean it." },
  { id: "chariot", num: "VII", name: "The Chariot", msg: "Direction beats intensity. Pick one thing and drag it across the line, even slowly. Momentum is steering, not speed." },
  { id: "strength", num: "VIII", name: "Strength", msg: "Force is loud; strength is quiet. Do the hard thing gently, without drama, without an audience. That is what endurance actually looks like." },
  { id: "hermit", num: "IX", name: "The Hermit", msg: "Solitude is not withdrawal — it's maintenance. Take the walk alone. What you're looking for tends to appear when nobody is watching." },
  { id: "wheel", num: "X", name: "Wheel of Fortune", msg: "You don't control the day you were dealt. You control the next thirty minutes. Spend them like they're the only ones that count — statistically, they are." },
  { id: "justice", num: "XI", name: "Justice", msg: "Outcomes are just decisions wearing their consequences. Own your part honestly — no more, no less. Balance is restored by action, not by apology." },
  { id: "hanged", num: "XII", name: "The Hanged Man", msg: "Stuck is a perspective problem, not a capability problem. Stop pushing the same door. Invert one small thing and watch the problem change shape." },
  { id: "death", num: "XIII", name: "Death", msg: "Endings are logistics, not tragedies. Drop one habit, excuse or plan that expired weeks ago. Whatever you keep alive artificially is billing you in energy." },
  { id: "temperance", num: "XIV", name: "Temperance", msg: "Today is not for extremes. Mix effort with ease inside the same hour. The sustainable version of you outperforms the heroic one over any distance that matters." },
  { id: "devil", num: "XV", name: "The Devil", msg: "The chains are looser than you pretend; you just haven't walked. Name the thing you keep returning to that quietly costs you. Awareness is the first cut." },
  { id: "tower", num: "XVI", name: "The Tower", msg: "If the routine collapsed, good — it was load-bearing on excuses. Build the next version smaller and truer. One brick today is enough." },
  { id: "star", num: "XVII", name: "The Star", msg: "Recovery counts as progress. Refill quietly: water, air, one slow thing. Hope is a practice with logistics, not a mood." },
  { id: "moon", num: "XVIII", name: "The Moon", msg: "Not everything you feel is true. Fear inflates in the dark. Take one step anyway — clarity comes from walking, not from waiting for the fog to lift." },
  { id: "sun", num: "XIX", name: "The Sun", msg: "Take the win at face value. Go outside, do the simple thing, let it be enough. Not everything meaningful has to be difficult." },
  { id: "judgement", num: "XX", name: "Judgement", msg: "Stop relitigating who you used to be. That version served its purpose. Answer the call in front of you now — the past doesn't get a vote." },
  { id: "world", num: "XXI", name: "The World", msg: "Something is actually finished. Let it be complete before you sprint to the next thing. Close the loop, take the lap, then begin again." },
];
