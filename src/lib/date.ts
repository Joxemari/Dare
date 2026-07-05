/** Local calendar-date helpers. Dares roll over at local midnight. */

/** Today as an ISO date string (YYYY-MM-DD) in local time. */
export function todayStr(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Whole calendar days between two ISO date strings (b − a). */
export function daysBetween(a: string, b: string): number {
  const [ay, am, ad] = a.split("-").map(Number);
  const [by, bm, bd] = b.split("-").map(Number);
  const ta = Date.UTC(ay, am - 1, ad);
  const tb = Date.UTC(by, bm - 1, bd);
  return Math.round((tb - ta) / 86400000);
}

const WEEKDAYS = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];
const MONTHS = [
  "JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE",
  "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER",
];

/** Masthead date label, inglés + mayúsculas (la UI va en inglés): "SUNDAY 5 JULY".
 *  Nombres fijos, sin depender del locale del navegador (determinista/testeable). */
export function formatDayLabel(d: Date = new Date()): string {
  return `${WEEKDAYS[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]}`;
}

/** Saludo según la hora local: mañana / tarde / noche. Puro (recibe la hora). */
export function greetingFor(hour: number): string {
  if (hour >= 5 && hour < 12) return "Good morning";
  if (hour >= 12 && hour < 18) return "Good afternoon";
  return "Good evening";
}

/** Día del año (1..366) en hora local. Puro. Base para rotaciones diarias
 *  (headline + imagen de fondo del masthead): cambian cada día, estables dentro
 *  del día. */
export function dayOfYear(d: Date = new Date()): number {
  const start = Date.UTC(d.getFullYear(), 0, 0);
  const today = Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());
  return Math.round((today - start) / 86400000);
}

/** Elige un elemento de `arr` por el día del año (rotación diaria determinista).
 *  Vacío → undefined. Puro. */
export function pickByDay<T>(arr: readonly T[], d: Date = new Date()): T | undefined {
  if (!arr.length) return undefined;
  return arr[dayOfYear(d) % arr.length];
}
