import { describe, it, expect } from "vitest";
import { TAROT } from "./tarot";

describe("TAROT", () => {
  it("tiene los 22 arcanos mayores", () => {
    expect(TAROT).toHaveLength(22);
  });

  it("los ids son únicos", () => {
    const ids = TAROT.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  // El id se usa como nombre del WebP en public/arcana/{id}.webp y la ruta de
  // GitHub Pages distingue mayúsculas: minúscula, una palabra, sin espacios.
  it("los ids sirven como nombre de fichero WebP (minúscula, sin espacios)", () => {
    for (const c of TAROT) {
      expect(c.id).toMatch(/^[a-z]+$/);
    }
  });

  it("cada carta tiene num, name y msg no vacíos", () => {
    for (const c of TAROT) {
      expect(c.num.length).toBeGreaterThan(0);
      expect(c.name.length).toBeGreaterThan(0);
      expect(c.msg.length).toBeGreaterThan(0);
    }
  });
});
