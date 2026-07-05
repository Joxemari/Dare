/* ============================================================
   DARE — decisión de "añadir a inicio" (PWA), lógica PURA.

   Por qué importa: en iOS, una web NO instalada pierde el
   localStorage a los ~7 días de inactividad (Safari lo desaloja) →
   se borraría el progreso del Journey. Instalar la app lo hace
   DURADERO (y, de paso, habilita el modo standalone). Este módulo
   decide QUÉ ofrecer; el efecto (capturar `beforeinstallprompt`,
   llamar a `.prompt()`) vive en la frontera (`useDare.ts`), igual
   que `notify.ts` para el recordatorio.

   Todo aquí es PURO y determinista (se testea en `install.test.ts`).
   ============================================================ */

import { daysBetween } from "./date";

/** Qué ofrecer al usuario:
    - `prompt`     → hay un `beforeinstallprompt` capturado: botón de 1 toque.
    - `ios-manual` → iOS/Safari no emite ese evento: hay que instruir a mano
      (Compartir ⎋ → "Add to Home Screen").
    - `none`       → no ofrecer nada (ya instalada, sin nada que perder aún,
      o silenciada tras un descarte reciente). */
export type InstallOffer = "prompt" | "ios-manual" | "none";

/** ¿El user-agent es de iOS (iPhone/iPad/iPod)? iPadOS moderno se anuncia como
    "Macintosh", así que también detectamos Mac con pantalla táctil vía el flag
    que pasa el caller (no podemos tocar `navigator` aquí: sería impuro). */
export function isIOS(ua: string): boolean {
  return /iphone|ipad|ipod/i.test(ua);
}

/** ¿La app corre ya como PWA instalada (standalone)? Combina el media query
    estándar (`display-mode: standalone`) con el flag propietario de iOS Safari
    (`navigator.standalone`), ambos resueltos por el caller. */
export function isInStandaloneMode(displayStandalone: boolean, iosStandalone: boolean): boolean {
  return displayStandalone || iosStandalone;
}

export interface InstallOfferInput {
  /** ¿Ya está instalada / en standalone? */
  standalone: boolean;
  /** ¿El dispositivo es iOS (sin `beforeinstallprompt`)? */
  ios: boolean;
  /** ¿Hay un `beforeinstallprompt` capturado y listo para `.prompt()`? */
  promptAvailable: boolean;
  /** Proofs coleccionados: no ofrecemos instalar el día 1 (nada que perder). */
  proofCount: number;
  /** Journeys activos: también cuentan como "algo que proteger". */
  activeJourneys: number;
  /** Fecha (YYYY-MM-DD) del último descarte, o "". */
  dismissedAt: string;
  /** Hoy (YYYY-MM-DD). */
  today: string;
  /** Días de silencio tras un descarte (por defecto 14). */
  snoozeDays?: number;
}

/**
 * Decide qué nudge de instalación mostrar. PURA.
 *
 * Reglas (en orden):
 *  1. Si ya está instalada → `none`.
 *  2. Si el usuario aún no tiene NADA que perder (sin proofs ni journeys
 *     activos) → `none`: no molestamos el primer día.
 *  3. Si descartó el nudge hace menos de `snoozeDays` → `none`.
 *  4. Si hay `beforeinstallprompt` → `prompt` (instalación de 1 toque).
 *  5. Si es iOS (sin ese evento) → `ios-manual` (instrucciones).
 *  6. En cualquier otro caso (p. ej. escritorio sin evento) → `none`.
 */
export function installOffer(input: InstallOfferInput): InstallOffer {
  if (input.standalone) return "none";
  if (input.proofCount <= 0 && input.activeJourneys <= 0) return "none";

  const snooze = input.snoozeDays ?? 14;
  if (input.dismissedAt && daysBetween(input.dismissedAt, input.today) < snooze) {
    return "none";
  }

  if (input.promptAvailable) return "prompt";
  if (input.ios) return "ios-manual";
  return "none";
}
