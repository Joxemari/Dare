import { describe, it, expect } from "vitest";
import { buildGenerationInput } from "./generationInput";
import { defaultStore } from "./storage";
import type { DareStore } from "../types";

function storeWith(patch: Partial<DareStore>): DareStore {
  return { ...defaultStore(), ...patch };
}

describe("buildGenerationInput", () => {
  it("un store vacío produce una señal vacía pero bien formada", () => {
    const inp = buildGenerationInput(defaultStore());
    expect(inp.energizingCats).toEqual([]);
    expect(inp.totals).toEqual({ completed: 0, feedbackGiven: 0, distinctDares: 0 });
  });

  it("agrega el feedback de energía por categoría y lo ordena", () => {
    const inp = buildGenerationInput(
      storeWith({
        energyFeedback: [
          { date: "2026-07-01", cat: "forest", delta: 1 },
          { date: "2026-07-02", cat: "forest", delta: 1 },
          { date: "2026-07-02", cat: "walk", delta: 1 },
          { date: "2026-07-03", cat: "dumbbells", delta: -1 },
        ],
      }),
    );
    expect(inp.catEnergy).toEqual({ forest: 2, walk: 1, dumbbells: -1 });
    expect(inp.energizingCats).toEqual(["forest", "walk", "dumbbells"]);
    expect(inp.totals.feedbackGiven).toBe(4);
  });

  it("cuenta completados por dareId", () => {
    const inp = buildGenerationInput(
      storeWith({
        completed: [
          { dareId: "night-walk", date: "2026-07-01" },
          { dareId: "night-walk", date: "2026-07-02" },
          { dareId: "pine-reset", date: "2026-07-03" },
        ],
      }),
    );
    expect(inp.dareCompletions).toEqual({ "night-walk": 2, "pine-reset": 1 });
    expect(inp.totals).toMatchObject({ completed: 3, distinctDares: 2 });
  });

  it("el resultado es JSON-serializable (viaja como export)", () => {
    const inp = buildGenerationInput(storeWith({ catCounts: { walk: 3 } }));
    expect(() => JSON.stringify(inp)).not.toThrow();
    expect(JSON.parse(JSON.stringify(inp)).catCounts).toEqual({ walk: 3 });
  });
});
