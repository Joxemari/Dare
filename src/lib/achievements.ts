import type { Cat, Checkin, Dare } from "../types";

const STRENGTH_CATS: Cat[] = ["dumbbells", "carry", "tabata", "fitboxing"];

export interface TraitContext {
  dare: Dare;
  ci: Checkin | null;
  /** catCounts DESPUÉS de sumar el dare actual. */
  counts: Partial<Record<Cat, number>>;
  /** nº total de dares completados (incluido el actual). */
  totalCompleted: number;
  /** nº de días DISTINTOS con al menos un Dare completado (incluido hoy). */
  distinctDays: number;
  /** veces usada la versión de baja energía (incluida la actual si aplica). */
  smallVersionUses: number;
  have: (id: string) => boolean;
}

/**
 * BADGES ganados al completar un Dare. Función PURA: no lee ni escribe
 * nada, solo decide a partir del contexto. Testable sin DOM.
 *
 * Filosofía (spec): los badges marcan HITOS con significado, no cada
 * acción. La mayoría de completions devuelven []. Los badges de fin de
 * Journey (proof-of-fire / quiet-power / proof-of-iron y la vía "Iron
 * Quiet" de builder) se otorgan al cerrar el sprint en useDare; aquí solo
 * viven los que dependen de umbrales acumulados.
 */
export function earnedTraits(x: TraitContext): string[] {
  const out: string[] = [];
  const add = (id: string) => {
    if (!x.have(id) && !out.includes(id)) out.push(id);
  };
  const d = x.dare;
  const strengthCount = STRENGTH_CATS.reduce((n, c) => n + (x.counts[c] || 0), 0);

  // Starter — el primer Dare de todos.
  if (x.totalCompleted >= 1) add("starter");
  // Courageous — un Dare de nivel Strong.
  if (d.level === "Strong") add("courageous");
  // Umbrales acumulados (cuesta llegar; no salta en cada Dare).
  if ((x.counts.pool || 0) >= 3) add("water-reset");
  if ((x.counts.forest || 0) >= 3) add("forest-mind");
  if ((x.counts.focus || 0) >= 3) add("focus-keeper");
  if (strengthCount >= 5) add("builder");
  if ((x.counts[d.cat] || 0) >= 3) add("rhythm-finder");
  if (x.distinctDays >= 3) add("momentum-keeper");
  if (x.smallVersionUses >= 3) add("reset-artist");
  return out;
}
