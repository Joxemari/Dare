#!/usr/bin/env node
/* ============================================================
   generate-content — propone Dares nuevos para revisión humana.
   Corre en el workflow semanal (.github/workflows/content.yml):

     1. Lee el corpus vivo (ids + títulos, para estilo y dedup) y
        la biblioteca de ciencia (scienceIds válidos).
     2. Lee `feedback.json` si existe (export del navegador; ver
        src/lib/generationInput.ts) y lo mete en el prompt.
     3. Pide propuestas al modelo (si hay ANTHROPIC_API_KEY); si no,
        cae a un stub determinista para que el pipeline corra sin red.
     4. Pre-valida en JS (dedup + kebab + palabras prohibidas) y
        escribe `src/data/_proposed/week-<AAAA-Www>.ts`.

   La validación AUTORITATIVA es `npm test` (vitest importa el
   fichero y corre `validateDare`). Este script solo redacta y
   falla pronto ante lo obvio. Aprobar/mergear la PR = validación
   humana. Ver docs/content-pipeline.md.
   ============================================================ */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DATA = join(ROOT, "src", "data");
const OUT_DIR = join(DATA, "_proposed");

// Ejercicios prohibidos (subcadena) y vocabulario prohibido (palabra completa).
const BANNED_EXERCISES = ["push-up", "push up", "plank", "burpee", "mountain climber"];
const BANNED_VOCAB = ["xp", "level up", "streak failed", "calorie", "calories", "burn"];

/** Extrae valores de `key: "..."` de un fichero de datos. */
function extract(file, key) {
  const src = readFileSync(join(DATA, file), "utf8");
  const re = new RegExp(`${key}:\\s*"([^"]+)"`, "g");
  return [...src.matchAll(re)].map((m) => m[1]);
}

/** Semana ISO en formato AAAA-Www (estable para nombrar el lote). */
function isoWeek(d = new Date()) {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const day = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((date - yearStart) / 86400000 + 1) / 7);
  return `${date.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}

function buildPrompt({ ids, titles, scienceIds, feedback, count }) {
  return [
    "Eres el editor de contenido de DARE (Daily Actions. Real Energy).",
    "Propón Dares NUEVOS: retos breves y accionables que activan energía.",
    "",
    "REGLAS DURAS (obligatorias):",
    "- La UI va en INGLÉS: title, trigger, companion, proof y steps en inglés.",
    "- NUNCA trabajo de suelo con manos apoyadas (nada de push-ups, planks, burpees, mountain climbers).",
    "- Nada de gamificación clásica ni fitness tracker: sin XP, niveles, 'streak failed', calorías ni 'burn'.",
    "- Cada Dare es aditivo: id NUEVO en kebab-case minúsculas, sin colisionar con los existentes.",
    "- scienceId debe ser uno de la biblioteca (o se omite).",
    "",
    "Forma de cada Dare (JSON): { id, title, cat, min, level, energy:[lo,hi], locs:[], companion, trigger, proof, effects:{Effect:1|2|3}, steps:[], scienceId? }",
    `cats válidas: forest walk dumbbells fitboxing pool padel tabata carry recovery focus small`,
    `levels: Easy Medium Strong · locs: home outside forest pool gym padel`,
    `effects: Energy Focus Mood Calm Strength Confidence Recovery (intensidad 1..3)`,
    `scienceIds válidos: ${scienceIds.join(", ")}`,
    "",
    `IDs ya usados (NO repetir): ${ids.join(", ")}`,
    `Títulos existentes (evita duplicar el tono/idea): ${titles.join(" · ")}`,
    "",
    feedback
      ? `SEÑAL DEL USUARIO (prioriza lo que le da energía):\n${JSON.stringify(feedback, null, 2)}`
      : "Sin feedback del usuario todavía: propón variedad equilibrada.",
    "",
    `Devuelve SOLO un array JSON con ${count} Dares, sin texto alrededor.`,
  ].join("\n");
}

/** Llama al modelo si hay clave; devuelve array de Dares o null. */
async function askModel(prompt) {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return null;
  const model = process.env.ANTHROPIC_MODEL || "claude-sonnet-5";
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": key,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model,
      max_tokens: 2048,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  if (!res.ok) throw new Error(`Anthropic API ${res.status}: ${await res.text()}`);
  const data = await res.json();
  const text = (data.content || []).map((b) => b.text || "").join("");
  const match = text.match(/\[[\s\S]*\]/);
  if (!match) throw new Error("respuesta del modelo sin array JSON");
  return JSON.parse(match[0]);
}

/** Stub determinista: un Dare válido para que el pipeline corra sin red. */
function stubProposal(week, ids) {
  const id = `gen-${week.toLowerCase()}-walk`;
  if (ids.includes(id)) return []; // ya propuesto esta semana
  return [
    {
      id,
      title: "The Unhurried Loop",
      cat: "walk",
      min: 15,
      level: "Easy",
      energy: [2, 7],
      locs: ["outside", "forest"],
      companion: "One slow album.",
      trigger: "No route. Just out.",
      proof: "Moved before negotiating.",
      effects: { Energy: 2, Calm: 1, Mood: 1 },
      scienceId: "walking-outdoors",
      steps: [
        "Album on before you sit back down",
        "Out the door, pick the softer direction",
        "Walk one unhurried loop",
        "Home when the album says so",
      ],
    },
  ];
}

/** Pre-check rápido en JS; la validación autoritativa es `npm test`. */
function precheck(dares, ids) {
  const seen = new Set(ids);
  const problems = [];
  for (const d of dares) {
    if (!d || typeof d.id !== "string") { problems.push("propuesta sin id"); continue; }
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(d.id)) problems.push(`${d.id}: id no kebab-case`);
    if (seen.has(d.id)) problems.push(`${d.id}: id duplicado`);
    seen.add(d.id);
    const hay = [d.title, d.trigger, d.companion, d.proof, ...(d.steps || [])].join(" ").toLowerCase();
    for (const b of BANNED_EXERCISES) if (hay.includes(b)) problems.push(`${d.id}: ejercicio prohibido "${b}"`);
    for (const b of BANNED_VOCAB) {
      const re = new RegExp(`\\b${b.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`);
      if (re.test(hay)) problems.push(`${d.id}: vocabulario prohibido "${b}"`);
    }
  }
  return problems;
}

function render(week, dares) {
  return `import type { Dare } from "../../types";

/* PROPUESTAS GENERADAS — semana ${week}. NO editar a mano salvo para
   revisión. Al aprobar: mover estas entradas a dares.ts/wildcards.ts y
   borrar este fichero. Ver docs/content-pipeline.md. */
export const PROPOSED: Dare[] = ${JSON.stringify(dares, null, 2)};
`;
}

async function main() {
  const ids = [...extract("dares.ts", "id"), ...extract("wildcards.ts", "id")];
  const titles = [...extract("dares.ts", "title"), ...extract("wildcards.ts", "title")];
  const scienceIds = extract("science.ts", "id");

  let feedback = null;
  const fbPath = join(ROOT, "feedback.json");
  if (existsSync(fbPath)) {
    try { feedback = JSON.parse(readFileSync(fbPath, "utf8")); }
    catch { console.warn("feedback.json presente pero no parsea; se ignora."); }
  }

  const week = isoWeek();
  const count = Number(process.env.DARE_BATCH || 3);
  const prompt = buildPrompt({ ids, titles, scienceIds, feedback, count });

  let dares = await askModel(prompt);
  if (!dares) {
    console.log("Sin ANTHROPIC_API_KEY: usando stub determinista.");
    dares = stubProposal(week, ids);
  }

  const problems = precheck(dares, ids);
  if (problems.length) {
    console.error("Pre-check falló:\n- " + problems.join("\n- "));
    process.exit(1);
  }
  if (dares.length === 0) {
    console.log("Nada nuevo que proponer esta semana.");
    return;
  }

  mkdirSync(OUT_DIR, { recursive: true });
  const out = join(OUT_DIR, `week-${week}.ts`);
  writeFileSync(out, render(week, dares));
  console.log(`Escritas ${dares.length} propuesta(s) en ${out}`);
  console.log("La validación definitiva la hace `npm test` (validateDare).");
}

main().catch((e) => { console.error(e); process.exit(1); });
