import { describe, it, expect } from "vitest";
import { generateDare, allowedLocs, currentToDareLocs, destToDareLoc, recentDareIds } from "./generator";
import { DARES } from "../data/dares";
import { journeyById } from "../data/journeys";
import { mulberry32 } from "./prng";
import type { Checkin } from "../types";

/** Ejecuta `fn` con `Math.random` sembrado (mulberry32) y lo restaura después.
 *  Vuelve determinista un test que, por el jitter aleatorio del scoring del
 *  generador, era flaky (el recuento variaba de corrida en corrida). */
function withSeededRandom<T>(seed: number, fn: () => T): T {
  const orig = Math.random;
  const rand = mulberry32(seed);
  Math.random = () => rand();
  try {
    return fn();
  } finally {
    Math.random = orig;
  }
}

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

  it("evita repetir un Dare visto recientemente si hay alternativas", () => {
    // fija un contexto con varias opciones posibles y saca el favorito
    const ci: Checkin = { ...base, energy: 6, time: 20, loc: "home", state: "normal" };
    const alternatives = new Set<string>();
    for (let i = 0; i < 30; i++) alternatives.add(generateDare(ci, [], {}, ember).dare.id);
    expect(alternatives.size).toBeGreaterThan(1); // hay más de un Dare posible

    const [repeated] = [...alternatives];
    let repeats = 0;
    for (let i = 0; i < 60; i++) {
      if (generateDare(ci, [], {}, ember, [repeated]).dare.id === repeated) repeats++;
    }
    // el reciente sale mucho menos que sin penalización (idealmente casi nunca)
    expect(repeats).toBeLessThan(20);
  });

  it("aún devuelve algo aunque todo el pool sea reciente", () => {
    const ci: Checkin = { ...base, time: 3 }; // pool = smalls
    const allSmallIds = DARES.filter((d) => d.cat === "small").map((d) => d.id);
    const { dare } = generateDare(ci, [], {}, ember, allSmallIds);
    expect(dare.cat).toBe("small");
  });

  it("evita un Dare rechazado si hay alternativas", () => {
    withSeededRandom(0xda2e, () => {
      const ci: Checkin = { ...base, energy: 6, time: 20, loc: "home", state: "normal" };
      const options = new Set<string>();
      for (let i = 0; i < 30; i++) options.add(generateDare(ci, [], {}, ember).dare.id);
      expect(options.size).toBeGreaterThan(1);
      const [rejected] = [...options];
      let hits = 0;
      for (let i = 0; i < 60; i++) {
        if (generateDare(ci, [], {}, ember, [], [rejected]).dare.id === rejected) hits++;
      }
      expect(hits).toBeLessThan(10);
    });
  });

  it("la evitación empuja hacia la categoría que hace contacto", () => {
    // avoiding=admin → probable un Dare de admin/task-contact/close/comm/decision/focus
    const ci: Checkin = { energy: 6, time: 10, loc: "home", dest: null, state: "normal", focus: 6, avoiding: "admin" };
    const contactCats = ["admin", "taskcontact", "close", "communication", "decision", "focus"];
    let hits = 0;
    for (let i = 0; i < 60; i++) {
      const { dare } = generateDare(ci, [], {}, ember);
      if (contactCats.includes(dare.cat)) hits++;
    }
    expect(hits).toBeGreaterThan(20);
  });

  it("acepta focus/avoiding sin romper el `why`", () => {
    const ci: Checkin = { energy: 3, time: 10, loc: "home", dest: null, state: "tired", focus: 2, avoiding: "mind" };
    const { why } = generateDare(ci, [], {}, ember);
    expect(why.length).toBeGreaterThan(0);
  });
});

describe("recentDareIds", () => {
  it("devuelve ids únicos, más reciente primero", () => {
    const history = [
      { dareId: "a" },
      { dareId: "b" },
      { dareId: "a" },
      { dareId: "c" },
    ];
    expect(recentDareIds(history)).toEqual(["c", "a", "b"]);
  });

  it("respeta el límite n", () => {
    const history = [{ dareId: "a" }, { dareId: "b" }, { dareId: "c" }, { dareId: "d" }];
    expect(recentDareIds(history, 2)).toEqual(["d", "c"]);
  });

  it("historial vacío → []", () => {
    expect(recentDareIds([])).toEqual([]);
  });
});
