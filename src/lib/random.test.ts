import { describe, it, expect } from "vitest";
import { sample, rollTreat, pickTreat } from "./random";
import { mulberry32 } from "./prng";
import { TREATS } from "../data/rewards";
import type { Treat } from "../types";

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

/** rand de secuencia fija — controla exactamente cada tirada. */
const seq = (vals: number[]) => {
  let i = 0;
  return () => vals[i++ % vals.length];
};

describe("pickTreat", () => {
  const pool: readonly Treat[] = [
    { text: "encaja", fits: ["walk"] },
    { text: "neutro" },
    { text: "choca", avoid: ["walk"] },
  ];

  it("excluye los treats que chocan con la categoría (avoid)", () => {
    const rand = mulberry32(7);
    for (let i = 0; i < 200; i++) {
      expect(pickTreat(pool, "walk", rand).text).not.toBe("choca");
    }
  });

  it("prima los que encajan (fits, peso ×3) de forma determinista", () => {
    // Pool elegible para "walk": [encaja(3), neutro(1)] → total 4.
    // rand*4 < 3 → "encaja"; si no → "neutro".
    expect(pickTreat(pool, "walk", () => 0.5).text).toBe("encaja"); // 2.0 < 3
    expect(pickTreat(pool, "walk", () => 0.74).text).toBe("encaja"); // 2.96 < 3
    expect(pickTreat(pool, "walk", () => 0.8).text).toBe("neutro"); // 3.2 ≥ 3
  });

  it("sin categoría, todos pesan igual (incluidos los taggeados)", () => {
    // total 3, uno por índice: [0,1/3) → encaja, [1/3,2/3) → neutro, resto → choca.
    expect(pickTreat(pool, null, () => 0.1).text).toBe("encaja");
    expect(pickTreat(pool, null, () => 0.5).text).toBe("neutro");
    expect(pickTreat(pool, null, () => 0.9).text).toBe("choca");
  });

  it("fallback defensivo: si todo el pool choca, devuelve algo igualmente", () => {
    const all: readonly Treat[] = [
      { text: "a", avoid: ["pool"] },
      { text: "b", avoid: ["pool"] },
    ];
    expect(["a", "b"]).toContain(pickTreat(all, "pool", () => 0.5).text);
  });
});

describe("rollTreat", () => {
  it("es determinista con un rand sembrado", () => {
    const a = Array.from({ length: 20 }, () => rollTreat("walk", 0, mulberry32(42)));
    const b = Array.from({ length: 20 }, () => rollTreat("walk", 0, mulberry32(42)));
    expect(a).toEqual(b);
  });

  it("respeta los umbrales de rareza: <6% golden, <30% rare, resto common", () => {
    expect(rollTreat(null, 0, seq([0.05, 0.5])).tier).toBe("golden");
    expect(rollTreat(null, 0, seq([0.06, 0.5])).tier).toBe("rare");
    expect(rollTreat(null, 0, seq([0.29, 0.5])).tier).toBe("rare");
    expect(rollTreat(null, 0, seq([0.3, 0.5])).tier).toBe("common");
    expect(rollTreat(null, 0, seq([0.99, 0.5])).tier).toBe("common");
  });

  it("nunca ofrece un treat que choca con la categoría del Dare", () => {
    // Textos que el corpus marca como incompatibles con "forest" (p. ej. el
    // café sentado justo después de un paseo por el bosque).
    const clashing = new Set(
      Object.values(TREATS)
        .flat()
        .filter((t) => t.avoid?.includes("forest"))
        .map((t) => t.text),
    );
    expect(clashing.size).toBeGreaterThan(0); // el test tiene dientes
    const rand = mulberry32(1);
    for (let i = 0; i < 400; i++) {
      expect(clashing.has(rollTreat("forest", 0, rand).text)).toBe(false);
    }
  });

  it("devuelve siempre un treat con forma válida y sin 'double XP'", () => {
    // Con el rand por defecto (Math.random): invariantes en muchas tiradas.
    for (let i = 0; i < 300; i++) {
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

  it("boost sesga hacia mejores treats (más golden/rare que sin boost)", () => {
    const N = 4000;
    let baseGood = 0;
    let boostGood = 0;
    for (let i = 0; i < N; i++) {
      if (rollTreat(null, 0).tier !== "common") baseGood++;
      if (rollTreat(null, 1).tier !== "common") boostGood++;
    }
    // base: ~30% no-common; boost=1: ~44% → el sesgo debe notarse con N grande
    expect(boostGood).toBeGreaterThan(baseGood);
  });

  it("clampa el boost fuera de [0,1] sin romper la forma", () => {
    for (let i = 0; i < 200; i++) {
      const draw = rollTreat(null, 5); // boost fuera de rango → se clampa a 1
      expect(["common", "rare", "golden"]).toContain(draw.tier);
    }
  });
});
