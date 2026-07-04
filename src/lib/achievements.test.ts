import { describe, it, expect } from "vitest";
import { earnedTraits } from "./achievements";
import { findDare } from "./lookup";
import type { Cat, Checkin, Dare } from "../types";

const dumbbell = findDare("iron-first-weight")!;
const small = findDare("out-the-door")!;
const pool = findDare("water-reset")!;

function ctx(over: Partial<Parameters<typeof earnedTraits>[0]>) {
  const baseCi: Checkin = { energy: 6, time: 12, loc: "home", dest: null, state: "normal" };
  return earnedTraits({
    dare: dumbbell as Dare,
    ci: baseCi,
    counts: {},
    totalCompleted: 1,
    nToday: 1,
    hour: 10,
    momentum: 1,
    usedSmallVersion: false,
    restartedAfterGap: false,
    prevCat: undefined,
    have: () => false,
    ...over,
  });
}

describe("earnedTraits", () => {
  it("otorga 'starter' en el primer dare completado", () => {
    expect(ctx({})).toContain("starter");
  });

  it("otorga 'strength-builder' con un dare de fuerza", () => {
    expect(ctx({ dare: dumbbell })).toContain("strength-builder");
  });

  it("otorga 'minimalist' con un Small Dare", () => {
    expect(ctx({ dare: small })).toContain("minimalist");
  });

  it("otorga 'water-reset' con un dare de piscina", () => {
    expect(ctx({ dare: pool })).toContain("water-reset");
  });

  it("otorga 'unblocked' con energía ≤ 3", () => {
    const ci: Checkin = { energy: 2, time: 12, loc: "home", dest: null, state: "tired" };
    expect(ctx({ ci })).toContain("unblocked");
  });

  it("otorga 'extra-spark' en el segundo dare del día", () => {
    expect(ctx({ nToday: 2 })).toContain("extra-spark");
  });

  it("otorga 'night-mover' pasadas las 21h", () => {
    expect(ctx({ hour: 22 })).toContain("night-mover");
  });

  it("otorga 'consistent' con momentum ≥ 7", () => {
    expect(ctx({ momentum: 7 })).toContain("consistent");
  });

  it("no re-otorga traits ya conseguidos", () => {
    expect(ctx({ have: (id) => id === "starter" })).not.toContain("starter");
  });

  it("otorga 'rhythm-finder' si repite categoría", () => {
    expect(ctx({ prevCat: "dumbbells" as Cat })).toContain("rhythm-finder");
  });

  it("otorga 'forest-mind' al tercer dare de bosque", () => {
    const forest = findDare("pine-reset")!;
    expect(ctx({ dare: forest, counts: { forest: 3 } })).toContain("forest-mind");
  });
});
