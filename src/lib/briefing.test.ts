import { describe, it, expect } from "vitest";
import { buildBriefing, buildReminder, dueSlot, type BriefingInput } from "./briefing";
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

  it("la franja de la tarde reconoce el día sin culpar", () => {
    expect(buildReminder({ ...base, doneToday: false }, "morning").title).toBe("Your dare is waiting");
    expect(buildReminder({ ...base, doneToday: false }, "evening").title).toBe("Still time today");
    // si ya está hecho, el título es el mismo en cualquier franja
    expect(buildReminder({ ...base, doneToday: true }, "evening").title).toBe("Your day is done");
  });

  it("el cuerpo combina titular y focus", () => {
    const r = buildReminder({ ...base, dareTitle: "10-min walk" });
    expect(r.body).toContain("10-min walk");
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
