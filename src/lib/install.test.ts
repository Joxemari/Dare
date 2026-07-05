import { describe, it, expect } from "vitest";
import { isIOS, isInStandaloneMode, installOffer, type InstallOfferInput } from "./install";

describe("isIOS", () => {
  it("detecta iPhone/iPad/iPod", () => {
    expect(isIOS("Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)")).toBe(true);
    expect(isIOS("Mozilla/5.0 (iPad; CPU OS 16_0 like Mac OS X)")).toBe(true);
  });
  it("no marca Android ni escritorio como iOS", () => {
    expect(isIOS("Mozilla/5.0 (Linux; Android 14; Pixel 8)")).toBe(false);
    expect(isIOS("Mozilla/5.0 (Windows NT 10.0; Win64; x64)")).toBe(false);
  });
});

describe("isInStandaloneMode", () => {
  it("es true si cualquiera de las dos señales lo indica", () => {
    expect(isInStandaloneMode(true, false)).toBe(true);
    expect(isInStandaloneMode(false, true)).toBe(true);
    expect(isInStandaloneMode(true, true)).toBe(true);
  });
  it("es false si ninguna", () => {
    expect(isInStandaloneMode(false, false)).toBe(false);
  });
});

describe("installOffer", () => {
  const base: InstallOfferInput = {
    standalone: false,
    ios: false,
    promptAvailable: true,
    proofCount: 3,
    activeJourneys: 1,
    dismissedAt: "",
    today: "2026-07-05",
  };

  it("no ofrece nada si ya está instalada", () => {
    expect(installOffer({ ...base, standalone: true })).toBe("none");
  });

  it("no molesta el día 1 (sin proofs ni journeys activos)", () => {
    expect(installOffer({ ...base, proofCount: 0, activeJourneys: 0 })).toBe("none");
  });

  it("ofrece si hay algo que perder por proofs O por journey activo", () => {
    expect(installOffer({ ...base, proofCount: 1, activeJourneys: 0 })).toBe("prompt");
    expect(installOffer({ ...base, proofCount: 0, activeJourneys: 1 })).toBe("prompt");
  });

  it("con beforeinstallprompt disponible → prompt (1 toque)", () => {
    expect(installOffer({ ...base, promptAvailable: true, ios: false })).toBe("prompt");
  });

  it("en iOS sin evento → instrucciones manuales", () => {
    expect(installOffer({ ...base, promptAvailable: false, ios: true })).toBe("ios-manual");
  });

  it("en escritorio sin evento ni iOS → none", () => {
    expect(installOffer({ ...base, promptAvailable: false, ios: false })).toBe("none");
  });

  it("silencia el nudge durante la ventana de descarte", () => {
    // descartado hoy → dentro de la ventana → none
    expect(installOffer({ ...base, dismissedAt: "2026-07-05" })).toBe("none");
    // descartado hace 5 días (< 14) → none
    expect(installOffer({ ...base, dismissedAt: "2026-06-30" })).toBe("none");
  });

  it("vuelve a ofrecer una vez pasada la ventana de descarte", () => {
    // descartado hace 20 días (>= 14) → vuelve a ofrecer
    expect(installOffer({ ...base, dismissedAt: "2026-06-15" })).toBe("prompt");
  });

  it("respeta un snoozeDays personalizado", () => {
    expect(installOffer({ ...base, dismissedAt: "2026-07-03", snoozeDays: 30 })).toBe("none");
    expect(installOffer({ ...base, dismissedAt: "2026-07-03", snoozeDays: 1 })).toBe("prompt");
  });
});
