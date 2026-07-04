import { describe, it, expect } from "vitest";
import { dayVariants, defaultVariant, VARIANT_SYM } from "./journeys";
import { SYMBOLS } from "./symbols";
import type { DayPlan } from "../types";

const base: DayPlan = { day: 1, title: "T", cat: "walk" };

describe("dayVariants / defaultVariant", () => {
  it("un día sin contenido rico no tiene variantes", () => {
    expect(dayVariants(base)).toEqual([]);
    expect(defaultVariant(base)).toBeNull();
  });

  it("ordena Soft → Real → Bold y sólo incluye las presentes", () => {
    const p: DayPlan = { ...base, soft: "s", dare: "r", bold: "b" };
    expect(dayVariants(p).map((v) => v.key)).toEqual(["soft", "real", "bold"]);
    const only = dayVariants({ ...base, soft: "s", bold: "b" }).map((v) => v.key);
    expect(only).toEqual(["soft", "bold"]); // sin `dare` no hay "real"
  });

  it("cada variante lleva su texto y un símbolo válido", () => {
    const p: DayPlan = { ...base, soft: "easy", dare: "real", bold: "hard" };
    const vs = dayVariants(p);
    expect(vs.find((v) => v.key === "real")!.text).toBe("real");
    for (const v of vs) expect(SYMBOLS[v.sym], v.key).toBeTruthy();
    expect(VARIANT_SYM).toEqual({ soft: "soft", real: "strong", bold: "forge" });
  });

  it("defaultVariant prefiere Real; si no, la primera disponible", () => {
    expect(defaultVariant({ ...base, soft: "s", dare: "r", bold: "b" })).toBe("real");
    expect(defaultVariant({ ...base, soft: "s", bold: "b" })).toBe("soft");
    expect(defaultVariant({ ...base, bold: "b" })).toBe("bold");
  });
});
