import type { Cat, Companion, CompanionCategory, CompanionVibe } from "../types";

/* ============================================================
   COMPANIONS — datos de dominio, sin lógica.

   Companion = recompensa DURANTE el Dare (temptation bundling):
   se emparejan el esfuerzo ("deberías") con un placer ("quieres")
   para que la actividad sea menos aburrida y más deseable. NO son
   personajes ni decoración: son el anzuelo. Regla dura del
   producto: el companion ocurre DURANTE la acción, nunca antes.

   La lógica (clasificar, resolver, rotar por fecha, sesgar el
   generador según el vibe) vive en `lib/companions.ts`. Aquí solo
   el catálogo y la configuración de los vibes.
   ============================================================ */

/* Catálogo de companions concretos y accionables. `word` alimenta el
   chip de una palabra; `label` es la frase corta en presente ("mientras
   haces…"); `note` explica por qué funciona (1 frase). `cats` restringe
   a las categorías de Dare donde encaja (vacío/ausente = cualquiera).
   Varios por familia → el resolvedor los ROTA por fecha para no aburrir. */
export const COMPANIONS: Companion[] = [
  // ---------------- ENTERTAINMENT ----------------
  { id: "netflix", category: "entertainment", word: "Netflix", label: "One episode — playing only while you move.",
    note: "Pair the effort with a show you already want: the reward is built in, so you show up.",
    cats: ["dumbbells", "tabata", "carry", "recovery"] },
  { id: "youtube", category: "entertainment", word: "YouTube", label: "One guilty-pleasure video, on for the duration.",
    note: "A video you'd watch anyway makes the reps feel like the price of admission, not the chore.",
    cats: ["dumbbells", "tabata", "carry", "recovery"] },
  { id: "podcast", category: "entertainment", word: "Podcast", label: "An addictive episode — press play once you're moving.",
    note: "Something to follow lowers how hard the effort feels, so starting and continuing get easier.",
    cats: ["walk", "forest", "carry"] },
  { id: "audiobook", category: "entertainment", word: "Audiobook", label: "A thriller chapter, reserved for movement only.",
    note: "Rationing the story to your workout turns 'have to move' into 'get to find out what happens'.",
    cats: ["walk", "forest", "pool"] },
  { id: "playlist", category: "entertainment", word: "Playlist", label: "Your loudest playlist, from the first rep.",
    note: "Music you like lowers perceived effort and sets the pace, so your brain negotiates less.",
    cats: ["tabata", "fitboxing", "dumbbells", "walk"] },
  { id: "album", category: "entertainment", word: "Album", label: "One album, start to finish, no skipping.",
    note: "A fixed length gives the session a beginning and an end you don't have to decide.",
    cats: ["walk", "forest"] },

  // ---------------- SOCIAL ----------------
  { id: "call-friend", category: "social", word: "Friend", label: "Call someone — the walk is the excuse.",
    note: "Doing it with a voice on the line adds connection and accountability: play, not homework.",
    cats: ["walk", "forest"] },
  { id: "voice-notes", category: "social", word: "Voice notes", label: "Answer your voice notes while you walk.",
    note: "The admin you were dreading becomes movement — two chores collapse into one you enjoy.",
    cats: ["walk", "forest"] },
  { id: "class-people", category: "social", word: "Class", label: "Take the class — just follow the room.",
    note: "Other people set the effort for you, so you don't have to talk yourself into each rep.",
    cats: ["fitboxing", "padel"] },
  { id: "play-friend", category: "social", word: "Friend", label: "Text a friend now and book it together.",
    note: "A game with someone waiting is the strongest reason to leave the house.",
    cats: ["padel"] },

  // ---------------- SENSORY ----------------
  { id: "fancy-coffee", category: "sensory", word: "Coffee", label: "The good coffee — earned at the far end.",
    note: "A small pleasure waiting turns the action into something you get to do, not have to.",
    cats: ["walk", "forest"] },
  { id: "candle-music", category: "sensory", word: "Candle", label: "A candle and low music, for the whole stretch.",
    note: "Making the space feel good tells your body movement is a treat, not a punishment.",
    cats: ["recovery"] },
  { id: "skincare", category: "sensory", word: "Skincare", label: "A skincare ritual the moment you finish.",
    note: "A sensory reward at the end wires the habit: your body starts asking for the movement.",
    cats: ["recovery"] },
  { id: "hot-shower", category: "sensory", word: "Hot shower", label: "A long hot shower, no clock, right after.",
    note: "Bookending effort with comfort makes the whole thing something you look forward to.",
    cats: ["recovery", "pool", "fitboxing"] },
  { id: "sunlight", category: "sensory", word: "Sunlight", label: "Chase the light — face the sun as you move.",
    note: "Daylight lifts alertness and sets your body clock, so the same walk pays you back twice.",
    cats: ["walk", "forest"] },

  // ---------------- NOVELTY ----------------
  { id: "new-route", category: "novelty", word: "New route", label: "A street you've never turned into.",
    note: "Novelty spikes attention and dopamine, so a familiar effort feels new again.",
    cats: ["walk", "forest"] },
  { id: "new-place", category: "novelty", word: "New place", label: "A different neighbourhood, no route to plan.",
    note: "Somewhere unfamiliar turns 'exercise' into an outing your brain wants to take.",
    cats: ["walk", "forest"] },
  { id: "new-playlist", category: "novelty", word: "New playlist", label: "A playlist you've never heard before.",
    note: "New sound keeps the session from feeling like the last one — boredom is the real enemy.",
    cats: ["walk", "tabata", "dumbbells", "fitboxing"] },
  { id: "new-sport", category: "novelty", word: "New sport", label: "Try the thing you've never tried.",
    note: "Trying something new counts double — it's a win whether or not you're any good at it.",
    cats: ["padel", "pool", "fitboxing"] },

  // ---------------- IDENTITY ----------------
  { id: "hot-walk", category: "identity", word: "Hot Walk", label: "Hot Walk Mode: sunglasses, playlist, coffee.",
    note: "Dressing the part makes you the person who does this — identity pulls harder than willpower.",
    cats: ["walk"] },
  { id: "strong-woman", category: "identity", word: "Strong mode", label: "Strong Woman Mode: heavy, slow, unbothered.",
    note: "Acting as-if rehearses the identity you're building, one set at a time.",
    cats: ["dumbbells", "carry"] },
  { id: "boxing-girl", category: "identity", word: "Boxing mode", label: "Boxing Girl Mode: wraps on, music up.",
    note: "A named mode gives the session a character to step into, so starting is a costume, not a fight.",
    cats: ["fitboxing", "tabata"] },
  { id: "athlete-morning", category: "identity", word: "Athlete", label: "Athlete Morning: move before the day starts.",
    note: "Doing it first tells you who you are before anything else gets a vote.",
    cats: ["walk", "forest", "focus"] },
];

/** Configuración de cada vibe del check-in. */
export interface VibeConfig {
  vibe: CompanionVibe;
  /** Texto del botón en el check-in. */
  label: string;
  /** Familias de companion que este vibe favorece. */
  categories: CompanionCategory[];
  /** Categorías de Dare hacia las que inclina el generador. */
  bias: Cat[];
  /** Sube la probabilidad de wildcard (busca lo inesperado). */
  novelty?: boolean;
  /** Prefiere corto e intenso. */
  brutal?: boolean;
}

/* El orden es el del check-in. "surprise" no sesga nada (deja que el
   generador decida) pero sí abre la puerta a los wildcards. */
export const VIBES: VibeConfig[] = [
  { vibe: "watch", label: "Watch something", categories: ["entertainment"], bias: ["dumbbells", "tabata", "carry", "recovery"] },
  { vibe: "listen", label: "Listen to something", categories: ["entertainment"], bias: ["walk", "forest", "carry"] },
  { vibe: "talk", label: "Talk to someone", categories: ["social"], bias: ["walk", "forest", "padel"] },
  { vibe: "elsewhere", label: "Go somewhere different", categories: ["novelty"], bias: ["walk", "forest", "padel"], novelty: true },
  { vibe: "aesthetic", label: "Make it aesthetic", categories: ["sensory"], bias: ["recovery", "walk", "pool"] },
  { vibe: "social", label: "Make it social", categories: ["social"], bias: ["padel", "fitboxing", "walk"] },
  { vibe: "brutal", label: "Short and brutal", categories: ["identity", "entertainment"], bias: ["tabata", "fitboxing", "carry"], brutal: true },
  { vibe: "surprise", label: "Surprise me", categories: [], bias: [], novelty: true },
];
