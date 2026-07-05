import { describe, it, expect } from "vitest";
import { TREATS } from "./rewards";
import { CATS } from "./colors";
import type { Cat } from "../types";

/** Vocabulario prohibido por el producto (ver CLAUDE.md): los treats son
    recompensas reales, no gamificación. */
const BANNED = ["xp", "level", "streak", "calorie", "burn", "badge"];

const ALL = Object.values(TREATS).flat();
const ALL_CATS = Object.keys(CATS) as Cat[];

describe("TREATS (corpus)", () => {
  it("hay variedad real en cada tier", () => {
    expect(TREATS.common.length).toBeGreaterThanOrEqual(12);
    expect(TREATS.rare.length).toBeGreaterThanOrEqual(8);
    expect(TREATS.golden.length).toBeGreaterThanOrEqual(4);
  });

  it("textos no vacíos y únicos en todo el catálogo", () => {
    const texts = ALL.map((t) => t.text);
    for (const text of texts) expect(text.trim().length).toBeGreaterThan(0);
    expect(new Set(texts).size).toBe(texts.length);
  });

  it("no usa vocabulario prohibido", () => {
    for (const t of ALL) {
      const lower = t.text.toLowerCase();
      for (const w of BANNED) expect(lower).not.toContain(w);
    }
  });

  it("ningún treat encaja Y choca con la misma categoría", () => {
    for (const t of ALL) {
      for (const cat of t.fits ?? []) {
        expect(t.avoid ?? []).not.toContain(cat);
      }
    }
  });

  it("todos los golden llevan efecto especial válido; common/rare, ninguno", () => {
    for (const g of TREATS.golden) {
      expect(["golden", "date", "dreamBoost", "choose"]).toContain(g.special);
    }
    for (const t of [...TREATS.common, ...TREATS.rare]) {
      expect(t.special).toBeUndefined();
    }
  });

  it("toda categoría tiene treats elegibles en cada tier (el fallback no hace falta)", () => {
    // Si un tier entero chocara con una categoría, pickTreat caería al
    // fallback (mostrar un treat que choca). Este guard obliga a que el
    // catálogo nunca lo necesite.
    for (const cat of ALL_CATS) {
      for (const [tier, pool] of Object.entries(TREATS)) {
        const eligible = pool.filter((t) => !t.avoid?.includes(cat));
        expect(eligible.length, `tier ${tier} sin treats para ${cat}`).toBeGreaterThan(0);
      }
    }
  });
});
