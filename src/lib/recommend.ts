import type { JourneyId, MentalState } from "../types";
import { MVP_JOURNEY_IDS } from "../data/journeys";

/* ============================================================
   recommend — qué Journey del MVP surface HOY en Today, según el
   check-in. Función PURA y determinista (testable sin DOM).

   Regla de producto (spec Today tab):
     Low energy    → Still Water / Soft / Outside
     Restless      → Bright Pulse
     Strong mood   → Iron Quiet
     Bored/stuck   → Wild Ground / Bright Pulse
     Overwhelmed   → Still Water
     Returning     → el Dare de Journey activo más fácil

   El modelo de estado de DARE (`MentalState`) no tiene "restless" ni
   "bored" literales; se mapean desde blocked/tired/normal/active/stressed
   combinados con la energía. Se recomienda SOLO entre Journeys del MVP,
   priorizando los que el usuario tiene activos.
   ============================================================ */

export interface RecommendInput {
  state: MentalState;
  /** Energía del último check-in (1..10). */
  energy: number;
  /** Journeys activos (arrancados) del usuario. */
  active: JourneyId[];
  /** ¿Vuelve tras una pausa? → arranque suave. */
  returning?: boolean;
}

/** Orden de preferencia de Journeys (MVP) para un estado + energía dados. */
function preferenceOrder(state: MentalState, energy: number, returning: boolean): JourneyId[] {
  // Vuelta tras pausa: siempre el arranque más suave primero.
  if (returning) return ["water", "wild", "iron", "pulse"];
  // Energía muy baja: recuperación / suave / fuera, pase lo que pase.
  if (energy <= 3) return ["water", "wild", "pulse", "iron"];

  switch (state) {
    case "tired":
      return ["water", "wild", "iron", "pulse"];
    case "stressed": // overwhelmed → bajar el ruido
      return ["water", "wild", "pulse", "iron"];
    case "blocked": // aburrido / atascado → cambiar de sitio o subir el pulso
      return ["wild", "pulse", "iron", "water"];
    case "active": // con ganas → fuerza o intensidad
      return ["iron", "pulse", "wild", "water"];
    case "normal":
    default:
      return energy >= 7
        ? ["pulse", "iron", "wild", "water"]
        : ["wild", "pulse", "iron", "water"];
  }
}

/**
 * Devuelve el Journey del MVP a destacar hoy. Prioriza los activos: si el
 * usuario tiene varios, elige el mejor para su estado; si no tiene ninguno,
 * devuelve la preferencia principal como sugerencia para empezar.
 */
export function recommendJourney(input: RecommendInput): JourneyId | null {
  const order = preferenceOrder(input.state, input.energy, !!input.returning).filter((id) =>
    (MVP_JOURNEY_IDS as string[]).includes(id),
  );
  const active = input.active.filter((id) => (MVP_JOURNEY_IDS as string[]).includes(id));

  if (active.length) {
    const best = order.find((id) => active.includes(id));
    return best ?? active[0];
  }
  return order[0] ?? null;
}
