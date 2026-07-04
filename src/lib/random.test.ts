import { describe, it, expect } from "vitest";
import { sample, rollTreat } from "./random";

describe("sample", () => {
  it("devuelve n elementos distintos, todos del array original", () => {
    const arr = [1, 2, 3, 4, 5] as const;
    const out = sample(arr, 3);
    expect(out).toHaveLength(3);
    expect(new Set(out).size).toBe(3); // sin repetidos
    for (const x of out) expect(arr).toContain(x);
  });

  it("no devuelve más elementos de los que hay (n > longitud)", () => {
    const out = sample([1, 2], 10);
    expect(out).toHaveLength(2);
  });

  it("no muta el array original", () => {
    const arr = [1, 2, 3];
    sample(arr, 2);
    expect(arr).toEqual([1, 2, 3]);
  });
});

describe("rollTreat", () => {
  it("devuelve siempre un treat con forma válida y sin 'double XP'", () => {
    // La tirada usa Math.random; comprobamos invariantes en muchas tiradas.
    for (let i = 0; i < 500; i++) {
      const draw = rollTreat();
      expect(["common", "rare", "golden"]).toContain(draw.tier);
      expect(typeof draw.text).toBe("string");
      expect(draw.text.length).toBeGreaterThan(0);
      // el treat no debe volver a mencionar XP en ningún caso
      expect(draw.text.toLowerCase()).not.toContain("xp");
      if (draw.special !== undefined) {
        expect(["golden", "date", "dreamBoost", "choose"]).toContain(draw.special);
      }
    }
  });
});
