/* ============================================================
   proposed.test.ts — LA COMPUERTA del pipeline generativo.
   Recoge cualquier fichero `week-*.ts` que la generación deje en
   `_proposed/` y valida su contenido con los MISMOS validadores que
   el corpus vivo:
     PROPOSED           → Dares        (validateDare)
     PROPOSED_WILDCARDS → Wildcards    (validateWildcard, wild:true)
     PROPOSED_TREATS    → Treats       (validateTreat)

   Si algo no cumple, `npm test` se pone en rojo → la CI marca la PR y
   no se mergea contenido inválido. Aprobar/mergear = validación humana.

   Los ficheros de `_proposed/` son transitorios: al aprobar se PROMOCIONAN
   (Dares/Wildcards → dares.ts/wildcards.ts; Treats → rewards.ts) y se borra
   el fichero. En `main`, `_proposed/` está normalmente vacío. Ver
   `docs/content-pipeline.md`.
   ============================================================ */
import { describe, it, expect } from "vitest";
import type { Dare, Tier, Treat } from "../../types";
import { validateDare, validateWildcard, validateTreat } from "../../lib/contentSchema";
import { DARES } from "../dares";
import { WILDCARDS } from "../wildcards";
import { SCIENCE } from "../science";
import { TREATS } from "../rewards";

type ProposedTreat = Treat & { tier: Tier };
interface Batch {
  PROPOSED?: Dare[];
  PROPOSED_WILDCARDS?: Dare[];
  PROPOSED_TREATS?: ProposedTreat[];
}

// Vite/Vitest: recoge en build todos los lotes de propuestas presentes.
const modules = import.meta.glob("./week-*.ts", { eager: true }) as Record<string, Batch>;

const LIVE_IDS = [...DARES, ...WILDCARDS].map((d) => d.id);
const SCIENCE_IDS = SCIENCE.map((s) => s.id);
const LIVE_TREAT_TEXTS = Object.values(TREATS).flatMap((arr) => arr.map((t) => t.text));

describe("propuestas de contenido (_proposed)", () => {
  const files = Object.keys(modules);

  if (files.length === 0) {
    it("sin propuestas pendientes: nada que validar", () => {
      expect(files).toEqual([]);
    });
    return;
  }

  for (const [path, mod] of Object.entries(modules)) {
    const dares = mod.PROPOSED ?? [];
    const wildcards = mod.PROPOSED_WILDCARDS ?? [];
    const treats = mod.PROPOSED_TREATS ?? [];
    // ids ocupados = corpus vivo + todo el lote (para detectar colisiones internas).
    const batchIds = [...dares, ...wildcards].map((d) => d.id);
    const idsFor = (self: string) => [...LIVE_IDS, ...batchIds.filter((id) => id !== self)];

    it(`${path}: cada Dare propuesto es válido y aditivo`, () => {
      for (const d of dares) {
        expect(validateDare(d, { existingIds: idsFor(d.id), scienceIds: SCIENCE_IDS }), d.id).toEqual([]);
      }
    });

    it(`${path}: cada Wildcard propuesto es válido, aditivo y wild:true`, () => {
      for (const d of wildcards) {
        expect(validateWildcard(d, { existingIds: idsFor(d.id), scienceIds: SCIENCE_IDS }), d.id).toEqual([]);
      }
    });

    it(`${path}: cada Treat propuesto es válido y no duplica`, () => {
      const seen: string[] = [];
      for (const t of treats) {
        expect(validateTreat(t, { existingTexts: [...LIVE_TREAT_TEXTS, ...seen] }), t.text).toEqual([]);
        seen.push(t.text);
      }
    });
  }
});
