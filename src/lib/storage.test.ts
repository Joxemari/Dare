import { describe, it, expect } from "vitest";
import { _migrate as migrate, defaultStore } from "./storage";

const DEFAULT_NOTIFS = {
  enabled: false,
  morning: { hour: 9, minute: 0, lastShown: "" },
  evening: { hour: 18, minute: 0, lastShown: "" },
};

describe("migrate (v2/v3/v4 → v5)", () => {
  it("arranca en v5 con defaults ante entradas vacías/corruptas", () => {
    expect(migrate(null).version).toBe(5);
    expect(migrate("nope" as unknown).version).toBe(5);
    expect(migrate({}).version).toBe(5);
    // por defecto no hay ningún Journey activo
    expect(migrate({}).activeJourneyIds).toEqual([]);
    expect(migrate({}).smallVersionUses).toBe(0);
  });

  it("añade el default de notifications e install a un store sin ellos", () => {
    expect(migrate({}).notifications).toEqual(DEFAULT_NOTIFS);
    expect(migrate({}).install).toEqual({ dismissedAt: "", installedAt: "" });
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
    expect(m.version).toBe(5);
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
    expect(m.version).toBe(5);
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

  it("es idempotente sobre un store ya v5", () => {
    const s = { ...defaultStore(), onboarded: true, activeJourneyIds: ["ember" as const], proofLibrary: [{ date: "x", dareId: "y", text: "z" }] };
    const once = migrate(s);
    const twice = migrate(once);
    expect(twice).toEqual(once);
    expect(twice.proofLibrary).toHaveLength(1);
    expect(twice.activeJourneyIds).toEqual(["ember"]);
  });

  it("v3 → v5: conserva lo transferible y recibe notifications por defecto", () => {
    const v3 = {
      ...defaultStore(),
      version: 3 as unknown as 5, // simula un store guardado por un build v3
      onboarded: true,
      momentum: { count: 4, lastDate: "2026-07-03" },
    };
    // un store v3 no llevaba `notifications` ni `install`
    delete (v3 as Record<string, unknown>).notifications;
    delete (v3 as Record<string, unknown>).install;
    const m = migrate(v3);
    expect(m.version).toBe(5);
    expect(m.onboarded).toBe(true);
    expect(m.momentum).toEqual({ count: 4, lastDate: "2026-07-03" });
    expect(m.notifications).toEqual(DEFAULT_NOTIFS);
    expect(m.install).toEqual({ dismissedAt: "", installedAt: "" });
  });

  it("v4 → v5: promueve la hora única a la franja de la mañana; tarde por defecto", () => {
    // un store v4 traía `notifications: { enabled, hour, minute, lastShown }`
    const v4 = {
      ...defaultStore(),
      version: 4 as unknown as 5,
      notifications: { enabled: true, hour: 7, minute: 30, lastShown: "2026-07-04" } as never,
    };
    delete (v4 as Record<string, unknown>).install;
    const m = migrate(v4);
    expect(m.version).toBe(5);
    expect(m.notifications).toEqual({
      enabled: true,
      morning: { hour: 7, minute: 30, lastShown: "2026-07-04" },
      evening: { hour: 18, minute: 0, lastShown: "" },
    });
    // install no existía en v4 → default
    expect(m.install).toEqual({ dismissedAt: "", installedAt: "" });
  });

  it("preserva unas notifications v5 ya guardadas (completando franjas que falten)", () => {
    const s = {
      ...defaultStore(),
      notifications: {
        enabled: true,
        morning: { hour: 8, minute: 15, lastShown: "2026-07-04" },
        evening: { hour: 20, minute: 0, lastShown: "" },
      },
    };
    expect(migrate(s).notifications).toEqual(s.notifications);
    // parcial → completa la franja que falte desde el default
    const partial = {
      ...defaultStore(),
      notifications: { enabled: true, morning: { hour: 6 } } as never,
    };
    expect(migrate(partial).notifications).toEqual({
      enabled: true,
      morning: { hour: 6, minute: 0, lastShown: "" },
      evening: { hour: 18, minute: 0, lastShown: "" },
    });
  });

  it("preserva el estado de install (completando campos que falten)", () => {
    const s = { ...defaultStore(), install: { dismissedAt: "2026-07-01", installedAt: "" } };
    expect(migrate(s).install).toEqual({ dismissedAt: "2026-07-01", installedAt: "" });
    const partial = { ...defaultStore(), install: { installedAt: "2026-07-02" } as never };
    expect(migrate(partial).install).toEqual({ dismissedAt: "", installedAt: "2026-07-02" });
  });
});
