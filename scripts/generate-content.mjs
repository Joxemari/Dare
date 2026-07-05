#!/usr/bin/env node
/* ============================================================
   generate-content — propone contenido NUEVO para revisión humana.
   Corre en el workflow semanal (.github/workflows/content.yml).

   Auto-proponible (aditivo + cubierto por validador + no sensible):
     - Dares      → PROPOSED
     - Wildcards  → PROPOSED_WILDCARDS (Dare con wild:true)
     - Treats     → PROPOSED_TREATS ({ tier, text, fits?, avoid?, special? })
   Human-first (la generación NO los toca): Journeys y fichas de Ciencia.
   Ver docs/content-pipeline.md.

   Flujo: lee el corpus (dedup + estilo) → pide al modelo (si hay
   ANTHROPIC_API_KEY) o cae a un stub determinista → pre-valida en JS →
   escribe src/data/_proposed/week-<AAAA-Www>.ts. La validación
   AUTORITATIVA es `npm test` (validateDare/validateWildcard/validateTreat).
   ============================================================ */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DATA = join(ROOT, "src", "data");
const OUT_DIR = join(DATA, "_proposed");

const BANNED_EXERCISES = ["push-up", "push up", "plank", "burpee", "mountain climber"];
const BANNED_VOCAB = ["xp", "level up", "streak failed", "calorie", "calories", "burn"];
const TIERS = ["common", "rare", "golden"];

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
    "Propón contenido NUEVO: Dares, Wildcards y Treats. NO Journeys ni Ciencia.",
    "",
    "REGLAS DURAS (obligatorias):",
    "- Todo en INGLÉS (title, trigger, companion, proof, steps, text de treats).",
    "- NUNCA trabajo de suelo con manos apoyadas (push-ups, planks, burpees, mountain climbers).",
    "- Sin gamificación ni fitness tracker: sin XP, niveles, 'streak failed', calorías ni 'burn'.",
    "- Aditivo: ids NUEVOS en kebab-case (los wildcards empiezan por 'w-'); sin colisiones.",
    "- scienceId debe ser uno de la biblioteca (o se omite).",
    "",
    "Dare/Wildcard: { id, title, cat, min, level, energy:[lo,hi], locs:[], companion, trigger, proof, effects:{Effect:1|2|3}, steps:[], scienceId?, wild? }",
    "Treat: { tier:'common'|'rare'|'golden', text, fits?:Cat[], avoid?:Cat[], special? } (special solo en golden)",
    `cats: forest walk dumbbells fitboxing pool padel tabata carry recovery focus small`,
    `levels: Easy Medium Strong · locs: home city park forest pool gym padel (forest/pool/gym/padel son DESTINO, nunca los pongas junto a "city")`,
    `effects: Energy Focus Mood Calm Strength Confidence Recovery (1..3)`,
    `scienceIds válidos: ${scienceIds.join(", ")}`,
    "",
    `IDs ya usados (NO repetir): ${ids.join(", ")}`,
    `Títulos existentes (evita duplicar): ${titles.join(" · ")}`,
    "",
    feedback
      ? `SEÑAL DEL USUARIO (prioriza lo que le da energía):\n${JSON.stringify(feedback, null, 2)}`
      : "Sin feedback del usuario todavía: propón variedad equilibrada.",
    "",
    `Devuelve SOLO un objeto JSON { "dares": [...${count}], "wildcards": [...2], "treats": [...3] }, sin texto alrededor.`,
  ].join("\n");
}

/** Llama al modelo si hay clave; devuelve { dares, wildcards, treats } o null. */
async function askModel(prompt) {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return null;
  const model = process.env.ANTHROPIC_MODEL || "claude-sonnet-5";
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "content-type": "application/json", "x-api-key": key, "anthropic-version": "2023-06-01" },
    body: JSON.stringify({ model, max_tokens: 3072, messages: [{ role: "user", content: prompt }] }),
  });
  if (!res.ok) throw new Error(`Anthropic API ${res.status}: ${await res.text()}`);
  const data = await res.json();
  const text = (data.content || []).map((b) => b.text || "").join("");
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("respuesta del modelo sin objeto JSON");
  const obj = JSON.parse(match[0]);
  return { dares: obj.dares || [], wildcards: obj.wildcards || [], treats: obj.treats || [] };
}

/** Stub determinista para que el pipeline corra sin red. */
function stub(week, ids) {
  const id = `gen-${week.toLowerCase()}`;
  if (ids.includes(`${id}-walk`)) return { dares: [], wildcards: [], treats: [] };
  return {
    dares: [
      { id: `${id}-walk`, title: "The Unhurried Loop", cat: "walk", min: 15, level: "Easy", energy: [2, 7],
        locs: ["city", "park"], companion: "One slow album.", trigger: "No route. Just out.",
        proof: "Moved before negotiating.", effects: { Energy: 2, Calm: 1, Mood: 1 }, scienceId: "walking-outdoors",
        steps: ["Album on before you sit back down", "Out the door, pick the softer direction", "Walk one unhurried loop", "Home when the album says so"] },
    ],
    wildcards: [
      { id: `w-${id}-dusk`, title: "Dusk Detour", cat: "walk", wild: true, min: 15, level: "Easy", energy: [3, 8],
        locs: ["city"], companion: "The changing light.", trigger: "Turn where you never turn.", proof: "Let the evening surprise me.",
        effects: { Calm: 2, Mood: 2 }, scienceId: "daylight",
        steps: ["Head out at dusk", "Take one street you never take", "Follow it until it surprises you", "Find your way back slowly"] },
    ],
    treats: [{ tier: "common", text: "Ten quiet minutes with the good tea." }],
  };
}

const KEBAB = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
function bannedHits(text) {
  const hay = String(text).toLowerCase();
  const hits = [];
  for (const b of BANNED_EXERCISES) if (hay.includes(b)) hits.push(b);
  for (const b of BANNED_VOCAB) {
    const re = new RegExp(`\\b${b.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`);
    if (re.test(hay)) hits.push(b);
  }
  return hits;
}

/** Pre-check rápido en JS; la validación autoritativa es `npm test`. */
function precheck({ dares, wildcards, treats }, ids, treatTexts) {
  const seen = new Set(ids);
  const problems = [];
  for (const d of [...dares, ...wildcards]) {
    if (!d || typeof d.id !== "string") { problems.push("propuesta sin id"); continue; }
    if (!KEBAB.test(d.id)) problems.push(`${d.id}: id no kebab-case`);
    if (seen.has(d.id)) problems.push(`${d.id}: id duplicado`);
    seen.add(d.id);
    const hits = bannedHits([d.title, d.trigger, d.companion, d.proof, ...(d.steps || [])].join(" "));
    for (const h of hits) problems.push(`${d.id}: palabra prohibida "${h}"`);
  }
  for (const w of wildcards) if (w && w.wild !== true) problems.push(`${w.id}: un wildcard debe llevar wild:true`);
  const seenText = new Set(treatTexts);
  for (const t of treats) {
    if (!t || typeof t.text !== "string") { problems.push("treat sin text"); continue; }
    if (!TIERS.includes(t.tier)) problems.push(`treat "${t.text}": tier inválido`);
    if (seenText.has(t.text)) problems.push(`treat duplicado: "${t.text}"`);
    seenText.add(t.text);
    for (const h of bannedHits(t.text)) problems.push(`treat "${t.text}": palabra prohibida "${h}"`);
  }
  return problems;
}

function render(week, { dares, wildcards, treats }) {
  const parts = [`import type { Dare, Tier, Treat } from "../../types";`, ""];
  parts.push(`/* PROPUESTAS GENERADAS — semana ${week}. NO editar salvo revisión. Al aprobar:`);
  parts.push(`   Dares/Wildcards → dares.ts/wildcards.ts, Treats → rewards.ts; borra este fichero. */`);
  if (dares.length) parts.push(`export const PROPOSED: Dare[] = ${JSON.stringify(dares, null, 2)};`);
  if (wildcards.length) parts.push(`export const PROPOSED_WILDCARDS: Dare[] = ${JSON.stringify(wildcards, null, 2)};`);
  if (treats.length) parts.push(`export const PROPOSED_TREATS: Array<Treat & { tier: Tier }> = ${JSON.stringify(treats, null, 2)};`);
  return parts.join("\n") + "\n";
}

async function main() {
  const ids = [...extract("dares.ts", "id"), ...extract("wildcards.ts", "id")];
  const titles = [...extract("dares.ts", "title"), ...extract("wildcards.ts", "title")];
  const scienceIds = extract("science.ts", "id");
  const treatTexts = extract("rewards.ts", "text");

  let feedback = null;
  const fbPath = join(ROOT, "feedback.json");
  if (existsSync(fbPath)) {
    try { feedback = JSON.parse(readFileSync(fbPath, "utf8")); }
    catch { console.warn("feedback.json presente pero no parsea; se ignora."); }
  }

  const week = isoWeek();
  const count = Number(process.env.DARE_BATCH || 3);
  const prompt = buildPrompt({ ids, titles, scienceIds, feedback, count });

  let batch = await askModel(prompt);
  if (!batch) {
    console.log("Sin ANTHROPIC_API_KEY: usando stub determinista.");
    batch = stub(week, ids);
  }
  batch = { dares: batch.dares || [], wildcards: batch.wildcards || [], treats: batch.treats || [] };

  const problems = precheck(batch, ids, treatTexts);
  if (problems.length) {
    console.error("Pre-check falló:\n- " + problems.join("\n- "));
    process.exit(1);
  }
  const total = batch.dares.length + batch.wildcards.length + batch.treats.length;
  if (total === 0) {
    console.log("Nada nuevo que proponer esta semana.");
    return;
  }

  mkdirSync(OUT_DIR, { recursive: true });
  const out = join(OUT_DIR, `week-${week}.ts`);
  writeFileSync(out, render(week, batch));
  console.log(`Escritas ${batch.dares.length} dares, ${batch.wildcards.length} wildcards, ${batch.treats.length} treats en ${out}`);
  console.log("La validación definitiva la hace `npm test`.");
}

main().catch((e) => { console.error(e); process.exit(1); });
