/* ============================================================
   DARE — Daily Briefing (widget + recordatorio), lógica PURA.

   Una única fuente de verdad para "la lectura del día" estilo
   Co-Star: la superficie del widget in-app Y el cuerpo del
   recordatorio local salen de aquí. Sin efectos: el I/O (permiso
   de notificaciones, showNotification, temporizador) vive en la
   frontera `notify.ts`, igual que `share.ts`/`ShareCardButton`.

   Determinista: la variedad se elige con un PRNG sembrado por la
   FECHA (mulberry32), así el briefing es estable dentro del día y
   cambia cada día — y los tests son reproducibles. El tono respeta
   el vocabulario del producto (ver CLAUDE.md): nada de XP, niveles,
   "streak", calorías ni "burn"; sí Proof, Momentum, Journey.
   ============================================================ */
import type { SymbolKey } from "../data/symbols";
import type { NotificationPrefs } from "../types";
import { mulberry32 } from "./prng";
import { todayStr } from "./date";

/** Señales derivadas del store que alimentan la lectura del día.
    El caller (useDare) las resuelve; así el módulo queda puro y
    desacoplado de `src/data` y del DOM. */
export interface BriefingInput {
  /** Fecha local YYYY-MM-DD — semilla de la variedad diaria. */
  date: string;
  /** Hora local 0-23 — decide el saludo. */
  hour: number;
  /** Momentum acumulado (store.momentum.count). */
  momentum: number;
  journeyName: string;
  journeySym: SymbolKey;
  chapterName: string;
  daysDone: number;
  sprintDays: number;
  /** ¿Ya se completó al menos un Dare hoy? */
  doneToday: boolean;
  /** Título del Dare pendiente hoy (si ya está revelado), o null. */
  dareTitle: string | null;
  /** Nombre de la Daily Card si ya se eligió, o null. */
  cardName: string | null;
  /** Categoría (label) que más energía da según el feedback, o null. */
  topEnergyLabel: string | null;
  proofCount: number;
}

export interface Briefing {
  /** Saludo por hora ("Good morning."). */
  greeting: string;
  /** Titular poético del día (el "forecast"). */
  headline: string;
  /** 1-2 líneas de apoyo derivadas del estado. */
  lines: string[];
  /** Empujón concreto: qué hacer ahora. */
  focus: string;
  /** Símbolo a renderizar (clave del mapa central). */
  sym: SymbolKey;
}

/** Hash estable de la fecha → semilla del PRNG (pura, sin Date.now). */
function seedOf(date: string): number {
  let h = 2166136261;
  for (let i = 0; i < date.length; i++) {
    h ^= date.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function pick<T>(arr: readonly T[], rnd: () => number): T {
  return arr[Math.floor(rnd() * arr.length)];
}

function greetingFor(hour: number): string {
  if (hour < 12) return "Good morning.";
  if (hour < 19) return "Good afternoon.";
  return "Good evening.";
}

/* Pools de titulares en la voz de las cartas — cortos, en segunda
   persona, evocadores pero aterrizados. Se elige según el momento
   del día y si el Dare ya está hecho. */
const OPENING = [
  "The day is unwritten. One action decides its shape.",
  "Nothing is owed yet. Begin small and the rest follows.",
  "Morning is the cheapest time to become someone.",
  "You don't need the mood. You need the first minute.",
] as const;

const MIDDAY = [
  "The window is still open. Step through before you talk yourself out.",
  "Energy is made, not found. Move first, feel after.",
  "The hard part was choosing. That's already done for you.",
  "Momentum is quiet until you give it something to carry.",
] as const;

const EVENING_PENDING = [
  "The day isn't over. One small dare still counts.",
  "Tired is a fine state to start from. Ask for little.",
  "Close the day with proof, not with intention.",
  "Even now, a single minute rewrites the story.",
] as const;

const DONE = [
  "The work is behind you. Let it settle.",
  "You showed up. That's the whole win.",
  "Proof collected. Nothing else is asked today.",
  "You kept the promise to yourself. Rest into it.",
] as const;

/** Construye la lectura del día. Determinista para un mismo input. */
export function buildBriefing(input: BriefingInput): Briefing {
  const rnd = mulberry32(seedOf(input.date));
  const greeting = greetingFor(input.hour);

  const headline = input.doneToday
    ? pick(DONE, rnd)
    : input.hour < 12
      ? pick(OPENING, rnd)
      : input.hour < 19
        ? pick(MIDDAY, rnd)
        : pick(EVENING_PENDING, rnd);

  const lines: string[] = [];

  // Momentum — nunca como "streak" ni con presión de rachas.
  if (input.momentum <= 0) {
    lines.push("No thread to protect today. Just begin.");
  } else if (input.momentum === 1) {
    lines.push("One day of momentum behind you.");
  } else {
    lines.push(`${input.momentum} days of momentum behind you — carried, not counted.`);
  }

  // Señal de energía real (lo que el generador ya está aprendiendo).
  if (input.topEnergyLabel) {
    lines.push(`${input.topEnergyLabel} is what actually moves you.`);
  } else {
    lines.push(`You are in ${input.chapterName} of ${input.journeyName}.`);
  }

  // Empujón concreto (el "focus" del día).
  let focus: string;
  if (input.doneToday) {
    const n = input.proofCount;
    focus = `Done for today. ${n} ${n === 1 ? "proof" : "proofs"} collected.`;
  } else if (input.dareTitle) {
    focus = `Today: ${input.dareTitle}.`;
  } else if (!input.cardName) {
    focus = "Draw your card, then check in. We choose the dare.";
  } else {
    focus = "Check in — 20 seconds. We choose the rest.";
  }

  return {
    greeting,
    headline,
    lines,
    focus,
    sym: input.doneToday ? "spark" : input.journeySym,
  };
}

/** Franja del recordatorio: mañana o tarde (ver NotificationPrefs). */
export type ReminderSlot = "morning" | "evening";

/** Título + cuerpo del recordatorio local, derivados del briefing.
    Su trabajo es tirar de ti cuando aún NO has hecho el Dare, sin
    regañar; por eso reusa el titular + el focus. El título varía por franja:
    la de la tarde reconoce que el día avanza ("Still time today") sin culpar. */
export function buildReminder(
  input: BriefingInput,
  slot: ReminderSlot = "morning",
): { title: string; body: string } {
  const b = buildBriefing(input);
  const title = input.doneToday
    ? "Your day is done"
    : slot === "evening"
      ? "Still time today"
      : "Your dare is waiting";
  const body = `${b.headline} ${b.focus}`.trim();
  return { title, body };
}

/**
 * ¿Qué franja del recordatorio toca mostrar AHORA (o ninguna)? Decisión PURA
 * (recibe `now`), testeable; el efecto de mostrarlo vive en `notify.ts`.
 *
 * Reglas: solo si está activado y si aún NO se hizo el Dare (no molestar). Cada
 * franja lleva su propio `lastShown` (dedupe independiente): la de la tarde
 * tiene prioridad una vez llegada su hora — así, al abrir la app por la noche,
 * NO se reavisa una mañana ya pasada. La mañana solo dispara dentro de su
 * ventana [hora_mañana, hora_tarde).
 */
export function dueSlot(
  prefs: NotificationPrefs,
  now: Date,
  doneToday: boolean,
): ReminderSlot | null {
  if (!prefs.enabled) return null;
  if (doneToday) return null;
  const today = todayStr(now);
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const morningMin = prefs.morning.hour * 60 + prefs.morning.minute;
  const eveningMin = prefs.evening.hour * 60 + prefs.evening.minute;

  if (prefs.evening.lastShown !== today && nowMin >= eveningMin) return "evening";
  if (prefs.morning.lastShown !== today && nowMin >= morningMin && nowMin < eveningMin) {
    return "morning";
  }
  return null;
}
