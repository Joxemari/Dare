import { describe, it, expect } from "vitest";
import { DARES } from "./dares";
import { WILDCARDS } from "./wildcards";
import { JOURNEYS, totalMilestones } from "./journeys";
import { SCIENCE, findScience } from "./science";
import { TRAITS } from "./traits";
import { SYMBOLS } from "./symbols";
import { CATS } from "./colors";
import { CAT_ICO } from "./icons";

const ALL = [...DARES, ...WILDCARDS];

/* Reglas duras del producto: ningún trabajo de suelo con manos apoyadas. */
const BANNED = ["push-up", "push up", "plank", "burpee", "mountain climber"];

describe("integridad de los Dares", () => {
  it("todos los Dares tienen trigger, companion, proof y efectos", () => {
    for (const d of ALL) {
      expect(d.trigger, d.id).toBeTruthy();
      expect(d.companion, d.id).toBeTruthy();
      expect(d.proof, d.id).toBeTruthy();
      expect(Object.keys(d.effects).length, d.id).toBeGreaterThan(0);
    }
  });

  it("ningún Dare menciona ejercicios de suelo con manos apoyadas", () => {
    for (const d of ALL) {
      const text = (d.title + " " + d.steps.join(" ")).toLowerCase();
      for (const b of BANNED) expect(text.includes(b), `${d.id} menciona "${b}"`).toBe(false);
    }
  });

  it("cada scienceId de un Dare existe en la biblioteca", () => {
    for (const d of ALL) {
      if (d.scienceId) expect(findScience(d.scienceId), `${d.id} → ${d.scienceId}`).toBeTruthy();
    }
  });

  it("toda categoría de Dare tiene color e icono", () => {
    for (const d of ALL) {
      expect(CATS[d.cat], d.cat).toBeTruthy();
      expect(CAT_ICO[d.cat], d.cat).toBeTruthy();
    }
  });
});

describe("integridad de los Journeys", () => {
  it("The Ember e Iron Quiet tienen plan de 7 días", () => {
    const ember = JOURNEYS.find((j) => j.id === "ember")!;
    const iron = JOURNEYS.find((j) => j.id === "iron")!;
    expect(ember.plan).toHaveLength(7);
    expect(iron.plan).toHaveLength(7);
  });

  it("los dareId fijados en los planes existen", () => {
    for (const j of JOURNEYS) {
      for (const p of j.plan) {
        if (p.dareId) expect(ALL.some((d) => d.id === p.dareId), `${j.id} d${p.day} → ${p.dareId}`).toBe(true);
      }
    }
  });

  it("los ids de milestone son únicos y sus science/action son coherentes", () => {
    const ids = new Set<string>();
    for (const j of JOURNEYS) {
      for (const c of j.chapters) {
        expect(SYMBOLS[c.sym], c.sym).toBeTruthy();
        for (const m of c.milestones) {
          expect(ids.has(m.id), `id duplicado ${m.id}`).toBe(false);
          ids.add(m.id);
          if (m.t === "science") expect(findScience(m.scienceId), m.id).toBeTruthy();
        }
      }
    }
  });

  it("The Ember tiene milestones en las 4 chapters", () => {
    const ember = JOURNEYS.find((j) => j.id === "ember")!;
    expect(totalMilestones(ember)).toBeGreaterThanOrEqual(12);
    for (const c of ember.chapters) expect(c.milestones.length).toBeGreaterThan(0);
  });
});

describe("Traits y Science", () => {
  it("todos los Traits usan un símbolo válido y son únicos", () => {
    const ids = new Set<string>();
    for (const t of TRAITS) {
      expect(SYMBOLS[t.sym], t.sym).toBeTruthy();
      expect(ids.has(t.id), t.id).toBe(false);
      ids.add(t.id);
    }
    expect(TRAITS.length).toBeGreaterThanOrEqual(25);
  });

  it("ninguna ficha de ciencia usa lenguaje prohibido", () => {
    for (const s of SCIENCE) {
      expect(s.text.toLowerCase()).not.toContain("dopamine hack");
    }
  });
});
