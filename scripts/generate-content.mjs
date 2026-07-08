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
    "MISIÓN (Wave 2): rellenar la matriz Place × Time × Energy con Dares FÍSICOS,",
    "CREATIVOS, VARIADOS y DIVERTIDOS, con base científica. Propón Dares, Wildcards y Treats.",
    "NO Journeys ni fichas de Ciencia.",
    "",
    "SCOPE — SOLO energía física (+ Body Reset). Categorías PERMITIDAS:",
    "  Fuerza: dumbbells, carry · Cardio: tabata, fitboxing · Flow (movimiento consciente):",
    "  yoga, taichi, qigong · Fuera: walk, forest · Agua: pool · Juego: padel, climbing ·",
    "  Recuperación/Reset: recovery, bodyreset · y small (mínimos de 3 min).",
    "  PROHIBIDO generar categorías de 'activación/vida' (admin, communication, environment,",
    "  creative, social, decision, emotion, phone, taskcontact, close) y 'focus'.",
    "",
    "REGLAS DURAS (obligatorias):",
    "- Todo en INGLÉS (title, trigger, companion, proof, steps, text de treats).",
    "- NUNCA trabajo de suelo con manos apoyadas: push-ups, planks, burpees, mountain climbers.",
    "  El YOGA va SIN suelo con manos (de pie / sentado / restaurativo): NADA de chaturanga,",
    "  plancha ni perro boca abajo largo. Sun salutations en versión de PIE.",
    "- Sin gamificación ni fitness tracker: sin XP, niveles, 'streak failed', calorías ni 'burn'.",
    "- Aditivo: ids NUEVOS en kebab-case (los wildcards empiezan por 'w-'); sin colisiones.",
    "- scienceId debe ser uno de la biblioteca (o se omite). Lenguaje prudente: 'is associated",
    "  with', 'may support'; nunca claims médicos.",
    "",
    "PLACE = INTENCIÓN, no solo ubicación. Genera para el sitio con contenido específico:",
    "- Bed (locs ['home']): SOLO despertar/cerrar el día, energía baja, 5–10 min. Estiramientos",
    "  suaves de columna al amanecer o para dormir. NUNCA fuerza ni cardio.",
    "- Office (locs ['home']): resets en la SILLA o de pie entre reuniones, 5–10 min. Espalda,",
    "  cuello, cadera, movilidad, taichi/qigong. SIN asumir que va a entrenar ni sudar.",
    "- Home (locs ['home']): interior, poco material — fuerza de pie, dance cardio, yoga, movilidad.",
    "- City (locs ['city']): calle, escaleras, cuestas, paseos urbanos.",
    "- Park (locs ['park']): verde, aire libre, yoga de pie, descalzo, paseos.",
    "- Gym (locs ['home','gym'] o ['gym']): fuerza, cardio, fitboxing, clases.",
    "- Destino ['forest'|'pool'|'padel'|'climbing'... ] SOLO alcanzable vía 'Take me somewhere'.",
    "",
    "MODALIDADES a cubrir (sé creativo y sorpréndeme, no 'haz 20 sentadillas'): fuerza de pie,",
    "carries, intervalos de pie, fitboxing/shadowbox, dance cardio, YOGA de pie, TAI CHI, QIGONG,",
    "movilidad, paseo/awe walk, escaleras/cuestas, natación, padel, ESCALADA, respiración,",
    "reset de escritorio, estiramiento de despertar/dormir, y COSAS INESPERADAS (andar hacia",
    "atrás, descalzo en la hierba, retos de equilibrio, comba).",
    "",
    "ENERGÍA = intensidad REAL. El rango energy:[lo,hi] debe reflejar el nivel:",
    "  Tired → [1,3] Easy · Calm → [2,5] Easy · Normal → [4,7] Easy/Medium · High → [7,10] Medium/Strong.",
    "  Con energía baja, Dares SUAVES; con High, intensos. Distingue Calm de Tired y Normal de High.",
    "TIME = duración coherente: `min` encaja el hueco (5→2-5, 10→8-10, 20→15-20, 30→25-30);",
    "  ofrece variantes de la misma actividad a 5/10/20 min. NUNCA propongas 5 min para un hueco de 20.",
    "",
    "COMPANION concreto y AJUSTADO al tipo/dificultad (temptation bundling, DURANTE la acción):",
    "  Strong/High → modo identidad o playlist que empuja · Flow/Recovery → lo-fi, vela, calma ·",
    "  Walk → podcast/audiolibro, ruta nueva · Play → alguien, algo nuevo. VARÍA — no repitas.",
    "",
    "Dare/Wildcard: { id, title, cat, min, level, energy:[lo,hi], locs:[], companion, trigger, proof, effects:{Effect:1|2|3}, steps:[], scienceId?, wild? }",
    "Treat: { tier:'common'|'rare'|'golden', text, fits?:Cat[], avoid?:Cat[], special? } (special solo en golden).",
    "  Treats CONCRETOS y específicos (cosas reales de comprar/hacer), no 'un snack'. Los golden",
    "  para lo difícil/largo; usa fits/avoid por categoría.",
    `cats permitidas: dumbbells carry tabata fitboxing yoga taichi qigong walk forest pool padel climbing recovery bodyreset small`,
    `levels: Easy Medium Strong · locs: home city park forest pool gym padel (forest/pool/gym/padel son DESTINO, nunca junto a "city"/"park")`,
    `effects: Energy Focus Mood Calm Strength Confidence Recovery Clarity Stress Sleep Momentum (1..3)`,
    `scienceIds válidos: ${scienceIds.join(", ")}`,
    "",
    `IDs ya usados (NO repetir): ${ids.join(", ")}`,
    `Títulos existentes (evita duplicar): ${titles.join(" · ")}`,
    "",
    feedback
      ? `SEÑAL DEL USUARIO (prioriza lo que le da energía):\n${JSON.stringify(feedback, null, 2)}`
      : "Sin feedback del usuario todavía: reparte por Place/Energy/Time y prioriza huecos (Bed, Office, destinos).",
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

/** Stub determinista para que el pipeline corra sin red. Refleja el estilo
    Wave 2: modalidades nuevas (yoga de pie, tai chi de oficina), Place como
    intención (Bed/Office), y treats concretos. */
function stub(week, ids) {
  const id = `gen-${week.toLowerCase()}`;
  if (ids.includes(`${id}-sunflow`)) return { dares: [], wildcards: [], treats: [] };
  return {
    dares: [
      { id: `${id}-sunflow`, title: "Standing Sun Flow", cat: "yoga", min: 10, level: "Easy", energy: [2, 6],
        locs: ["park", "home"], companion: "A calm-focus playlist, low.", trigger: "Reach before you think.",
        proof: "Moved with the breath, not the clock.", effects: { Calm: 2, Mood: 2, Energy: 1 }, scienceId: "breath-recovery",
        steps: ["Stand tall, feet hip-width", "Reach up on the inhale, fold with soft knees on the exhale", "Rise to a gentle standing warrior, both sides", "Repeat with the breath — all standing, no hands to the floor"] },
      { id: `${id}-cloudhands`, title: "Cloud Hands", cat: "taichi", min: 5, level: "Easy", energy: [1, 4],
        locs: ["home"], companion: "One long exhale per sweep.", trigger: "Slow is the point.",
        proof: "Reset between meetings without a sweat.", effects: { Calm: 3, Stress: 2, Clarity: 1 }, scienceId: "cyclic-sighing",
        steps: ["Stand behind your chair, knees soft", "Shift your weight slowly side to side", "Let your arms float and cross like clouds", "Two minutes, breath leading the hands"] },
    ],
    wildcards: [
      { id: `w-${id}-barefoot`, title: "Barefoot Grass Reset", cat: "recovery", wild: true, min: 10, level: "Easy", energy: [2, 7],
        locs: ["park"], companion: "No phone, eyes up.", trigger: "Shoes off. Feet down.", proof: "Let the ground hold me for a while.",
        effects: { Calm: 2, Recovery: 1, Stress: 2 }, scienceId: "nature",
        steps: ["Find grass or bare earth", "Shoes and socks off", "Walk slowly, notice temperature and texture", "Stay until you feel reset"] },
    ],
    treats: [{ tier: "rare", text: "Buy the grippy yoga mat you keep eyeing.", fits: ["yoga", "taichi", "recovery"] }],
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
