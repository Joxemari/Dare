import { describe, it, expect } from "vitest";
import { generateDare, generateJourneyDayDare, energyForState, allowedLocs, currentToDareLocs, destToDareLoc, recentDareIds, timeFitScore } from "./generator";
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

  it("'anywhere' (Send me somewhere) admite localizaciones de destino", () => {
    const locs = currentToDareLocs("anywhere");
    expect(locs).toContain("pool");
    expect(locs).toContain("gym");
    expect(locs).toContain("forest");
    // no te deja en casa
    expect(locs).not.toContain("home");
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

  it("el vibe 'watch' hace más probable un Dare con companion de entretenimiento", () => {
    // en casa, energía media, tiempo cómodo → hay dumbbells/tabata (Netflix/playlist)
    const at = { ...base, energy: 7, time: 20, loc: "home" as const, state: "normal" as const };
    let watchHits = 0;
    let neutralHits = 0;
    const ent = new Set(["dumbbells", "tabata", "carry"]);
    for (let i = 0; i < 80; i++) {
      if (ent.has(generateDare({ ...at, vibe: "watch" }, [], {}, ember).dare.cat)) watchHits++;
      if (ent.has(generateDare({ ...at, vibe: null }, [], {}, ember).dare.cat)) neutralHits++;
    }
    expect(watchHits).toBeGreaterThan(neutralHits);
  });

  it("los vibes de novedad ('surprise'/'elsewhere') suben la tasa de wildcards", () => {
    const at = { ...base, energy: 8, time: 20, loc: "park" as const, state: "active" as const };
    let neutralWild = 0;
    let noveltyWild = 0;
    for (let i = 0; i < 200; i++) {
      if (generateDare({ ...at, vibe: null }, [], {}, ember).dare.wild) neutralWild++;
      if (generateDare({ ...at, vibe: "surprise" }, [], {}, ember).dare.wild) noveltyWild++;
    }
    expect(noveltyWild).toBeGreaterThan(neutralWild);
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

describe("energyForState", () => {
  it("deriva energía coherente del estado mental (el check-in ya no la pregunta)", () => {
    // tired/blocked bajan (arranque de baja fricción), active sube, normal medio
    expect(energyForState("tired")).toBeLessThanOrEqual(3);
    expect(energyForState("blocked")).toBeLessThanOrEqual(3);
    expect(energyForState("active")).toBeGreaterThanOrEqual(8);
    expect(energyForState("normal")).toBeGreaterThan(energyForState("tired"));
    expect(energyForState("stressed")).toBeLessThan(energyForState("normal"));
  });

  it("energía baja (tired) selecciona un Dare no-Strong (intensidad coherente)", () => {
    // tired → energía derivada baja → el generador evita niveles Strong
    for (let i = 0; i < 30; i++) {
      const { dare } = generateDare(
        { energy: energyForState("tired"), time: 10, loc: "home", dest: null, state: "tired" },
        [],
        {},
        ember,
      );
      expect(dare.level).not.toBe("Strong");
    }
  });
});

describe("coherencia de duración y destino (check-in)", () => {
  it("nunca elige un Dare más largo que el tiempo disponible", () => {
    for (const time of [10, 20, 30]) {
      for (let i = 0; i < 30; i++) {
        const { dare } = generateDare({ ...base, time, energy: 7 }, [], {}, ember);
        expect(dare.min).toBeLessThanOrEqual(time + 2);
      }
    }
  });

  it("timeFitScore premia el encaje y penaliza quedarse corto", () => {
    // encaje perfecto = máximo; pasarse un par de min no penaliza (pool ya lo acota)
    expect(timeFitScore(30, 30)).toBe(16);
    expect(timeFitScore(30, 31)).toBe(16);
    // cuanto más corto respecto al tiempo, peor — y con tope negativo
    expect(timeFitScore(30, 20)).toBeLessThan(timeFitScore(30, 30));
    expect(timeFitScore(30, 2)).toBeLessThan(0);
    expect(timeFitScore(30, 2)).toBeGreaterThanOrEqual(-22);
    // un Dare corto encaja mejor en un hueco corto que en uno largo
    expect(timeFitScore(10, 8)).toBeGreaterThan(timeFitScore(30, 8));
  });

  it("energía baja NO capa la duración: con mucho tiempo, un Dare suave puede ser largo", () => {
    // blocked/tired ⇒ solo Easy (baja intensidad), pero NO se fuerza corto:
    // con 30 min disponibles el generador puede elegir un Easy largo (>12 min).
    let long = 0;
    for (let i = 0; i < 60; i++) {
      const { dare } = generateDare({ ...base, time: 30, energy: 3, loc: "park", state: "blocked" }, [], {}, ember);
      expect(dare.level).not.toBe("Strong"); // sigue siendo baja intensidad
      if (dare.min > 12) long++;
    }
    expect(long).toBeGreaterThan(0); // ya no hay tope duro de 12 min
  });

  it("no ofrece un Dare mucho más corto que el tiempo disponible (30 min ≠ 2 min)", () => {
    let tooShort = 0;
    for (let i = 0; i < 60; i++) {
      const { dare } = generateDare({ ...base, time: 30, energy: 6, loc: "home", state: "normal" }, [], {}, ember);
      if (dare.min <= 6) tooShort++;
    }
    // con 30 min disponibles, un Dare de ≤6 min casi nunca debería ganar
    expect(tooShort).toBeLessThan(8);
  });

  it("con más tiempo disponible tiende a Dares más largos (coincide con time)", () => {
    const avg = (time: number) => {
      let sum = 0;
      const N = 100;
      for (let i = 0; i < N; i++) sum += generateDare({ ...base, time, energy: 7 }, [], {}, ember).dare.min;
      return sum / N;
    };
    // 30 min disponibles debe rendir Dares claramente más largos que 10 min.
    expect(avg(30)).toBeGreaterThan(avg(10));
  });

  it("'Send me somewhere' (loc anywhere) manda a un destino, no te deja en casa", () => {
    const destLocs = ["forest", "pool", "gym", "padel", "outside"];
    for (let i = 0; i < 40; i++) {
      const { dare } = generateDare({ ...base, loc: "anywhere", dest: null, energy: 7 }, [], {}, ember);
      // el Dare se puede hacer en un destino (o es el comodín small)
      expect(dare.locs.some((l) => destLocs.includes(l)) || dare.cat === "small").toBe(true);
      // nunca un Dare exclusivamente de casa
      expect(dare.locs).not.toEqual(["home"]);
    }
  });
});

describe("generateJourneyDayDare", () => {
  const iron = journeyById("iron");

  it("devuelve un Dare de la categoría del día cuando existe (dentro del Journey)", () => {
    // "walk" tiene Dares → el resultado es SIEMPRE de esa categoría, nunca del
    // pool global aleatorio.
    expect(DARES.some((d) => d.cat === "walk")).toBe(true);
    for (let i = 0; i < 40; i++) {
      const dare = generateJourneyDayDare("walk", iron, base);
      expect(dare.cat).toBe("walk");
    }
  });

  it("excluye (duro) un Dare rechazado si la categoría tiene alternativas", () => {
    const walk = DARES.filter((d) => d.cat === "walk");
    expect(walk.length).toBeGreaterThan(1);
    const rejected = walk[0].id;
    for (let i = 0; i < 60; i++) {
      const dare = generateJourneyDayDare("walk", iron, base, [], [rejected]);
      expect(dare.id).not.toBe(rejected);
      expect(dare.cat).toBe("walk");
    }
  });

  it("cae a las categorías del Journey si la del día no tiene Dares", () => {
    // fabrica una categoría sin Dares reales: filtramos a algo que no exista.
    const cats = new Set(DARES.map((d) => d.cat));
    const emptyCat = (["padel", "pool", "forest"] as const).find((c) => !cats.has(c));
    // Si todas existen, este test no aplica; sólo corre si hay una vacía real.
    if (!emptyCat) return;
    for (let i = 0; i < 20; i++) {
      const dare = generateJourneyDayDare(emptyCat, iron, base);
      expect(iron.bias.includes(dare.cat) || dare.cat === "small").toBe(true);
    }
  });

  it("siempre devuelve un Dare (nunca undefined)", () => {
    const dare = generateJourneyDayDare("recovery", iron, { ...base, energy: 2, state: "tired" });
    expect(dare).toBeTruthy();
    expect(typeof dare.id).toBe("string");
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
