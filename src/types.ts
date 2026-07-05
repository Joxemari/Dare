/* ============================================================
   DARE — tipos compartidos. Modelo de dominio del producto.
   Vocabulario del producto (ver CLAUDE.md / spec):
     Proof (no XP) · Identity (no Levels) · Traits (no Badges)
     Treat Draw (no Reward Draw) · Companion (no in-dare reward)
     Milestones (no Marks) · Momentum (no Flexible streak)
   ============================================================ */
import type { SymbolKey } from "./data/symbols";

export type Cat =
  // --- energía física (contexto con localización: check-in completo) ---
  | "forest"
  | "walk"
  | "dumbbells"
  | "fitboxing"
  | "pool"
  | "padel"
  | "tabata"
  | "carry"
  | "recovery"
  | "focus"
  | "small"
  // --- anti-procrastinación / activación (Today: check-in rápido en casa) ---
  | "admin" // papeleo, correos, trámites: hacer contacto sin terminar
  | "communication" // mensajes, llamadas, responder lo pendiente
  | "bodyreset" // reset corporal breve (estiramiento, postura, agua)
  | "environment" // ordenar/limpiar una superficie o rincón
  | "creative" // arrancar algo creativo (página en blanco)
  | "social" // valentía social: un pequeño gesto hacia alguien
  | "decision" // reducir decisiones: elegir una sola cosa
  | "emotion" // regulación emocional: nombrar, respirar, soltar
  | "phone" // límite con el teléfono: distancia con la pantalla
  | "taskcontact" // hacer contacto con la tarea temida (sin forzar el final)
  | "close"; // cerrar/terminar algo pequeño ya empezado

export type Level = "Easy" | "Medium" | "Strong";

/** Dónde puede ejecutarse un Dare (locations físicas reales). */
export type Loc = "home" | "outside" | "forest" | "pool" | "gym" | "padel";

/** Contexto actual del usuario en el check-in (dónde está AHORA). */
export type CurrentLoc = "home" | "city" | "park" | "office" | "travelling";

/** Destino al que DARE puede empujar al usuario ahora mismo. */
export type Dest = "forest" | "pool" | "gym" | "padel" | "cafe";

export type MentalState = "blocked" | "tired" | "normal" | "active" | "stressed";

/** Qué está evitando el usuario (check-in rápido de Today). El Dare le ayuda
 *  a hacer contacto con lo evitado, sin exigirle terminarlo. */
export type Avoid = "admin" | "body" | "people" | "mind" | "none";

export type JourneyId =
  | "ember" // First Flame (id histórico conservado para no romper datos guardados)
  | "iron" // Iron Quiet
  | "pulse" // Bright Pulse (MVP — cardio divertido)
  | "water" // Still Water
  | "clear" // Clear Signal
  | "current" // Steady Current
  | "wild" // Wild Ground
  | "fire"; // Quiet Fire

export type Tier = "common" | "rare" | "golden";

/** Efectos esperados — categorías de sensación, no neuroquímica.
 *  Set ampliado para que el detalle nunca se sienta pobre (solo Calm/Mood).
 *  `Stress` es un efecto de REDUCCIÓN: se renderiza con "↓" (ver Effects.tsx),
 *  y su intensidad 1..3 mide cuánto baja el estrés. */
export type Effect =
  | "Energy"
  | "Focus"
  | "Mood"
  | "Calm"
  | "Strength"
  | "Confidence"
  | "Recovery"
  | "Clarity"
  | "Stress"
  | "Sleep"
  | "Momentum";

/** Intensidad de un efecto: 1 (+), 2 (++), 3 (+++). */
export type EffectMap = Partial<Record<Effect, 1 | 2 | 3>>;

/* ------------------------- COMPANIONS -------------------------
   Companion = recompensa DURANTE la acción (temptation bundling,
   Nudge): emparejar algo que "deberías hacer" (esfuerzo) con algo
   que "quieres hacer" (placer). NO es un personaje ni decoración:
   es el anzuelo que hace que la actividad sea menos aburrida. La
   regla del producto: el companion ocurre DURANTE el Dare, nunca
   antes. Catálogo en `data/companions.ts`, lógica en
   `lib/companions.ts`. */

/** Familias de companion (cada una ataca una fricción distinta). */
export type CompanionCategory =
  | "entertainment" // Netflix, YouTube, podcast, audiobook, playlist
  | "social" // llamar a alguien, clase con gente, caminar acompañada
  | "sensory" // café, vela, sauna, ducha caliente, ropa bonita, sol
  | "novelty" // ruta nueva, clase nueva, deporte nuevo, sitio nuevo
  | "identity"; // "hot walk mode", "strong woman mode", "boxing girl mode"

/** Lo que el usuario elige en el check-in: "¿qué lo haría menos
    aburrido hoy?". Sesga la generación hacia una familia de companion. */
export type CompanionVibe =
  | "watch" // ver algo
  | "listen" // escuchar algo
  | "talk" // hablar con alguien
  | "elsewhere" // ir a un sitio distinto
  | "aesthetic" // hacerlo bonito
  | "social" // hacerlo social
  | "brutal" // corto y brutal
  | "surprise"; // sorpréndeme

/** Un Companion concreto y accionable (vive en `data/companions.ts`). */
export interface Companion {
  id: string;
  category: CompanionCategory;
  /** Palabra única para el chip (p. ej. "Netflix"). */
  word: string;
  /** Frase corta y accionable, en presente, DURANTE la acción. */
  label: string;
  /** Por qué funciona (temptation bundling), una frase. */
  note: string;
  /** Categorías de Dare a las que encaja mejor (vacío = cualquiera). */
  cats?: Cat[];
}

export interface Dare {
  id: string;
  title: string;
  cat: Cat;
  min: number;
  level: Level;
  energy: [number, number];
  locs: Loc[];
  /** Companion: qué acompaña la acción para hacerla disfrutable.
   *  Debe ser CONCRETO y tangible ("A glass of cold water", "A 2-minute
   *  timer"), no abstracto ("silence", "daylight"). */
  companion: string;
  /** Trigger: la frase que ayuda a empezar. En la UI ya no es una sección
   *  propia: se muestra como el primer paso práctico dentro de Steps. */
  trigger: string;
  /** Resumen corto de qué ES/HACE el Dare ("What this is"): primera sección
   *  de la pantalla del Dare. Si falta, se deriva un fallback. */
  summary?: string;
  /** Proof statement en primera persona, se colecciona al completar. */
  proof: string;
  /** Efectos esperados (sensaciones), para el detalle. */
  effects: EffectMap;
  steps: string[];
  /** id de una ficha de la biblioteca de ciencia. */
  scienceId?: string;
  /** Restringe el dare a ciertos estados mentales al puntuar. */
  states?: MentalState[];
  /** Los wildcards viven en un pool aparte y se revelan en dorado. */
  wild?: boolean;
}

export interface Checkin {
  energy: number;
  time: number;
  /** Dónde está el usuario ahora. */
  loc: CurrentLoc;
  /** A dónde acepta que DARE le mande (o null = "Not now"). */
  dest: Dest | null;
  state: MentalState;
  /** "¿Qué lo haría menos aburrido hoy?" — sesga el companion del Dare.
      Opcional: los check-ins antiguos (pre-companions) no lo tienen → surprise. */
  vibe?: CompanionVibe | null;
  /** Capacidad de foco 1..10 (check-in rápido de Today la aporta). Opcional
   *  para no romper el check-in completo, que no la pide. */
  focus?: number;
  /** Qué está evitando ahora mismo (check-in rápido). El generador lo usa para
   *  ofrecer un Dare que haga contacto con lo evitado. Opcional. */
  avoiding?: Avoid;
}

export interface TarotCard {
  id: string;
  num: string;
  name: string;
  msg: string;
}

/* ------------------------- MILESTONES -------------------------
   Eventos tipados por capítulo (estilo Fabulous). Cada milestone
   tiene una acción real (fix del bug de "Start no hace nada"):
   letter/motivator/science abren una lectura; action abre un
   formulario; goal enruta a un Dare/flujo. */
/* Tipos de milestone (spec Journey system):
   letter (lectura), action (Setup Action: abre un formulario),
   goal (Dare Goal: enruta a un Dare/flujo), science (ficha corta),
   motivator (lectura breve), proof (línea de evidencia que se guarda),
   reflection (escribe una línea), badge (Badge Unlock: cierre del Journey). */
export type MilestoneType =
  | "letter"
  | "goal"
  | "action"
  | "motivator"
  | "science"
  | "proof"
  | "reflection"
  | "badge";

export type ActionKind = "companionShelf" | "bossPlaylist" | "text";

export interface Milestone {
  /** id estable, p. ej. "ff-1-letter". Persistencia de completado. */
  id: string;
  t: MilestoneType;
  title: string;
  /** Cuerpo largo para letter/science/motivator/reflection (modal de lectura). */
  body?: string;
  /** Para type "action": qué formulario abrir. */
  action?: ActionKind;
  /** Para type "science": id en la biblioteca de ciencia. Si falta, el
      milestone es autocontenido (title + body sirven de ficha corta). */
  scienceId?: string;
  /** Para type "goal": pista de a dónde lleva (check-in, feedback…). */
  goalHint?: string;
}

export interface Chapter {
  n: string;
  name: string;
  sym: SymbolKey;
  goal: string;
  /** Rango de días del sprint que cubre este capítulo (inclusive). */
  days: [number, number];
  milestones: Milestone[];
}

/** Un día del sprint de 7 días. */
export interface DayPlan {
  day: number; // 1..7
  title: string;
  cat: Cat;
  /** id de dare concreto, si el día fija uno; si no, se genera por cat. */
  dareId?: string;
  chapter?: boolean; // "Chapter Moment"
  dream?: boolean; // día de desbloqueo del Dream Reward

  /* ---- Contenido enriquecido del día (spec Journey system) ----
     Todo opcional para no romper planes antiguos. El día describe la
     acción y sus variantes de dificultad, además de Trigger/Companion/
     Treat/Proof y una ficha corta "Science Behind Today's Dare". */
  /** ◆ Real Dare — la versión recomendada del día (descripción). */
  dare?: string;
  /** ◌ Soft Dare — versión de baja energía. */
  soft?: string;
  /** ⟁ Bold Dare — versión más dura. */
  bold?: string;
  trigger?: string;
  companion?: string;
  treat?: string;
  proof?: string;
  scienceTitle?: string;
  scienceBody?: string;
}

export interface DreamRewardOption {
  id: string;
  emoji: string;
  label: string;
  /** true en la opción "Create my own". */
  custom?: boolean;
}

export interface Journey {
  id: JourneyId;
  name: string;
  sym: SymbolKey;
  color: string;
  tag: string;
  problem: string;
  promise: string;
  lesson: string;
  /** Categorías hacia las que el Journey inclina el generador. */
  bias: Cat[];
  /** Identidad / Badge que se desbloquea al terminar (1 por Journey). */
  identity: { id: string; name: string; line: string };
  /** Línea de cierre del completion copy (spec). Opcional. */
  completionLine?: string;
  dreamPrompt: string;
  dreamOptions: DreamRewardOption[];
  chapters: Chapter[];
  /** Plan diario del sprint (7 días). Vacío = placeholder. */
  plan: DayPlan[];
}

/** Identidad / Trait desbloqueable. */
export interface Trait {
  id: string;
  sym: SymbolKey;
  name: string;
  /** Statement de identidad en tercera persona. */
  line: string;
  /** Cómo se desbloquea (texto legible). */
  how: string;
}

/** Ficha de la biblioteca de ciencia. */
export interface Science {
  id: string;
  category: string;
  title: string;
  text: string;
  evidence: "Strong" | "Moderate" | "Emerging";
  effects: EffectMap;
  longTerm?: string;
}

export interface TreatDraw {
  tier: Tier;
  text: string;
  /** Efecto especial de un treat dorado (no XP doble). */
  special?: "golden" | "date" | "dreamBoost" | "choose";
}

/** Un treat del catálogo (`data/rewards.ts`). Los tags lo ligan al CONTEXTO
    del Dare recién completado (su categoría): `fits` = encaja especialmente
    (se prima al elegir), `avoid` = choca con esa actividad y NO debe salir
    (p. ej. "un café sentado" justo después de un paseo por el bosque).
    Sin tags = neutro: vale tras cualquier Dare. */
export interface Treat {
  text: string;
  /** Categorías con las que este treat encaja especialmente. */
  fits?: readonly Cat[];
  /** Categorías tras las que NUNCA debe ofrecerse. */
  avoid?: readonly Cat[];
  /** Solo los golden llevan efecto especial. */
  special?: TreatDraw["special"];
}

/** Un Dare surgido para un día. `why` es la explicación generada. */
export interface TodaysDare {
  dareId: string;
  date: string;
  wild: boolean;
  revealed: boolean;
  why: string;
  startedAt: number | null;
  completedAt: number | null;
}

/** Companion Shelf — one-time action de The Ember. */
export interface CompanionShelf {
  podcast: string;
  series: string;
  playlist: string;
  album: string;
}

/** Boss Playlist — one-time action de Iron Quiet. */
export interface BossPlaylist {
  name: string;
  platform: string;
  firstSong: string;
}

export interface PlannedDare {
  id: string;
  dest: Dest;
  label: string;
  date?: string;
}

/** Cuándo se quiere retomar un Dare planeado (Planned Dares). */
export type PlanWhen =
  | "later-today"
  | "tomorrow-am"
  | "tomorrow-pm"
  | "weekend"
  | "journey";

/** Un Dare que el usuario aparta para más tarde. Guarda el id del Dare
 *  (referencia, no copia) y cuándo debe volver a aparecer. `dueDate` es la
 *  fecha (YYYY-MM-DD) a partir de la cual se surface en Today; para
 *  "journey" queda vacío (vive en el contexto del Journey). */
export interface DarePlan {
  id: string;
  dareId: string;
  when: PlanWhen;
  dueDate: string;
  /** Título del Dare, cacheado para la lista (se re-resuelve al iniciarlo). */
  label: string;
  createdAt: string;
}

export interface ScheduledDate {
  when: string; // "saturday" | "sunday" | "later" | fecha
  idea?: string;
  journeyId: JourneyId;
}

/** Una franja horaria del recordatorio (mañana o tarde). Cada una lleva su
    propio `lastShown` para el dedupe: disparar la de la mañana NO debe impedir
    que la de la tarde avise el mismo día. */
export interface NotificationSlot {
  /** Hora local (0-23). */
  hour: number;
  /** Minuto local (0-59). */
  minute: number;
  /** Última fecha (YYYY-MM-DD) en que se mostró esta franja — dedupe diario. */
  lastShown: string;
}

/** Preferencias del recordatorio diario (ver lib/notify.ts + briefing.ts).
    Sin backend: el push en segundo plano no es fiable; esto configura un
    recordatorio LOCAL (Notifications API + service worker) que se dispara
    mientras la app está abierta o donde el dispositivo lo permita.

    DOS empujones al día (v5): uno por la mañana y otro por la tarde, cada uno
    con su hora y su dedupe. `enabled` cubre ambas franjas. */
export interface NotificationPrefs {
  enabled: boolean;
  /** Empujón de la mañana (por defecto 09:00). */
  morning: NotificationSlot;
  /** Empujón de la tarde (por defecto 18:00). */
  evening: NotificationSlot;
}

/** Estado del nudge "añadir a inicio" (PWA). Sin backend: instalar es lo que
    hace DURADERO el localStorage en iOS (Safari desaloja el de una web NO
    instalada a los ~7 días de inactividad → se perdería el progreso). */
export interface InstallPrefs {
  /** Última fecha (YYYY-MM-DD) en que el usuario descartó el nudge — se respeta
      una ventana de silencio para no insistir. "" = nunca descartado. */
  dismissedAt: string;
  /** Fecha (YYYY-MM-DD) en que se detectó la instalación (evento `appinstalled`),
      o "" si no consta. */
  installedAt: string;
}

/** localStorage — versión 6. Ver storage.ts (migración desde v2/v3/v4/v5).
    v6 UNIFICA varias v5 que colisionaron en ramas paralelas: Planned Dares
    (`darePlans` + `rejectedDares`), el recordatorio de dos franjas + nudge de
    instalación (`notifications` morning/evening + `install`) y los Companions
    (campo opcional `vibe` en `Checkin`). */
export interface DareStore {
  version: 7;
  onboarded: boolean;
  /** Journey "en foco" para la pantalla Journey y la lane de Today. */
  journeyId: JourneyId;
  /**
   * Journeys ACTIVOS (empezados explícitamente por el usuario). Un Journey
   * solo arranca cuando se pulsa "Begin Journey": onboarding NO lo arranca.
   * Se permiten varios a la vez (p. ej. The Ember + Iron Quiet).
   */
  activeJourneyIds: JourneyId[];
  /** Fecha (YYYY-MM-DD) en que se empezó cada Journey. */
  journeyStartedAt: Partial<Record<JourneyId, string>>;
  /** Nº de dares completados dentro de cada Journey (índice de día). */
  journeyProgress: Record<JourneyId, number>;
  /** Journeys terminados (sprint de 7 completado). */
  journeysCompleted: JourneyId[];
  /** Dream Reward elegido por Journey (id de opción o texto propio). */
  dreamRewards: Partial<Record<JourneyId, string>>;
  checkins: Array<Checkin & { date: string }>;
  lastCheckin: Checkin | null;
  todaysDares: TodaysDare[];
  /** Daily Card (tarot) del día. */
  dailyCard: { date: string; options: string[]; cardId: string | null } | null;
  /** Historial de Treat Draws. */
  treats: Array<{ date: string; tier: Tier; text: string }>;
  completed: Array<{ dareId: string; date: string }>;
  /** Proof Library — statements coleccionados, en orden cronológico. */
  proofLibrary: Array<{ date: string; dareId: string; text: string }>;
  /** Momentum (antes "flexible streak"). */
  momentum: { count: number; lastDate: string };
  /** Badges desbloqueados (ids). El campo persiste como `traits` por
   *  compatibilidad con datos guardados; la UI los llama "Badges". */
  traits: string[];
  /** Veces que se ha usado la versión de baja energía (para el badge Reset Artist). */
  smallVersionUses: number;
  /** Identidades desbloqueadas (ids). */
  identities: string[];
  /** [categoría más reciente, segunda más reciente]. */
  lastCats: Cat[];
  catCounts: Partial<Record<Cat, number>>;
  energyFeedback: Array<{ date: string; cat: Cat; delta: number }>;
  /** Milestones completados por id. */
  milestones: Record<string, boolean>;
  companionShelf: CompanionShelf | null;
  bossPlaylist: BossPlaylist | null;
  plannedDares: PlannedDare[];
  /** Planned Dares (v5): Dares concretos apartados para más tarde. */
  darePlans: DarePlan[];
  /** Dares rechazados ("Another dare") con su fecha, para no repetirlos pronto (v5). */
  rejectedDares: Array<{ dareId: string; date: string }>;
  dates: ScheduledDate[];
  /** Feedback diferido "+30 min"; se muestra en la próxima apertura. */
  pendingFeedback: { dareId: string; cat: Cat; at: number } | null;
  /** Preferencias del recordatorio diario (v4; dos franjas desde v5). */
  notifications: NotificationPrefs;
  /** Estado del nudge de instalación PWA (v5). */
  install: InstallPrefs;
  /** Fecha (YYYY-MM-DD) en que se resolvió el ritual de la Daily Card al abrir
   *  la app (sacada O saltada). Gate del "una vez al día": si no coincide con
   *  hoy y aún no hay carta, el ritual de las 3 cartas aparece al abrir (v7). */
  cardIntroDate: string;
}
