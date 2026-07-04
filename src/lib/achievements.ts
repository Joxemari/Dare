import type { Cat, Checkin, Dare } from "../types";

const STRENGTH_CATS: Cat[] = ["dumbbells", "carry", "tabata", "fitboxing"];

export interface TraitContext {
  dare: Dare;
  ci: Checkin | null;
  /** catCounts DESPUÉS de sumar el dare actual. */
  counts: Partial<Record<Cat, number>>;
  /** nº total de dares completados (incluido el actual). */
  totalCompleted: number;
  /** nº de dares completados hoy (incluido el actual). */
  nToday: number;
  hour: number;
  momentum: number;
  usedSmallVersion: boolean;
  restartedAfterGap: boolean;
  /** categoría del dare anterior (para "rhythm-finder"). */
  prevCat: Cat | undefined;
  have: (id: string) => boolean;
}

/**
 * Traits ganados al completar un Dare. Función PURA: no lee ni escribe
 * nada, solo decide a partir del contexto. Testable sin DOM.
 * No incluye los traits de fin de Journey (starter/builder/proof-of-*),
 * que se otorgan al cerrar el sprint en useDare.
 */
export function earnedTraits(x: TraitContext): string[] {
  const out: string[] = [];
  const add = (id: string) => {
    if (!x.have(id) && !out.includes(id)) out.push(id);
  };
  const d = x.dare;
  const isStrength = STRENGTH_CATS.includes(d.cat);
  const isOutside = d.cat === "forest" || d.cat === "walk";

  if (x.totalCompleted >= 1) add("starter");
  if (d.cat === "small") add("minimalist");
  if (x.ci && x.ci.energy <= 3) add("unblocked");
  if (isOutside) add("explorer");
  if (isStrength) add("strength-builder");
  if (d.cat === "pool") add("water-reset");
  if ((x.counts.forest || 0) >= 3) add("forest-mind");
  if ((x.counts.focus || 0) + (x.counts.recovery || 0) >= 3) add("clearer");
  if ((x.counts.focus || 0) >= 2) add("focus-keeper");
  if (d.wild) add("wildcard");
  if (x.nToday >= 2) add("extra-spark");
  if (x.hour < 12) add("morning-starter");
  if (x.hour >= 21) add("night-mover");
  if (d.level === "Strong") add("courageous");
  if (x.momentum >= 7) add("consistent");
  if (x.usedSmallVersion) add("body-listener");
  if (d.cat === "recovery" && x.ci?.state === "stressed") add("calm-maker");
  if (isOutside && x.ci?.state === "blocked") add("door-opener");
  if (x.prevCat && x.prevCat === d.cat) add("rhythm-finder");
  if (x.restartedAfterGap) {
    add("momentum-keeper");
    add("reset-artist");
  }
  return out;
}
