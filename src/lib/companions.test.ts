import { describe, it, expect } from "vitest";
import {
  companionWord,
  companionCategory,
  dareCompanionCategory,
  vibeConfig,
  resolveCompanion,
  vibeBonus,
  companionNote,
} from "./companions";
import { COMPANIONS, VIBES } from "../data/companions";
import { DARES } from "../data/dares";
import type { Dare } from "../types";

const netflixDare = DARES.find((d) => d.id === "netflix-strength-snack")!;
const podcastDare = DARES.find((d) => d.id === "podcast-run")!;

/* Vocabulario prohibido del producto (mismo guard que briefing/contentSchema). */
const BANNED = ["xp", "level up", "streak failed", "calorie", "calories", "burn"];

describe("companionWord", () => {
  it("reduce el companion a una palabra reconocible", () => {
    expect(companionWord(netflixDare)).toBe("Netflix");
    expect(companionWord(podcastDare)).toBe("Podcast");
  });
  it("nunca devuelve cadena vacía para el corpus vivo", () => {
    for (const d of DARES) expect(companionWord(d).length, d.id).toBeGreaterThan(0);
  });
});

describe("companionCategory", () => {
  it("clasifica las familias conocidas", () => {
    expect(companionCategory("Netflix")).toBe("entertainment");
    expect(companionCategory("Podcast")).toBe("entertainment");
    expect(companionCategory("Friend")).toBe("social");
    expect(companionCategory("Coffee")).toBe("sensory");
    expect(companionCategory("New route")).toBe("novelty");
  });
  it("dareCompanionCategory usa la palabra del Dare", () => {
    expect(dareCompanionCategory(netflixDare)).toBe("entertainment");
  });
});

describe("vibeConfig", () => {
  it("existe una config por cada vibe declarado", () => {
    for (const v of VIBES) expect(vibeConfig(v.vibe)).toBeTruthy();
  });
  it("devuelve undefined sin vibe", () => {
    expect(vibeConfig(null)).toBeUndefined();
    expect(vibeConfig(undefined)).toBeUndefined();
  });
});

describe("resolveCompanion", () => {
  it("es determinista: mismo (dare, vibe, seed) ⇒ misma sugerencia", () => {
    const a = resolveCompanion(netflixDare, { vibe: "watch", seed: "2026-07-05" });
    const b = resolveCompanion(netflixDare, { vibe: "watch", seed: "2026-07-05" });
    expect(a).toEqual(b);
  });
  it("rota con la fecha (dos días distintos pueden diferir)", () => {
    const seen = new Set<string>();
    for (const day of ["2026-07-01", "2026-07-02", "2026-07-03", "2026-07-04", "2026-07-05"]) {
      seen.add(resolveCompanion(podcastDare, { vibe: "listen", seed: day }).label);
    }
    // con varios días esperamos ver más de una etiqueta (rotación real)
    expect(seen.size).toBeGreaterThan(1);
  });
  it("el vibe 'aesthetic' resuelve a un companion sensory cuando encaja", () => {
    const recovery = DARES.find((d) => d.cat === "recovery")!;
    const r = resolveCompanion(recovery, { vibe: "aesthetic", seed: "x" });
    expect(r.category).toBe("sensory");
  });
  it("cae al companion literal del Dare si no hay candidato", () => {
    const weird: Dare = { ...netflixDare, id: "tmp", companion: "Absolute silence.", cat: "small" };
    const r = resolveCompanion(weird, { vibe: null, seed: "x" });
    expect(r.label).toBe("Absolute silence.");
    expect(r.word).toBe("Silence");
  });
  it("nunca devuelve label/note vacíos para el corpus vivo", () => {
    for (const d of DARES) {
      const r = resolveCompanion(d, { seed: "2026-07-05" });
      expect(r.label.length, d.id).toBeGreaterThan(0);
      expect(r.note.length, d.id).toBeGreaterThan(0);
    }
  });
});

describe("vibeBonus", () => {
  it("premia a los Dares cuya familia de companion coincide con el vibe", () => {
    // 'watch' favorece entertainment → un Dare Netflix debe puntuar más que uno de piscina
    const pool = DARES.find((d) => d.cat === "pool")!;
    expect(vibeBonus("watch", netflixDare)).toBeGreaterThan(vibeBonus("watch", pool));
  });
  it("sin vibe (o desconocido) no aporta nada", () => {
    expect(vibeBonus(null, netflixDare)).toBe(0);
    expect(vibeBonus("surprise", netflixDare)).toBe(0);
  });
});

describe("catálogo de companions", () => {
  it("no usa vocabulario prohibido en labels ni notas", () => {
    const hay = COMPANIONS.map((c) => `${c.label} ${c.note}`).join(" ").toLowerCase();
    for (const b of BANNED) {
      const re = new RegExp(`\\b${b.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`);
      expect(re.test(hay), `catálogo usa "${b}"`).toBe(false);
    }
  });
  it("companionNote devuelve texto no vacío para palabras conocidas", () => {
    expect(companionNote("Netflix").length).toBeGreaterThan(0);
    expect(companionNote("Silence").length).toBeGreaterThan(0);
    expect(companionNote("Whatever").length).toBeGreaterThan(0);
  });
});
