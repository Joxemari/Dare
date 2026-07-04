import { describe, it, expect } from "vitest";
import { earnedTraits } from "./achievements";
import { findDare } from "./lookup";
import type { Checkin, Dare } from "../types";

const dumbbell = findDare("iron-first-weight")!;
const small = findDare("out-the-door")!;
const strongForest = findDare("forest-intervals")!; // level "Strong"

function ctx(over: Partial<Parameters<typeof earnedTraits>[0]>) {
  const baseCi: Checkin = { energy: 6, time: 12, loc: "home", dest: null, state: "normal" };
  return earnedTraits({
    dare: dumbbell as Dare,
    ci: baseCi,
    counts: {},
    totalCompleted: 1,
    distinctDays: 1,
    smallVersionUses: 0,
    have: () => false,
    ...over,
  });
}

describe("earnedTraits (badges) — hitos, no premios por acción", () => {
  it("otorga 'starter' en el primer dare completado", () => {
    expect(ctx({})).toContain("starter");
  });

  it("la mayoría de completions no desbloquean badges nuevos", () => {
    // ya tiene starter, no cruza ningún umbral → sin badges nuevos
    expect(ctx({ have: (id) => id === "starter" })).toEqual([]);
  });

  it("otorga 'courageous' con un Dare de nivel Strong", () => {
    expect(ctx({ dare: strongForest, have: (id) => id === "starter" })).toContain("courageous");
  });

  it("'water-reset' requiere 3 dares de piscina (no salta con 1)", () => {
    expect(ctx({ counts: { pool: 1 }, have: (id) => id === "starter" })).not.toContain("water-reset");
    expect(ctx({ counts: { pool: 3 }, have: (id) => id === "starter" })).toContain("water-reset");
  });

  it("'forest-mind' requiere 3 dares de bosque", () => {
    expect(ctx({ counts: { forest: 3 }, have: (id) => id === "starter" })).toContain("forest-mind");
  });

  it("'focus-keeper' requiere 3 dares de focus", () => {
    expect(ctx({ counts: { focus: 2 }, have: (id) => id === "starter" })).not.toContain("focus-keeper");
    expect(ctx({ counts: { focus: 3 }, have: (id) => id === "starter" })).toContain("focus-keeper");
  });

  it("'builder' se gana con 5 dares de fuerza acumulados", () => {
    expect(ctx({ counts: { dumbbells: 3, carry: 2 }, have: (id) => id === "starter" })).toContain("builder");
  });

  it("'rhythm-finder' requiere repetir la misma categoría 3 veces", () => {
    expect(ctx({ dare: dumbbell, counts: { dumbbells: 3 }, have: (id) => id === "starter" })).toContain("rhythm-finder");
  });

  it("'momentum-keeper' requiere dares en 3 días distintos", () => {
    expect(ctx({ distinctDays: 2, have: (id) => id === "starter" })).not.toContain("momentum-keeper");
    expect(ctx({ distinctDays: 3, have: (id) => id === "starter" })).toContain("momentum-keeper");
  });

  it("'reset-artist' requiere usar la versión de baja energía 3 veces", () => {
    expect(ctx({ smallVersionUses: 3, dare: small, have: (id) => id === "starter" })).toContain("reset-artist");
  });

  it("no re-otorga badges ya conseguidos", () => {
    expect(ctx({ have: (id) => id === "starter" })).not.toContain("starter");
  });
});
