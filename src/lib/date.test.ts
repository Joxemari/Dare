import { describe, it, expect } from "vitest";
import { todayStr, daysBetween, formatDayLabel, greetingFor } from "./date";

describe("todayStr", () => {
  it("formatea una fecha como YYYY-MM-DD con ceros a la izquierda", () => {
    // mes 0 = enero; comprobamos el padding de mes y día
    expect(todayStr(new Date(2026, 0, 5))).toBe("2026-01-05");
    expect(todayStr(new Date(2026, 11, 31))).toBe("2026-12-31");
  });
});

describe("daysBetween", () => {
  it("cuenta días completos entre dos fechas ISO (b − a)", () => {
    expect(daysBetween("2026-01-01", "2026-01-08")).toBe(7);
  });

  it("es 0 para la misma fecha", () => {
    expect(daysBetween("2026-07-04", "2026-07-04")).toBe(0);
  });

  it("es negativo cuando b es anterior a a", () => {
    expect(daysBetween("2026-01-08", "2026-01-01")).toBe(-7);
  });

  it("cruza correctamente el cambio de mes", () => {
    expect(daysBetween("2026-01-31", "2026-02-01")).toBe(1);
  });
});

describe("formatDayLabel", () => {
  it("formatea 'WEEKDAY D MONTH' en inglés y mayúsculas", () => {
    // 5 de julio de 2026 cae en domingo
    expect(formatDayLabel(new Date(2026, 6, 5))).toBe("SUNDAY 5 JULY");
    // 1 de enero de 2026 cae en jueves
    expect(formatDayLabel(new Date(2026, 0, 1))).toBe("THURSDAY 1 JANUARY");
  });
});

describe("greetingFor", () => {
  it("mañana entre las 5 y las 11", () => {
    expect(greetingFor(5)).toBe("Good morning");
    expect(greetingFor(11)).toBe("Good morning");
  });
  it("tarde entre las 12 y las 17", () => {
    expect(greetingFor(12)).toBe("Good afternoon");
    expect(greetingFor(17)).toBe("Good afternoon");
  });
  it("noche desde las 18 hasta las 4", () => {
    expect(greetingFor(18)).toBe("Good evening");
    expect(greetingFor(23)).toBe("Good evening");
    expect(greetingFor(0)).toBe("Good evening");
    expect(greetingFor(4)).toBe("Good evening");
  });
});
