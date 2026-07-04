/* ============================================================
   generationInput — puente FEEDBACK → GENERACIÓN.
   Función PURA: toma el `DareStore` del usuario y lo resume en
   una señal compacta y serializable que alimenta la generación
   semanal de contenido.

   Vive en el navegador (localStorage) hasta que hay backend, así
   que el resumen se EXPORTA (a mano hoy: un botón "Export data"
   en You → un JSON que se deja en `feedback.json` del repo). El
   script de generación lo lee y lo mete en el prompt para que el
   contenido nuevo se parezca a lo que de verdad te da energía.
   ============================================================ */
import type { Cat, DareStore } from "../types";

export interface GenerationInput {
  /** Feedback de energía acumulado por categoría (Σ delta). */
  catEnergy: Partial<Record<Cat, number>>;
  /** Categorías ordenadas de más a menos energizantes (según feedback). */
  energizingCats: Cat[];
  /** Veces que se ha hecho cada categoría. */
  catCounts: Partial<Record<Cat, number>>;
  /** Veces completado por dareId (qué Dares concretos resuenan). */
  dareCompletions: Record<string, number>;
  /** Totales para dar contexto de cuánta señal hay. */
  totals: { completed: number; feedbackGiven: number; distinctDares: number };
}

/**
 * Construye la señal de generación a partir del estado del usuario.
 * Solo usa datos YA persistidos (energyFeedback, completed, catCounts):
 * no requiere migración de esquema.
 */
export function buildGenerationInput(store: DareStore): GenerationInput {
  const catEnergy: Partial<Record<Cat, number>> = {};
  for (const f of store.energyFeedback) {
    catEnergy[f.cat] = (catEnergy[f.cat] ?? 0) + f.delta;
  }

  const energizingCats = (Object.entries(catEnergy) as [Cat, number][])
    .sort((a, b) => b[1] - a[1])
    .map(([c]) => c);

  const dareCompletions: Record<string, number> = {};
  for (const c of store.completed) {
    dareCompletions[c.dareId] = (dareCompletions[c.dareId] ?? 0) + 1;
  }

  return {
    catEnergy,
    energizingCats,
    catCounts: { ...store.catCounts },
    dareCompletions,
    totals: {
      completed: store.completed.length,
      feedbackGiven: store.energyFeedback.length,
      distinctDares: Object.keys(dareCompletions).length,
    },
  };
}
