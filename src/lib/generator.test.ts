import { describe, it, expect } from "vitest";
import { generateDare, allowedLocs, currentToDareLocs, destToDareLoc } from "./generator";
import { journeyById } from "../data/journeys";
import type { Checkin } from "../types";

const ember = journeyById("ember");
const base: Checkin = { energy: 6, time: 20, loc: "home", dest: null, state: "normal" };

describe("currentToDareLocs / destToDareLoc", () => {
  it("mapea el contexto actual a localizaciones de Dare", () => {
    expect(currentToDareLocs("home")).toEqual(["home"]);
    expect(currentToDareLocs("park")).toContain("forest");
    expect(currentToDareLocs("city")).toEqual(["outside"]);
  });

  it("mapea el destino a una localización de Dare", () => {
    expect(destToDareLoc("pool")).toBe("pool");
    expect(destToDareLoc("cafe")).toBe("outside");
    expect(destToDareLoc("gym")).toBe("gym");
  });
});

describe("allowedLocs", () => {
  it("sin destino usa el contexto actual", () => {
    expect(allowedLocs({ ...base, loc: "home", dest: null })).toEqual(["home"]);
  });
  it("con destino usa solo el destino", () => {
    expect(allowedLocs({ ...base, loc: "home", dest: "pool" })).toEqual(["pool"]);
  });
});

describe("generateDare", () => {
  it("con time=3 siempre devuelve un Small Dare", () => {
    const { dare } = generateDare({ ...base, time: 3 }, [], {}, ember);
    expect(dare.cat).toBe("small");
  });

  it("respeta la localización actual (en casa no manda a la piscina)", () => {
    for (let i = 0; i < 40; i++) {
      const { dare } = generateDare({ ...base, loc: "home", dest: null }, [], {}, ember);
      // debe poder hacerse en casa (o ser un small, que es comodín)
      expect(dare.locs.includes("home") || dare.cat === "small").toBe(true);
    }
  });

  it("un destino de piscina hace probable un Dare de piscina", () => {
    let poolHits = 0;
    for (let i = 0; i < 60; i++) {
      const { dare } = generateDare({ ...base, energy: 7, dest: "pool" }, [], {}, ember);
      if (dare.cat === "pool") poolHits++;
      // nunca debe salir algo imposible en la piscina salvo el comodín small
      expect(["pool", "small"]).toContain(dare.cat);
    }
    expect(poolHits).toBeGreaterThan(0);
  });

  it("energía baja evita niveles Strong", () => {
    for (let i = 0; i < 40; i++) {
      const { dare } = generateDare({ ...base, energy: 2, state: "tired" }, [], {}, ember);
      expect(dare.level).not.toBe("Strong");
    }
  });

  it("devuelve un `why` no vacío", () => {
    const { why } = generateDare(base, [], {}, ember);
    expect(why.length).toBeGreaterThan(0);
  });
});
