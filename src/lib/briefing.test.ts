import { describe, it, expect } from "vitest";
import { buildBriefing, buildReminder, reminderDue, type BriefingInput } from "./briefing";
import type { NotificationPrefs } from "../types";

const base: BriefingInput = {
  date: "2026-07-04",
  hour: 9,
  momentum: 3,
  journeyName: "The Ember",
  journeySym: "spark",
  chapterName: "Chapter I",
  daysDone: 3,
  sprintDays: 7,
  doneToday: false,
  dareTitle: null,
  cardName: null,
  topEnergyLabel: null,
  proofCount: 5,
};

/** Palabras prohibidas por el vocabulario del producto (ver CLAUDE.md). */
const BANNED = ["XP", "level", "streak", "calorie", "burn", "badge"];

describe("buildBriefing", () => {
  it("es determinista para el mismo input", () => {
    expect(buildBriefing(base)).toEqual(buildBriefing(base));
  });

  it("varía el titular al cambiar de día", () => {
    const days = ["2026-07-01", "2026-07-02", "2026-07-03", "2026-07-04", "2026-07-05"];
    const heads = new Set(days.map((date) => buildBriefing({ ...base, date }).headline));
    // No exigimos 5 distintos (pool pequeño), pero sí que no sea siempre el mismo.
    expect(heads.size).toBeGreaterThan(1);
  });

  it("adapta el saludo a la hora local", () => {
    expect(buildBriefing({ ...base, hour: 8 }).greeting).toBe("Good morning.");
    expect(buildBriefing({ ...base, hour: 14 }).greeting).toBe("Good afternoon.");
    expect(buildBriefing({ ...base, hour: 21 }).greeting).toBe("Good evening.");
  });

  it("el focus refleja si el Dare ya se hizo", () => {
    const pending = buildBriefing({ ...base, doneToday: false, dareTitle: "10-min walk" });
    expect(pending.focus).toContain("10-min walk");
    const done = buildBriefing({ ...base, doneToday: true, proofCount: 1 });
    expect(done.focus).toContain("1 proof");
    expect(done.focus).not.toContain("proofs");
  });

  it("guía a sacar carta / check-in cuando no hay Dare pendiente", () => {
    expect(buildBriefing({ ...base, cardName: null }).focus).toMatch(/Draw your card/);
    expect(buildBriefing({ ...base, cardName: "The Sun" }).focus).toMatch(/Check in/);
  });

  it("habla de momentum sin lenguaje de rachas", () => {
    expect(buildBriefing({ ...base, momentum: 0 }).lines[0]).toMatch(/Just begin/);
    expect(buildBriefing({ ...base, momentum: 1 }).lines[0]).toMatch(/One day/);
    expect(buildBriefing({ ...base, momentum: 9 }).lines[0]).toContain("9 days");
  });

  it("no usa vocabulario prohibido en ninguna variante", () => {
    for (const hour of [8, 14, 21]) {
      for (const doneToday of [true, false]) {
        for (const momentum of [0, 1, 5]) {
          const b = buildBriefing({ ...base, hour, doneToday, momentum, topEnergyLabel: "Walk" });
          const text = [b.headline, b.focus, ...b.lines].join(" ").toLowerCase();
          for (const w of BANNED) expect(text).not.toContain(w.toLowerCase());
        }
      }
    }
  });
});

describe("buildReminder", () => {
  it("tira del Dare pendiente y no regaña cuando ya está hecho", () => {
    expect(buildReminder({ ...base, doneToday: false }).title).toBe("Your dare is waiting");
    expect(buildReminder({ ...base, doneToday: true }).title).toBe("Your day is done");
  });

  it("el cuerpo combina titular y focus", () => {
    const r = buildReminder({ ...base, dareTitle: "10-min walk" });
    expect(r.body).toContain("10-min walk");
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
    // pero sí al día siguiente
    expect(reminderDue({ ...prefs, lastShown: "2026-07-03" }, at(10), false)).toBe(true);
  });
});
