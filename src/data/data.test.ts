import { describe, it, expect } from "vitest";
import { DARES } from "./dares";
import { WILDCARDS } from "./wildcards";
import { JOURNEYS, totalMilestones, chapterCompleted, unlockedChapterCount, currentChapter } from "./journeys";
import { SCIENCE, findScience } from "./science";
import { TRAITS } from "./traits";
import { SYMBOLS } from "./symbols";
import { CATS } from "./colors";
import { CAT_ICO } from "./icons";
import { validateDare } from "../lib/contentSchema";

const ALL = [...DARES, ...WILDCARDS];
const SCIENCE_IDS = SCIENCE.map((s) => s.id);
const ALL_IDS = ALL.map((d) => d.id);

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

  it("todo el corpus vivo pasa el validador de contenido (misma red que la generación)", () => {
    for (const d of ALL) {
      // ids existentes = todos menos él mismo, para no auto-colisionar.
      const existingIds = ALL_IDS.filter((id) => id !== d.id);
      expect(validateDare(d, { existingIds, scienceIds: SCIENCE_IDS }), d.id).toEqual([]);
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

describe("desbloqueo de capítulos por completado", () => {
  const ember = JOURNEYS.find((j) => j.id === "ember")!;
  const allDone = (c: (typeof ember.chapters)[number]) =>
    Object.fromEntries(c.milestones.map((m) => [m.id, true]));

  it("solo el capítulo 1 está desbloqueado al empezar (sin milestones hechos)", () => {
    expect(unlockedChapterCount(ember, {})).toBe(1);
    expect(currentChapter(ember, {}).idx).toBe(0);
  });

  it("completar todos los milestones del capítulo I desbloquea el II de inmediato", () => {
    const done = allDone(ember.chapters[0]);
    expect(chapterCompleted(ember.chapters[0], done)).toBe(true);
    expect(unlockedChapterCount(ember, done)).toBe(2);
    expect(currentChapter(ember, done).idx).toBe(1);
  });

  it("completar dos capítulos seguidos desbloquea hasta el III sin cambio de día", () => {
    const done = { ...allDone(ember.chapters[0]), ...allDone(ember.chapters[1]) };
    expect(unlockedChapterCount(ember, done)).toBe(3);
  });

  it("un capítulo sin milestones no desbloquea a los siguientes (placeholder)", () => {
    const water = JOURNEYS.find((j) => j.id === "water")!;
    expect(unlockedChapterCount(water, {})).toBe(1);
  });
});

describe("Badges y Science", () => {
  it("todos los Badges usan un símbolo válido y son únicos", () => {
    const ids = new Set<string>();
    for (const t of TRAITS) {
      expect(SYMBOLS[t.sym], t.sym).toBeTruthy();
      expect(ids.has(t.id), t.id).toBe(false);
      ids.add(t.id);
    }
    // Badges = hitos, no premios: un set pequeño y difícil de conseguir.
    expect(TRAITS.length).toBeGreaterThanOrEqual(10);
  });

  it("ninguna ficha de ciencia usa lenguaje prohibido", () => {
    for (const s of SCIENCE) {
      expect(s.text.toLowerCase()).not.toContain("dopamine hack");
    }
  });
});
