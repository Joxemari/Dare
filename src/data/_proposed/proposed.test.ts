/* ============================================================
   proposed.test.ts — LA COMPUERTA del pipeline generativo.
   Recoge cualquier fichero `week-*.ts` que la generación semanal
   haya dejado en `_proposed/` y valida cada Dare propuesto contra
   el corpus vivo (con el MISMO `validateDare` que usa el corpus).

   Si una propuesta no cumple, `npm test` se pone en rojo → la CI
   marca la PR y no se mergea contenido inválido. Aprobar y mergear
   la PR es tu VALIDACIÓN humana; este test es la automática.

   Los ficheros de `_proposed/` son transitorios: cuando apruebas,
   se PROMOCIONAN (se mueven sus entradas a `dares.ts`/`wildcards.ts`
   y se borra el fichero). En `main`, `_proposed/` está normalmente
   vacío. Ver `docs/content-pipeline.md`.
   ============================================================ */
import { describe, it, expect } from "vitest";
import type { Dare } from "../../types";
import { validateDare } from "../../lib/contentSchema";
import { DARES } from "../dares";
import { WILDCARDS } from "../wildcards";
import { SCIENCE } from "../science";

// Vite/Vitest: recoge en build todos los lotes de propuestas presentes.
const modules = import.meta.glob("./week-*.ts", { eager: true }) as Record<
  string,
  { PROPOSED?: Dare[] }
>;

const LIVE_IDS = [...DARES, ...WILDCARDS].map((d) => d.id);
const SCIENCE_IDS = SCIENCE.map((s) => s.id);

describe("propuestas de contenido (_proposed)", () => {
  const files = Object.keys(modules);

  if (files.length === 0) {
    it("sin propuestas pendientes: nada que validar", () => {
      expect(files).toEqual([]);
    });
    return;
  }

  for (const [path, mod] of Object.entries(modules)) {
    const proposed = mod.PROPOSED ?? [];

    it(`${path} exporta PROPOSED como array`, () => {
      expect(Array.isArray(mod.PROPOSED), `${path} debe exportar PROPOSED: Dare[]`).toBe(true);
    });

    it(`${path}: cada propuesta es válida y aditiva`, () => {
      // ids ocupados = corpus vivo + el resto del lote (para detectar colisiones internas).
      const proposedIds = proposed.map((d) => d.id);
      for (const d of proposed) {
        const existingIds = [...LIVE_IDS, ...proposedIds.filter((id) => id !== d.id)];
        expect(validateDare(d, { existingIds, scienceIds: SCIENCE_IDS }), `${d.id}`).toEqual([]);
      }
    });
  }
});
