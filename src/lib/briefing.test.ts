import { describe, it, expect } from "vitest";
import { buildBriefing, buildReminder, dueSlot, type BriefingInput } from "./briefing";
import { BRIEFINGS } from "../data/briefings";
import type { NotificationPrefs } from "../types";

const base: BriefingInput = { date: "2026-07-04", doneToday: false };

/** Palabras prohibidas por el vocabulario del producto (ver CLAUDE.md). */
const BANNED = ["xp", "level", "streak", "calorie", "burn", "badge", "draw a card", "draw your card"];

describe("buildBriefing", () => {
  it("es determinista para el mismo input", () => {
    expect(buildBriefing(base)).toEqual(buildBriefing(base));
  });

  it("devuelve persona, insight y acción no vacíos", () => {
    const b = buildBriefing(base);
    expect(b.person.length).toBeGreaterThan(0);
    expect(b.insight.length).toBeGreaterThan(0);
    expect(b.action.length).toBeGreaterThan(0);
  });

  it("la lectura elegida existe en la biblioteca", () => {
    const b = buildBriefing(base);
    expect(BRIEFINGS.some((e) => e.person === b.person && e.action === b.action)).toBe(true);
  });

  it("varía la lectura al cambiar de día", () => {
    const days = ["2026-07-01", "2026-07-02", "2026-07-03", "2026-07-04", "2026-07-05"];
    const people = new Set(days.map((date) => buildBriefing({ ...base, date }).person));
    expect(people.size).toBeGreaterThan(1);
  });

  it("ninguna lectura de la biblioteca usa vocabulario prohibido", () => {
    for (const e of BRIEFINGS) {
      const text = `${e.person} ${e.insight} ${e.action}`.toLowerCase();
      for (const w of BANNED) expect(text.includes(w), `${e.person} contiene "${w}"`).toBe(false);
    }
  });
});

describe("buildReminder", () => {
  it("no regaña cuando el Dare ya está hecho", () => {
    expect(buildReminder({ ...base, doneToday: true }).title).toBe("Your day is done");
    expect(buildReminder({ ...base, doneToday: false }).title).toBe("Today's briefing");
  });

  it("la franja de la tarde reconoce el día sin culpar", () => {
    expect(buildReminder({ ...base, doneToday: false }, "morning").title).toBe("Today's briefing");
    expect(buildReminder({ ...base, doneToday: false }, "evening").title).toBe("Still time today");
    // si ya está hecho, el título es el mismo en cualquier franja
    expect(buildReminder({ ...base, doneToday: true }, "evening").title).toBe("Your day is done");
  });

  it("el cuerpo pendiente combina persona, insight y acción de hoy", () => {
    const b = buildBriefing(base);
    const r = buildReminder(base);
    expect(r.body).toContain(b.person);
    expect(r.body).toContain("Today:");
    expect(r.body.length).toBeGreaterThan(0);
  });
});

describe("dueSlot", () => {
  const prefs: NotificationPrefs = {
    enabled: true,
    morning: { hour: 9, minute: 0, lastShown: "" },
    evening: { hour: 18, minute: 0, lastShown: "" },
  };
  const at = (h: number, m = 0) => new Date(2026, 6, 4, h, m); // 2026-07-04 local

  it("no dispara ninguna franja si está desactivado", () => {
    expect(dueSlot({ ...prefs, enabled: false }, at(10), false)).toBe(null);
  });

  it("dispara la mañana en su ventana [09:00, 18:00)", () => {
    expect(dueSlot(prefs, at(9, 0), false)).toBe("morning");
    expect(dueSlot(prefs, at(12, 30), false)).toBe("morning");
    expect(dueSlot(prefs, at(17, 59), false)).toBe("morning");
  });

  it("no dispara antes de la hora de la mañana", () => {
    expect(dueSlot(prefs, at(8, 59), false)).toBe(null);
  });

  it("dispara la tarde a partir de las 18:00 (prioridad sobre la mañana)", () => {
    expect(dueSlot(prefs, at(18, 0), false)).toBe("evening");
    expect(dueSlot(prefs, at(21, 0), false)).toBe("evening");
  });

  it("no molesta ninguna franja si el Dare ya se hizo", () => {
    expect(dueSlot(prefs, at(10), true)).toBe(null);
    expect(dueSlot(prefs, at(20), true)).toBe(null);
  });

  it("dedupe independiente por franja", () => {
    // mañana ya mostrada hoy → no repite por la mañana...
    const morningShown = { ...prefs, morning: { ...prefs.morning, lastShown: "2026-07-04" } };
    expect(dueSlot(morningShown, at(10), false)).toBe(null);
    // ...pero la tarde sí puede avisar el mismo día
    expect(dueSlot(morningShown, at(19), false)).toBe("evening");
  });

  it("no reavisa una mañana ya pasada al abrir por la noche", () => {
    // por la noche, con la mañana SIN mostrar: no se dispara la mañana stale
    expect(dueSlot(prefs, at(20), false)).toBe("evening");
    const eveningShown = { ...prefs, evening: { ...prefs.evening, lastShown: "2026-07-04" } };
    expect(dueSlot(eveningShown, at(20), false)).toBe(null);
  });

  it("al día siguiente vuelven a estar disponibles ambas franjas", () => {
    const shownYesterday: NotificationPrefs = {
      enabled: true,
      morning: { hour: 9, minute: 0, lastShown: "2026-07-03" },
      evening: { hour: 18, minute: 0, lastShown: "2026-07-03" },
    };
    expect(dueSlot(shownYesterday, at(10), false)).toBe("morning");
    expect(dueSlot(shownYesterday, at(19), false)).toBe("evening");
  });
});
