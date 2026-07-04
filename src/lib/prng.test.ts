import { describe, it, expect } from "vitest";
import { mulberry32 } from "./prng";

describe("mulberry32", () => {
  it("es determinista: misma semilla, misma secuencia", () => {
    const a = mulberry32(12345);
    const b = mulberry32(12345);
    const seqA = [a(), a(), a(), a()];
    const seqB = [b(), b(), b(), b()];
    expect(seqA).toEqual(seqB);
  });

  it("semillas distintas producen secuencias distintas", () => {
    const a = mulberry32(1);
    const b = mulberry32(2);
    expect(a()).not.toBe(b());
  });

  it("devuelve valores en el rango [0, 1)", () => {
    const rnd = mulberry32(99);
    for (let i = 0; i < 1000; i++) {
      const v = rnd();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });
});
