import { describe, it, expect } from "vitest";
import { CAT_MODE, MODES, modeOfCat } from "./modes";
import { CATS_VALID } from "../lib/contentSchema";

describe("movement modes", () => {
  it("toda categoría de Dare tiene un modo válido", () => {
    for (const c of CATS_VALID) {
      const mode = CAT_MODE[c];
      expect(mode, c).toBeTruthy();
      expect(MODES[mode], `${c} → ${mode}`).toBeTruthy();
      expect(modeOfCat(c)).toBe(mode);
    }
  });

  it("los modos físicos clave están mapeados como se espera", () => {
    expect(modeOfCat("dumbbells")).toBe("Strong");
    expect(modeOfCat("carry")).toBe("Strong");
    expect(modeOfCat("tabata")).toBe("Sweaty");
    expect(modeOfCat("fitboxing")).toBe("Sweaty");
    expect(modeOfCat("pool")).toBe("Water");
    expect(modeOfCat("walk")).toBe("Outside");
    expect(modeOfCat("forest")).toBe("Outside");
    expect(modeOfCat("recovery")).toBe("Recovery");
    expect(modeOfCat("padel")).toBe("Play");
  });

  it("cada modo trae copy (label + line)", () => {
    for (const m of Object.values(MODES)) {
      expect(m.label.length).toBeGreaterThan(0);
      expect(m.line.length).toBeGreaterThan(0);
    }
  });
});
