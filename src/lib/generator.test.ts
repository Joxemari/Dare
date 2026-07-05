import { describe, it, expect } from "vitest";
import {
  generateDare,
  generateJourneyDayDare,
  energyForLevel,
  stateForLevel,
  allowedLocs,
  placeToLocs,
  recentDareIds,
  timeFitScore,
} from "./generator";
import { DARES } from "../data/dares";
import { WILDCARDS } from "../data/wildcards";
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
const base: Checkin = { energy: 6, time: 20, loc: "home", state: "normal" };

/** Cats que solo pueden hacerse en un destino ("Take me somewhere"): nunca
 *  deben salir para City o Park (regla dura de la spec). */
const DESTINATION_ONLY_CATS = ["forest", "pool", "padel"];

describe("placeToLocs", () => {
  it("mapea cada Place del check-in a sus localizaciones de Dare", () => {
    expect(placeToLocs("home")).toEqual(["home"]);
    expect(placeToLocs("city")).toEqual(["city"]);
    expect(placeToLocs("park")).toEqual(["park"]);
    // Bed = en casa a mínima fricción → misma loc que Home.
    expect(placeToLocs("bed")).toEqual(["home"]);
    // Office = escritorio (home) o salir a la calle (city).
    expect(placeToLocs("office")).toEqual(["home", "city"]);
    // Gym = fuerza/cardio → loc `gym`.
    expect(placeToLocs("gym")).toEqual(["gym"]);
  });

  it("Gym solo devuelve Dares de gimnasio (nunca City/Park/Forest)", () => {
    for (let i = 0; i < 40; i++) {
      const { dare } = generateDare({ ...base, loc: "gym", energy: 7, time: 20 }, [], {}, ember);
      expect(dare.locs.includes("gym"), `${dare.id} no es de gym`).toBe(true);
      expect(dare.locs.some((l) => l === "city" || l === "park" || l === "forest")).toBe(false);
    }
  });

  it("Bed nunca manda fuera de casa (misma loc que Home)", () => {
    for (let i = 0; i < 40; i++) {
      const { dare } = generateDare({ ...base, loc: "bed", energy: 4 }, [], {}, ember);
      expect(dare.locs.includes("home"), `${dare.id} no es de casa`).toBe(true);
    }
  });

  it("'Take me somewhere' (anywhere) admite destinos pero nunca 'home'", () => {
    const locs = placeToLocs("anywhere");
    expect(locs).toContain("pool");
    expect(locs).toContain("gym");
    expect(locs).toContain("forest");
    expect(locs).toContain("padel");
    expect(locs).toContain("city");
    expect(locs).toContain("park");
    expect(locs).not.toContain("home");
  });
});

describe("allowedLocs", () => {
  it("usa el Place del check-in (hard filter)", () => {
    expect(allowedLocs({ ...base, loc: "home" })).toEqual(["home"]);
    expect(allowedLocs({ ...base, loc: "city" })).toEqual(["city"]);
    expect(allowedLocs({ ...base, loc: "park" })).toEqual(["park"]);
  });
});

describe("generateDare — Place es un HARD FILTER (nunca se viola)", () => {
  it("City NUNCA devuelve un Dare de Forest/Pool/Padel (el bug original)", () => {
    for (const time of [5, 10, 20, 30]) {
      for (const energy of [2, 4, 6, 9]) {
        for (let i = 0; i < 20; i++) {
          const { dare } = generateDare({ ...base, loc: "city", time, energy }, [], {}, ember);
          expect(DESTINATION_ONLY_CATS.includes(dare.cat), `${dare.id} (${dare.cat}) salió para City`).toBe(false);
          expect(dare.locs.includes("city") || dare.locs.includes("home"), dare.id).toBe(true);
        }
      }
    }
  });

  it("Park se queda en Park/green-space: nunca Fitboxing/Pool/Padel/Gym", () => {
    for (let i = 0; i < 60; i++) {
      const { dare } = generateDare({ ...base, loc: "park", energy: 7, time: 20 }, [], {}, ember);
      expect(["pool", "padel", "fitboxing"].includes(dare.cat), `${dare.id} (${dare.cat}) salió para Park`).toBe(false);
      expect(dare.locs.includes("park")).toBe(true);
    }
  });

  it("Home nunca manda fuera (o es el comodín small etiquetado home)", () => {
    for (let i = 0; i < 40; i++) {
      const { dare } = generateDare({ ...base, loc: "home" }, [], {}, ember);
      expect(dare.locs.includes("home")).toBe(true);
    }
  });

  it("'Take me somewhere' (loc anywhere) nunca deja en casa", () => {
    for (let i = 0; i < 40; i++) {
      const { dare } = generateDare({ ...base, loc: "anywhere", energy: 7 }, [], {}, ember);
      expect(dare.locs.includes("home")).toBe(false);
    }
  });
});

describe("generateDare", () => {
  it("con time=5 el pool sigue respetando el Place elegido", () => {
    for (let i = 0; i < 20; i++) {
      const { dare } = generateDare({ ...base, time: 5, loc: "home" }, [], {}, ember);
      expect(dare.locs.includes("home")).toBe(true);
    }
  });

  it("Energy es un hard filter: Tired nunca selecciona niveles Strong", () => {
    for (let i = 0; i < 40; i++) {
      const { dare } = generateDare({ ...base, energy: energyForLevel("tired"), state: stateForLevel("tired") }, [], {}, ember);
      expect(dare.level).not.toBe("Strong");
    }
  });

  it("devuelve un `why` no vacío", () => {
    const { why } = generateDare(base, [], {}, ember);
    expect(why.length).toBeGreaterThan(0);
  });

  it("evita repetir un Dare visto recientemente si hay alternativas", () => {
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
    const ci: Checkin = { ...base, time: 5, loc: "home" };
    const allHomeSmallIds = DARES.filter((d) => d.cat === "small" && d.locs.includes("home")).map((d) => d.id);
    const { dare } = generateDare(ci, [], {}, ember, allHomeSmallIds);
    // sigue respetando Place aunque el pool "fresco" esté vacío
    expect(dare.locs.includes("home")).toBe(true);
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

  it("un wildcard nunca viola Place (City no recibe wildcards de Forest)", () => {
    withSeededRandom(0x51de, () => {
      for (let i = 0; i < 100; i++) {
        const { dare } = generateDare({ ...base, loc: "city", time: 20, energy: 7 }, [], {}, ember);
        if (dare.wild) expect(WILDCARDS.find((w) => w.id === dare.id)?.locs.includes("city")).toBe(true);
      }
    });
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
    const ci: Checkin = { energy: 6, time: 10, loc: "home", state: "normal", focus: 6, avoiding: "admin" };
    const contactCats = ["admin", "taskcontact", "close", "communication", "decision", "focus"];
    let hits = 0;
    for (let i = 0; i < 60; i++) {
      const { dare } = generateDare(ci, [], {}, ember);
      if (contactCats.includes(dare.cat)) hits++;
    }
    expect(hits).toBeGreaterThan(20);
  });

  it("acepta focus/avoiding sin romper el `why`", () => {
    const ci: Checkin = { energy: 3, time: 10, loc: "home", state: "tired", focus: 2, avoiding: "mind" };
    const { why } = generateDare(ci, [], {}, ember);
    expect(why.length).toBeGreaterThan(0);
  });
});

describe("energyForLevel / stateForLevel", () => {
  it("deriva energía coherente del nivel elegido (pregunta DIRECTA, ya no derivada del mood)", () => {
    expect(energyForLevel("tired")).toBeLessThanOrEqual(3);
    expect(energyForLevel("high")).toBeGreaterThanOrEqual(8);
    expect(energyForLevel("normal")).toBeGreaterThan(energyForLevel("tired"));
    expect(energyForLevel("calm")).toBeLessThan(energyForLevel("normal"));
  });

  it("mapea 'high' a 'active' para reutilizar el scoring existente", () => {
    expect(stateForLevel("high")).toBe("active");
    expect(stateForLevel("tired")).toBe("tired");
    expect(stateForLevel("calm")).toBe("calm");
    expect(stateForLevel("normal")).toBe("normal");
  });

  it("energía baja (tired) selecciona un Dare no-Strong (intensidad coherente)", () => {
    for (let i = 0; i < 30; i++) {
      const { dare } = generateDare(
        { energy: energyForLevel("tired"), time: 10, loc: "home", state: stateForLevel("tired") },
        [],
        {},
        ember,
      );
      expect(dare.level).not.toBe("Strong");
    }
  });
});

describe("coherencia de duración (check-in)", () => {
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

  it("no ofrece un Dare mucho más corto que el tiempo disponible (30 min ≠ 2 min)", () => {
    // Es una preferencia de SCORING (timeFitScore), no un hard filter — se
    // sembra Math.random para que el recuento sea determinista y no flaky.
    withSeededRandom(0x7f3a, () => {
      let tooShort = 0;
      const N = 150;
      for (let i = 0; i < N; i++) {
        const { dare } = generateDare({ ...base, time: 30, energy: 6, loc: "home", state: "normal" }, [], {}, ember);
        if (dare.min <= 6) tooShort++;
      }
      // con 30 min disponibles, un Dare de ≤6 min debería ganar solo raramente
      expect(tooShort / N).toBeLessThan(0.15);
    });
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
