import { describe, it, expect } from "vitest";
import { validateDare, validateWildcard, validateTreat, type ValidateCtx } from "./contentSchema";
import type { Dare } from "../types";

const CTX: ValidateCtx = {
  existingIds: ["already-used"],
  scienceIds: ["nature", "walking-outdoors"],
};

/** Un Dare válido de referencia; cada test lo rompe por un solo campo. */
const base: Dare = {
  id: "new-dare",
  title: "New Dare",
  cat: "walk",
  min: 15,
  level: "Easy",
  energy: [3, 8],
  locs: ["city", "park"],
  companion: "A podcast.",
  trigger: "Just the door.",
  proof: "Moved before negotiating.",
  effects: { Energy: 2, Mood: 1 },
  scienceId: "walking-outdoors",
  steps: ["Shoes on", "Out the door", "Walk one loop"],
};

describe("validateDare", () => {
  it("un Dare correcto no tiene errores", () => {
    expect(validateDare(base, CTX)).toEqual([]);
  });

  it("rechaza id duplicado (generación debe ser aditiva)", () => {
    const errs = validateDare({ ...base, id: "already-used" }, CTX);
    expect(errs.join()).toMatch(/ya existe/);
  });

  it("rechaza id con formato inválido", () => {
    expect(validateDare({ ...base, id: "New Dare" }, CTX).join()).toMatch(/kebab-case/);
    expect(validateDare({ ...base, id: "new_dare" }, CTX).join()).toMatch(/kebab-case/);
  });

  it("rechaza cat/level inválidos", () => {
    expect(validateDare({ ...base, cat: "yoga" as Dare["cat"] }, CTX).join()).toMatch(/cat inválida/);
    expect(validateDare({ ...base, level: "Extreme" as Dare["level"] }, CTX).join()).toMatch(/level inválido/);
  });

  it("valida el rango de energy", () => {
    expect(validateDare({ ...base, energy: [8, 3] }, CTX).join()).toMatch(/invertido/);
    expect(validateDare({ ...base, energy: [0, 12] }, CTX).join()).toMatch(/fuera de 1\.\.10/);
    expect(validateDare({ ...base, energy: [5] as unknown as Dare["energy"] }, CTX).join()).toMatch(/\[lo, hi\]/);
  });

  it("exige effects con claves e intensidades válidas", () => {
    expect(validateDare({ ...base, effects: {} }, CTX).join()).toMatch(/effects vacío/);
    expect(validateDare({ ...base, effects: { Vibes: 2 } as unknown as Dare["effects"] }, CTX).join()).toMatch(/effect inválido/);
    expect(validateDare({ ...base, effects: { Energy: 5 } as unknown as Dare["effects"] }, CTX).join()).toMatch(/intensidad/);
  });

  it("rechaza locs inválidas o vacías", () => {
    expect(validateDare({ ...base, locs: [] }, CTX).join()).toMatch(/locs vacío/);
    expect(validateDare({ ...base, locs: ["moon"] as unknown as Dare["locs"] }, CTX).join()).toMatch(/loc inválida/);
  });

  it("exige que scienceId exista si se indica", () => {
    expect(validateDare({ ...base, scienceId: "made-up" }, CTX).join()).toMatch(/no existe/);
  });

  it("bloquea ejercicios de suelo con manos apoyadas", () => {
    expect(validateDare({ ...base, steps: ["Do 10 push-ups"] }, CTX).join()).toMatch(/prohibido/);
    expect(validateDare({ ...base, title: "Plank Party" }, CTX).join()).toMatch(/prohibido/);
  });

  it("bloquea vocabulario de gamificación prohibido", () => {
    expect(validateDare({ ...base, trigger: "Level up your XP!" }, CTX).join()).toMatch(/vocabulario prohibido/);
    expect(validateDare({ ...base, proof: "Burned 200 calories." }, CTX).join()).toMatch(/vocabulario prohibido/);
  });

  it("acumula varios errores a la vez", () => {
    const errs = validateDare({ id: "Bad Id", cat: "nope" }, CTX);
    expect(errs.length).toBeGreaterThan(3);
  });
});

describe("validateWildcard", () => {
  const wild: Dare = { ...base, id: "w-new", wild: true };
  it("un wildcard válido (wild:true) no tiene errores", () => {
    expect(validateWildcard(wild, CTX)).toEqual([]);
  });
  it("exige wild:true", () => {
    expect(validateWildcard({ ...base, id: "w-new" }, CTX).join()).toMatch(/wild: true/);
  });
  it("hereda las reglas de Dare (p. ej. id aditivo)", () => {
    expect(validateWildcard({ ...wild, id: "already-used" }, CTX).join()).toMatch(/ya existe/);
  });
});

describe("validateTreat", () => {
  it("un treat válido no tiene errores", () => {
    expect(validateTreat({ tier: "common", text: "A cold drink you like." })).toEqual([]);
    expect(validateTreat({ tier: "common", text: "Five more minutes outside.", fits: ["forest", "walk"] })).toEqual([]);
  });
  it("exige text y tier válido", () => {
    expect(validateTreat({ tier: "common", text: "" }).join()).toMatch(/falta text/);
    expect(validateTreat({ tier: "silver", text: "x" }).join()).toMatch(/tier inválido/);
  });
  it("valida fits/avoid como categorías reales", () => {
    expect(validateTreat({ tier: "common", text: "x", fits: ["moon"] }).join()).toMatch(/cat inválida/);
    expect(validateTreat({ tier: "rare", text: "x", avoid: "pool" }).join()).toMatch(/debe ser array/);
  });
  it("special solo en golden y de la lista", () => {
    expect(validateTreat({ tier: "common", text: "x", special: "golden" }).join()).toMatch(/solo en treats golden/);
    expect(validateTreat({ tier: "golden", text: "x", special: "mega" }).join()).toMatch(/special inválido/);
    expect(validateTreat({ tier: "golden", text: "x", special: "golden" })).toEqual([]);
  });
  it("bloquea vocabulario prohibido y textos duplicados", () => {
    expect(validateTreat({ tier: "common", text: "Burn 200 today." }).join()).toMatch(/vocabulario prohibido/);
    expect(validateTreat({ tier: "common", text: "A nap." }, { existingTexts: ["A nap."] }).join()).toMatch(/duplicado/);
  });
});
