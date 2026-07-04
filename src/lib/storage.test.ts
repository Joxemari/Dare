import { describe, it, expect } from "vitest";
import { _migrate as migrate, defaultStore } from "./storage";

describe("migrate (v2/v3 → v4)", () => {
  it("arranca en v4 con defaults ante entradas vacías/corruptas", () => {
    expect(migrate(null).version).toBe(4);
    expect(migrate("nope" as unknown).version).toBe(4);
    expect(migrate({}).version).toBe(4);
    // por defecto no hay ningún Journey activo
    expect(migrate({}).activeJourneyIds).toEqual([]);
    expect(migrate({}).smallVersionUses).toBe(0);
  });

  it("remapea el vocabulario v2 al de producto", () => {
    const v2 = {
      version: 2,
      onboarded: true,
      journeyId: "iron",
      xp: 420,
      streak: { count: 5, lastDate: "2026-07-01" },
      badges: ["showed-up", "strength"],
      rewardDraws: [{ date: "2026-07-01", tier: "common", text: "Coffee" }],
      tarot: { date: "2026-07-01", options: ["fool"], cardId: "fool" },
      completed: [{ dareId: "out-the-door", date: "2026-07-01", xp: 10 }],
      catCounts: { walk: 3 },
    };
    const m = migrate(v2);
    expect(m.version).toBe(4);
    expect(m.onboarded).toBe(true);
    expect(m.journeyId).toBe("iron");
    // streak → momentum
    expect(m.momentum).toEqual({ count: 5, lastDate: "2026-07-01" });
    // rewardDraws → treats
    expect(m.treats).toHaveLength(1);
    // tarot → dailyCard
    expect(m.dailyCard?.cardId).toBe("fool");
    // completed pierde xp pero conserva dareId/date
    expect(m.completed[0]).toEqual({ dareId: "out-the-door", date: "2026-07-01" });
    expect(m.catCounts.walk).toBe(3);
    // badges v2 no mapean a traits (empieza vacío)
    expect(m.traits).toEqual([]);
    // no debe arrastrar `xp` al store v4
    expect((m as unknown as { xp?: number }).xp).toBeUndefined();
  });

  it("v3 → v4 deriva activeJourneyIds del progreso existente", () => {
    const v3 = {
      version: 3,
      onboarded: true,
      journeyId: "ember",
      journeyProgress: { ember: 3, iron: 0, water: 0 },
      journeysCompleted: [],
    };
    const m = migrate(v3);
    expect(m.version).toBe(4);
    // The Ember tenía progreso → sigue activo tras migrar
    expect(m.activeJourneyIds).toContain("ember");
    expect(m.activeJourneyIds).not.toContain("iron");
  });

  it("v3 → v4 marca activos los journeys completados", () => {
    const v3 = {
      version: 3,
      onboarded: true,
      journeyProgress: { ember: 7, iron: 0, water: 0 },
      journeysCompleted: ["ember"],
    };
    expect(migrate(v3).activeJourneyIds).toContain("ember");
  });

  it("es idempotente sobre un store ya v4", () => {
    const s = { ...defaultStore(), onboarded: true, activeJourneyIds: ["ember" as const], proofLibrary: [{ date: "x", dareId: "y", text: "z" }] };
    const once = migrate(s);
    const twice = migrate(once);
    expect(twice).toEqual(once);
    expect(twice.proofLibrary).toHaveLength(1);
    expect(twice.activeJourneyIds).toEqual(["ember"]);
  });
});
