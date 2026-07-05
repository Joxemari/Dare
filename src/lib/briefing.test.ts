import { describe, it, expect } from "vitest";
import { buildBriefing, buildReminder, reminderDue, type BriefingInput } from "./briefing";
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

  it("el cuerpo pendiente combina persona, insight y acción de hoy", () => {
    const b = buildBriefing(base);
    const r = buildReminder(base);
    expect(r.body).toContain(b.person);
    expect(r.body).toContain("Today:");
    expect(r.body.length).toBeGreaterThan(0);
  });
});

describe("reminderDue", () => {
  const prefs: NotificationPrefs = { enabled: true, hour: 9, minute: 0, lastShown: "" };
  const at = (h: number, m = 0) => new Date(2026, 6, 4, h, m); // 2026-07-04 local

  it("no dispara si está desactivado", () => {
    expect(reminderDue({ ...prefs, enabled: false }, at(10), false)).toBe(false);
  });

  it("dispara pasada la hora si no se hizo y no se mostró hoy", () => {
    expect(reminderDue(prefs, at(9, 0), false)).toBe(true);
    expect(reminderDue(prefs, at(10, 30), false)).toBe(true);
  });

  it("no dispara antes de la hora elegida", () => {
    expect(reminderDue(prefs, at(8, 59), false)).toBe(false);
  });

  it("no molesta si el Dare ya se hizo", () => {
    expect(reminderDue(prefs, at(10), true)).toBe(false);
  });

  it("no repite si ya se mostró hoy (dedupe diario)", () => {
    expect(reminderDue({ ...prefs, lastShown: "2026-07-04" }, at(10), false)).toBe(false);
    expect(reminderDue({ ...prefs, lastShown: "2026-07-03" }, at(10), false)).toBe(true);
  });
});
