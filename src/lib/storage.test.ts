import { describe, it, expect } from "vitest";
import { _migrate as migrate, defaultStore } from "./storage";

describe("migrate (v2 → v3)", () => {
  it("arranca en v3 con defaults ante entradas vacías/corruptas", () => {
    expect(migrate(null).version).toBe(3);
    expect(migrate("nope" as unknown).version).toBe(3);
    expect(migrate({}).version).toBe(3);
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
    expect(m.version).toBe(3);
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
    // no debe arrastrar `xp` al store v3
    expect((m as unknown as { xp?: number }).xp).toBeUndefined();
  });

  it("es idempotente sobre un store ya v3", () => {
    const s = { ...defaultStore(), onboarded: true, proofLibrary: [{ date: "x", dareId: "y", text: "z" }] };
    const once = migrate(s);
    const twice = migrate(once);
    expect(twice).toEqual(once);
    expect(twice.proofLibrary).toHaveLength(1);
  });
});
