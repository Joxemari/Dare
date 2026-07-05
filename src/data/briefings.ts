import type { SymbolKey } from "./symbols";

/* ============================================================
   DARE — Daily Briefing library (person-inspired advice).
   Cada entrada es UN consejo concreto, inspirado en una persona
   conocida y en un hábito, método o anécdota REAL, con una acción
   accionable HOY. Nada de motivación vaga, nada de "draw a card",
   nada de lenguaje interno abstracto (ver CLAUDE.md).

   Datos de dominio, SIN lógica: la elección diaria (seeded por
   fecha) vive en `lib/briefing.ts`.
   ============================================================ */
export interface BriefingEntry {
  /** Persona conocida que inspira el consejo. */
  person: string;
  /** El hábito, método, historia o cita — 1-2 frases concretas. */
  insight: string;
  /** La acción de hoy (imperativa, concreta). La UI la muestra tras "Today:". */
  action: string;
  /** Símbolo (clave del mapa central) para acompañar la lectura. */
  sym: SymbolKey;
}

export const BRIEFINGS: readonly BriefingEntry[] = [
  {
    person: "Maya Angelou",
    insight:
      "She rented a bare hotel room and kept it only for writing, stripping away every distraction so starting was easier.",
    action: "choose one surface, one tab, or one room where only the next action is allowed.",
    sym: "focus",
  },
  {
    person: "Ernest Hemingway",
    insight:
      "He stopped writing each day mid-sentence, at a point where he already knew what came next — so beginning again was effortless.",
    action: "when you pause your work, stop somewhere you know exactly what the next step is.",
    sym: "cycle",
  },
  {
    person: "Jerry Seinfeld",
    insight:
      "He marked a big X on a wall calendar for every day he wrote jokes, and his only job became not breaking the chain.",
    action: "do the smallest version of one thing, then mark it done somewhere you can see it.",
    sym: "momentum",
  },
  {
    person: "Twyla Tharp",
    insight:
      "The choreographer began every day by hailing a cab to the gym at dawn. The ritual she committed to was the cab, not the workout.",
    action: "pick one tiny fixed action to start with, before your mind can negotiate.",
    sym: "spark",
  },
  {
    person: "Charles Darwin",
    insight:
      "He walked the same gravel path daily to think, sometimes kicking stones to count his laps while a problem loosened in the background.",
    action: "take a short walk with no phone and let one stuck problem work itself loose.",
    sym: "forest",
  },
  {
    person: "Toni Morrison",
    insight:
      "She wrote before dawn to watch the light arrive, saying she simply wasn't sharp until after the sun came up.",
    action: "give your first clear hour to what matters most, not your leftover one.",
    sym: "sun",
  },
  {
    person: "Benjamin Franklin",
    insight:
      "Each morning he asked himself one question: \"What good shall I do this day?\" — and reviewed it each night.",
    action: "before the day fills up, name one good thing you will actually do in it.",
    sym: "focus",
  },
  {
    person: "Haruki Murakami",
    insight:
      "He keeps the same plain routine every day — run, write, early to bed — using repetition itself to reach a deeper state of focus.",
    action: "repeat one small thing exactly as you did it yesterday, and let the routine carry you.",
    sym: "rhythm",
  },
  {
    person: "Agatha Christie",
    insight:
      "She said the best time for plotting a book was while washing the dishes: busy hands set the mind free.",
    action: "do one mindless chore on purpose and let your thinking unstick while you move.",
    sym: "reset",
  },
  {
    person: "Steve Jobs",
    insight:
      "He wore the same outfit every day to spend zero energy on trivial choices and save it for decisions that mattered.",
    action: "remove one small decision today by choosing it once, in advance.",
    sym: "soft",
  },
  {
    person: "Anthony Trollope",
    insight:
      "The novelist wrote by the clock before his day job — a set number of words every fifteen minutes, mood or no mood.",
    action: "set a short timer and work by the clock, not by how you feel.",
    sym: "cycle",
  },
  {
    person: "Octavia Butler",
    insight:
      "She wrote before dawn before long factory and office shifts, keeping the habit no matter how tired she was.",
    action: "do your one thing before the tiredness gets a vote.",
    sym: "spark",
  },
  {
    person: "Leonardo da Vinci",
    insight:
      "He filled thousands of notebook pages with tiny daily observations and questions, capturing ideas the instant they appeared.",
    action: "capture one idea or question on paper before it slips away.",
    sym: "focus",
  },
  {
    person: "Georgia O'Keeffe",
    insight:
      "She rose early, walked, and painted in natural light, keeping her space and her days deliberately simple to protect her attention.",
    action: "clear one thing from your space so what matters has room to happen.",
    sym: "reset",
  },
  {
    person: "Fred Rogers",
    insight:
      "Mister Rogers swam every single morning for decades and held a steady weight — steadiness, never intensity, was the point.",
    action: "choose steady over intense: do one small rep of the thing, and stop there.",
    sym: "calm",
  },
  {
    person: "Marie Curie",
    insight:
      "She worked with such absorption in a bare, cold shed that she'd forget to eat — depth came from removing comfort's distractions.",
    action: "take away one comfort that pulls you (a tab, a snack, a notification) and go deep for a while.",
    sym: "strong",
  },
];
