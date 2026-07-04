import { describe, it, expect } from "vitest";
import { sample, rollDraw } from "./random";

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

describe("rollDraw", () => {
  it("devuelve siempre una recompensa con forma válida", () => {
    // La tirada usa Math.random; comprobamos invariantes en muchas tiradas.
    for (let i = 0; i < 500; i++) {
      const draw = rollDraw();
      expect(["common", "rare", "golden"]).toContain(draw.tier);
      expect(typeof draw.text).toBe("string");
      expect(draw.text.length).toBeGreaterThan(0);
      expect(typeof draw.x2).toBe("boolean");
    }
  });
});
