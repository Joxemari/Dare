/* ============================================================
   DARE — Daily Briefing (widget + recordatorio), lógica PURA.

   Una única fuente de verdad para "Today's Briefing": la superficie
   del widget in-app Y el cuerpo del recordatorio local salen de aquí.
   Sin efectos: el I/O (permiso de notificaciones, showNotification,
   temporizador) vive en la frontera `notify.ts`.

   El contenido es un CONSEJO CONCRETO inspirado en una persona
   conocida y un hábito/método real, accionable hoy (ver
   `data/briefings.ts`). Determinista: la elección se hace con un PRNG
   sembrado por la FECHA (mulberry32), así el briefing es estable
   dentro del día y cambia cada día — y los tests son reproducibles.

   El recordatorio dispara en DOS franjas (mañana/tarde): la decisión
   de qué franja toca (`dueSlot`) es pura y usa la forma de dos
   franjas de `NotificationPrefs` (ver types.ts). El efecto de mostrar
   la notificación vive en `notify.ts`.

   Respeta el vocabulario del producto (ver CLAUDE.md): nada de XP,
   niveles, "streak", "badge", calorías, "burn" ni "draw a card".
   ============================================================ */
import type { SymbolKey } from "../data/symbols";
import type { NotificationPrefs } from "../types";
import { BRIEFINGS } from "../data/briefings";
import { mulberry32 } from "./prng";
import { todayStr } from "./date";

/** Señales mínimas que alimentan la lectura del día. El caller (useDare) las
    resuelve; el módulo queda puro y desacoplado del DOM. */
export interface BriefingInput {
  /** Fecha local YYYY-MM-DD — semilla de la elección diaria. */
  date: string;
  /** ¿Ya se completó al menos un Dare hoy? (solo afecta al recordatorio). */
  doneToday: boolean;
}

export interface Briefing {
  /** Persona conocida que inspira el consejo ("Maya Angelou"). */
  person: string;
  /** El hábito, método o anécdota — el "por qué" del consejo. */
  insight: string;
  /** La acción concreta de hoy (la UI la muestra tras "Today:"). */
  action: string;
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

/** Construye la lectura del día. Determinista para una misma fecha. */
export function buildBriefing(input: BriefingInput): Briefing {
  const rnd = mulberry32(seedOf(input.date));
  const entry = BRIEFINGS[Math.floor(rnd() * BRIEFINGS.length)];
  return { person: entry.person, insight: entry.insight, action: entry.action, sym: entry.sym };
}

/** Franja del recordatorio: mañana o tarde (ver NotificationPrefs). */
export type ReminderSlot = "morning" | "evening";

/** Título + cuerpo del recordatorio local, derivados del briefing.
    Su trabajo es tirar de ti cuando aún NO has hecho el Dare, sin regañar.
    El título varía por franja: la de la tarde reconoce que el día avanza
    ("Still time today") sin culpar. El cuerpo usa el consejo del día. */
export function buildReminder(
  input: BriefingInput,
  slot: ReminderSlot = "morning",
): { title: string; body: string } {
  const b = buildBriefing(input);
  const title = input.doneToday
    ? "Your day is done"
    : slot === "evening"
      ? "Still time today"
      : "Today's briefing";
  const body = input.doneToday
    ? "You showed up today. Let it settle."
    : `${b.person}: ${b.insight} Today: ${b.action}`;
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
