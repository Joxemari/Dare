import { describe, it, expect } from "vitest";
import { DARES } from "./dares";
import { WILDCARDS } from "./wildcards";
import { JOURNEYS, MVP_JOURNEYS, MVP_JOURNEY_IDS, ROADMAP_JOURNEYS, isMvpJourney, totalMilestones, journeyMilestoneIds, todaysDayPlan, chapterCompleted, unlockedChapterCount, currentChapter, nextAction, nextMilestone, milestoneProgress, journeyComplete, SPRINT_DAYS } from "./journeys";
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

describe("completion de Journey por milestones (dispara la celebración)", () => {
  const allMs = (j: (typeof JOURNEYS)[number]) =>
    Object.fromEntries(j.chapters.flatMap((c) => c.milestones).map((m) => [m.id, true]));

  it("un Journey no está completo sin milestones", () => {
    for (const j of JOURNEYS) expect(journeyComplete(j, {}), j.id).toBe(false);
  });

  it("completar TODOS los milestones marca el Journey como completo", () => {
    for (const j of JOURNEYS) expect(journeyComplete(j, allMs(j)), j.id).toBe(true);
  });

  it("si falta un solo milestone (p. ej. el badge final), el Journey no está completo", () => {
    for (const j of JOURNEYS) {
      const done = allMs(j);
      const lastCh = j.chapters[j.chapters.length - 1];
      const lastMs = lastCh.milestones[lastCh.milestones.length - 1];
      delete done[lastMs.id];
      expect(journeyComplete(j, done), j.id).toBe(false);
    }
  });

  it("completar un Journey no marca completos a los demás (independencia)", () => {
    const ember = JOURNEYS.find((j) => j.id === "ember")!;
    const iron = JOURNEYS.find((j) => j.id === "iron")!;
    const done = allMs(ember);
    expect(journeyComplete(ember, done)).toBe(true);
    expect(journeyComplete(iron, done)).toBe(false);
  });

  it("milestoneProgress: 0% sin nada, 100% con todo, y coherente con el total", () => {
    for (const j of JOURNEYS) {
      const total = totalMilestones(j);
      expect(milestoneProgress(j, {})).toEqual({ done: 0, total, pct: 0 });
      expect(milestoneProgress(j, allMs(j))).toEqual({ done: total, total, pct: 100 });
    }
  });

  it("milestoneProgress alcanza 100% exactamente cuando journeyComplete es true", () => {
    const ember = JOURNEYS.find((j) => j.id === "ember")!;
    const done = allMs(ember);
    expect(milestoneProgress(ember, done).pct).toBe(100);
    expect(journeyComplete(ember, done)).toBe(true);
  });

  it("nextMilestone: primer pendiente del capítulo en curso; null si está completo", () => {
    const ember = JOURNEYS.find((j) => j.id === "ember")!;
    expect(nextMilestone(ember, {})?.id).toBe(ember.chapters[0].milestones[0].id);
    const done = { [ember.chapters[0].milestones[0].id]: true };
    expect(nextMilestone(ember, done)?.id).toBe(ember.chapters[0].milestones[1].id);
    expect(nextMilestone(ember, allMs(ember))).toBeNull();
  });

  it("nextAction sigue coincidiendo con el título de nextMilestone", () => {
    const ember = JOURNEYS.find((j) => j.id === "ember")!;
    expect(nextAction(ember, {})).toBe(nextMilestone(ember, {})!.title);
    expect(nextAction(ember, allMs(ember))).toBe(ember.promise);
  });
});

describe("Expected Effect — perfiles ricos y distintos por Dare", () => {
  it("cada Dare muestra entre 3 y 5 efectos (nunca pobre ni saturado)", () => {
    for (const d of ALL) {
      const n = Object.keys(d.effects).length;
      expect(n >= 3 && n <= 5, `${d.id} tiene ${n} efectos`).toBe(true);
    }
  });

  it("los Dares de bosque/naturaleza no muestran solo Calm/Mood", () => {
    const pine = DARES.find((d) => d.id === "pine-reset")!;
    const keys = Object.keys(pine.effects);
    expect(keys.some((k) => !["Calm", "Mood"].includes(k)), "pine-reset solo Calm/Mood").toBe(true);
  });

  it("cada familia de Dare tiene su efecto característico", () => {
    const eff = (id: string) => DARES.find((d) => d.id === id)!.effects;
    expect(eff("pine-reset").Stress).toBeGreaterThan(0); // forest → alivio de estrés
    expect(eff("iron-first-weight").Strength).toBeGreaterThan(0); // strength
    expect(eff("water-reset").Recovery).toBeGreaterThan(0); // pool/recovery
    expect(eff("micro-tabata").Momentum).toBeGreaterThan(0); // tabata
    expect(eff("the-unblock").Focus).toBeGreaterThan(0); // focus/admin
  });
});

describe("Journey system — el set completo (MVP + roadmap)", () => {
  // Los 4 del MVP (Iron Quiet, Bright Pulse, Wild Ground, Still Water) + los
  // conceptos de roadmap que se conservan en datos (ember/clear/current/fire).
  const EXPECTED_IDS = ["ember", "iron", "pulse", "water", "clear", "current", "wild", "fire"];

  it("están los Journeys esperados", () => {
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

describe("MVP — solo 4 Journeys ofrecibles", () => {
  it("MVP_JOURNEY_IDS son exactamente los 4 físicos del MVP", () => {
    expect([...MVP_JOURNEY_IDS].sort()).toEqual(["iron", "pulse", "water", "wild"].sort());
  });

  it("MVP_JOURNEYS resuelve los 4 y respeta el orden declarado", () => {
    expect(MVP_JOURNEYS.map((j) => j.id)).toEqual(MVP_JOURNEY_IDS);
    expect(MVP_JOURNEYS).toHaveLength(4);
  });

  it("isMvpJourney distingue MVP de roadmap", () => {
    expect(isMvpJourney("iron")).toBe(true);
    expect(isMvpJourney("pulse")).toBe(true);
    expect(isMvpJourney("ember")).toBe(false);
    expect(isMvpJourney("fire")).toBe(false);
  });

  it("Bright Pulse existe con su Badge final y símbolo ◆", () => {
    const pulse = JOURNEYS.find((j) => j.id === "pulse")!;
    expect(pulse.identity.id).toBe("bright-mover");
    expect(findTrait("bright-mover")).toBeTruthy();
    expect(SYMBOLS[pulse.sym]).toBe("◆");
  });

  it("ROADMAP_JOURNEYS son los 4 restantes, disjuntos del MVP y con preview completo", () => {
    expect(ROADMAP_JOURNEYS.map((j) => j.id).sort()).toEqual(["clear", "current", "ember", "fire"]);
    for (const j of ROADMAP_JOURNEYS) {
      expect(isMvpJourney(j.id), j.id).toBe(false);
      // El preview "Coming soon" del picker necesita tag, promesa y capítulos.
      expect(j.tag && j.promise, `${j.id} preview copy`).toBeTruthy();
      expect(j.chapters.length, `${j.id} chapters`).toBe(4);
    }
    expect(MVP_JOURNEYS.length + ROADMAP_JOURNEYS.length).toBe(JOURNEYS.length);
  });
});

describe("plan diario por Journey (Today's plan)", () => {
  it("todaysDayPlan devuelve el día que toca según el progreso", () => {
    const iron = JOURNEYS.find((j) => j.id === "iron")!;
    expect(todaysDayPlan(iron, 0)).toBe(iron.plan[0]); // 0 hechos → Day 1
    expect(todaysDayPlan(iron, 2)).toBe(iron.plan[2]); // 2 hechos → Day 3
  });

  it("todaysDayPlan es null cuando el sprint está completo", () => {
    const iron = JOURNEYS.find((j) => j.id === "iron")!;
    expect(todaysDayPlan(iron, SPRINT_DAYS)).toBeNull();
    expect(todaysDayPlan(iron, SPRINT_DAYS + 3)).toBeNull();
  });

  it("journeyMilestoneIds lista TODOS los ids de milestone del Journey (para cancelar)", () => {
    const iron = JOURNEYS.find((j) => j.id === "iron")!;
    const ids = journeyMilestoneIds(iron);
    const expected = iron.chapters.flatMap((c) => c.milestones.map((m) => m.id));
    expect(ids).toEqual(expected);
    expect(ids).toContain("iq-1-letter");
    expect(new Set(ids).size).toBe(ids.length); // sin duplicados
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
