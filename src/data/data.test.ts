import { describe, it, expect } from "vitest";
import { DARES } from "./dares";
import { WILDCARDS } from "./wildcards";
import { JOURNEYS, totalMilestones, chapterCompleted, unlockedChapterCount, currentChapter, nextAction, SPRINT_DAYS } from "./journeys";
import { SCIENCE, findScience } from "./science";
import { TRAITS, findTrait } from "./traits";
import { SYMBOLS, JOURNEY_SYM } from "./symbols";
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
          // Un milestone de ciencia puede ser autocontenido (title+body) o
          // enlazar la biblioteca; si trae scienceId, debe existir.
          if (m.t === "science" && m.scienceId) expect(findScience(m.scienceId), m.id).toBeTruthy();
        }
      }
    }
  });

  it("First Flame (slot ember) tiene milestones en las 4 chapters", () => {
    const ff = JOURNEYS.find((j) => j.id === "ember")!;
    expect(totalMilestones(ff)).toBeGreaterThanOrEqual(12);
    for (const c of ff.chapters) expect(c.milestones.length).toBeGreaterThan(0);
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

  it("sin ningún milestone hecho, solo el capítulo 1 está desbloqueado en cualquier Journey", () => {
    for (const j of JOURNEYS) expect(unlockedChapterCount(j, {}), j.id).toBe(1);
  });

  it("nextAction devuelve el primer milestone pendiente del capítulo en curso", () => {
    const ember = JOURNEYS.find((j) => j.id === "ember")!;
    expect(nextAction(ember, {})).toBe(ember.chapters[0].milestones[0].title);
    const done = { [ember.chapters[0].milestones[0].id]: true };
    expect(nextAction(ember, done)).toBe(ember.chapters[0].milestones[1].title);
  });

  it("nextAction cae a la promesa del Journey si no hay pendientes", () => {
    const ember = JOURNEYS.find((j) => j.id === "ember")!;
    const allDoneMap = Object.fromEntries(ember.chapters.flatMap((c) => c.milestones).map((m) => [m.id, true]));
    expect(nextAction(ember, allDoneMap)).toBe(ember.promise);
  });
});

describe("Journey system — los 7 Journeys del set final", () => {
  const EXPECTED_IDS = ["ember", "iron", "water", "clear", "current", "wild", "fire"];

  it("están los 7 Journeys esperados", () => {
    expect(JOURNEYS.map((j) => j.id).sort()).toEqual([...EXPECTED_IDS].sort());
  });

  it("cada Journey tiene 4 chapters y un plan de 7 días (sin placeholders)", () => {
    for (const j of JOURNEYS) {
      expect(j.chapters, j.id).toHaveLength(4);
      expect(j.plan, j.id).toHaveLength(SPRINT_DAYS);
      expect(j.plan.map((p) => p.day)).toEqual([1, 2, 3, 4, 5, 6, 7]);
    }
  });

  it("cada Journey tiene un Badge final válido y su id existe como Badge (Trait)", () => {
    for (const j of JOURNEYS) {
      expect(j.identity.name && j.identity.line, `${j.id} badge copy`).toBeTruthy();
      expect(findTrait(j.identity.id), `${j.id} badge → Trait ${j.identity.id}`).toBeTruthy();
    }
  });

  it("el último chapter de cada Journey desbloquea el Badge (milestone type badge)", () => {
    for (const j of JOURNEYS) {
      const last = j.chapters[j.chapters.length - 1];
      expect(last.milestones.some((m) => m.t === "badge"), `${j.id} sin badge unlock`).toBe(true);
    }
  });

  it("cada Journey tiene símbolo primario, entrada en JOURNEY_SYM y color propio (distintos)", () => {
    const colors = new Set<string>();
    for (const j of JOURNEYS) {
      expect(SYMBOLS[j.sym], `${j.id} sym`).toBeTruthy();
      expect(JOURNEY_SYM[j.id], `${j.id} en JOURNEY_SYM`).toBeTruthy();
      expect(j.color, `${j.id} color`).toBeTruthy();
      colors.add(j.color);
    }
    expect(colors.size, "cada Journey un color diferente").toBe(JOURNEYS.length);
  });

  it("cada día del plan trae Trigger, Companion, Treat, Proof y ficha de ciencia", () => {
    for (const j of JOURNEYS) {
      for (const p of j.plan) {
        const where = `${j.id} d${p.day}`;
        expect(p.trigger, `${where} trigger`).toBeTruthy();
        expect(p.companion, `${where} companion`).toBeTruthy();
        expect(p.treat, `${where} treat`).toBeTruthy();
        expect(p.proof, `${where} proof`).toBeTruthy();
        expect(p.scienceTitle && p.scienceBody, `${where} science`).toBeTruthy();
        expect(CATS[p.cat], `${where} cat`).toBeTruthy();
      }
    }
  });

  it("las variantes de dificultad, cuando existen, son texto no vacío", () => {
    for (const j of JOURNEYS) {
      for (const p of j.plan) {
        for (const v of [p.soft, p.bold, p.dare]) {
          if (v !== undefined) expect(typeof v === "string" && v.trim().length > 0, `${j.id} d${p.day}`).toBe(true);
        }
      }
    }
  });

  it("las Dream Reward options son únicas y acaban en 'Create my own'", () => {
    for (const j of JOURNEYS) {
      const ids = j.dreamOptions.map((o) => o.id);
      expect(new Set(ids).size, `${j.id} dream ids únicos`).toBe(ids.length);
      const last = j.dreamOptions[j.dreamOptions.length - 1];
      expect(last.custom, `${j.id} última opción custom`).toBe(true);
    }
  });

  it("cada Journey trae completionLine (copy de cierre)", () => {
    for (const j of JOURNEYS) expect(j.completionLine && j.completionLine.length > 0, j.id).toBeTruthy();
  });

  it("nextAction devuelve el primer milestone pendiente del capítulo en curso", () => {
    const ember = JOURNEYS.find((j) => j.id === "ember")!;
    // sin nada hecho → primer milestone del capítulo I
    expect(nextAction(ember, {})).toBe(ember.chapters[0].milestones[0].title);
    // hecho el primero → pasa al segundo
    const done = { [ember.chapters[0].milestones[0].id]: true };
    expect(nextAction(ember, done)).toBe(ember.chapters[0].milestones[1].title);
  });

  it("nextAction cae a la promesa del Journey si no hay pendientes", () => {
    const ember = JOURNEYS.find((j) => j.id === "ember")!;
    const allDoneMap = Object.fromEntries(ember.chapters.flatMap((c) => c.milestones).map((m) => [m.id, true]));
    expect(nextAction(ember, allDoneMap)).toBe(ember.promise);
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
