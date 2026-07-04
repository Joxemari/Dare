import { describe, it, expect } from "vitest";
import { todayStr, daysBetween } from "./date";

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
