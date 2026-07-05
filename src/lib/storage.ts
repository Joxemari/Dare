import type { DareStore, JourneyId } from "../types";

const KEY = "dare:v6";
/** Claves antiguas, si un build previo escribió alguna. */
const KEY_V5 = "dare:v5";
const KEY_V4 = "dare:v4";
const KEY_V3 = "dare:v3";
const KEY_V2 = "dare:v2";
const KEY_V1 = "dare:v1";

export function defaultStore(): DareStore {
  return {
    version: 6,
    onboarded: false,
    journeyId: "iron",
    activeJourneyIds: [],
    journeyStartedAt: {},
    journeyProgress: { ember: 0, iron: 0, pulse: 0, water: 0, clear: 0, current: 0, wild: 0, fire: 0 },
    journeysCompleted: [],
    dreamRewards: {},
    checkins: [],
    lastCheckin: null,
    todaysDares: [],
    dailyCard: null,
    treats: [],
    completed: [],
    proofLibrary: [],
    momentum: { count: 0, lastDate: "" },
    traits: [],
    smallVersionUses: 0,
    identities: [],
    lastCats: [],
    catCounts: {},
    energyFeedback: [],
    milestones: {},
    companionShelf: null,
    bossPlaylist: null,
    plannedDares: [],
    darePlans: [],
    rejectedDares: [],
    dates: [],
    pendingFeedback: null,
    notifications: {
      enabled: false,
      morning: { hour: 9, minute: 0, lastShown: "" },
      evening: { hour: 18, minute: 0, lastShown: "" },
    },
    install: { dismissedAt: "", installedAt: "" },
  };
}

/**
 * Migra una forma desconocida/antigua hasta v6. Defensiva: mergea sobre
 * los defaults, de modo que cualquier campo que el build viejo nunca
 * escribió reciba un valor razonable. Idempotente: aplicada a un store ya
 * v6 lo deja igual.
 *
 * v2 → v3: renombra el vocabulario del prototipo al del producto —
 *   xp/streak/badges/rewardDraws/tarot → se descartan o remapean a
 *   proof/momentum/traits/treats/dailyCard. Se conserva lo transferible
 *   (progreso de journeys, check-ins, completados, feedback, catCounts).
 *
 * v3 → v4: modelo multi-journey + recordatorio diario. Se añade
 *   `activeJourneyIds` (journeys ARRANCADOS): un store v3 nunca lo tuvo, así
 *   que se DERIVA de lo que ya había — cualquier Journey con progreso > 0 o
 *   completado se considera activo, de modo que un usuario existente conserva
 *   su Journey en curso. También se añade `notifications`, que un store v3 no
 *   escribió nunca → recibe el default al mergear sobre `defaultStore()`.
 *
 * v4 → v5/v6: NOTA — hubo DOS "v5" en ramas paralelas que aquí se unifican en
 *   v6. Una v5 añadió Planned Dares (`darePlans`) + Dares rechazados
 *   (`rejectedDares`); la otra v5 añadió el recordatorio de DOS franjas +
 *   nudge de instalación (`install`). Un store guardado por CUALQUIERA de las
 *   dos v5 (o por un v4) migra a v6 sin pérdida porque el merge cubre ambos:
 *   - Planned Dares / rechazados: campos NUEVOS → `[]` al mergear si faltan.
 *   - `notifications`: si trae UNA sola hora (v4 o la v5 de Planned Dares) se
 *     promueve a la franja de la MAÑANA y la TARDE recibe el default (18:00);
 *     si ya trae `morning`/`evening` se mergea franja a franja.
 *   - `install`: campo NUEVO → default si falta.
 *   Idempotente: aplicada a un store ya v6 lo deja igual.
 */
function migrate(raw: unknown): DareStore {
  const base = defaultStore();
  if (!raw || typeof raw !== "object") return base;
  const o = raw as Record<string, unknown>;

  // Campos que se transfieren tal cual si existen y tienen el tipo correcto.
  const merged: DareStore = {
    ...base,
    onboarded: typeof o.onboarded === "boolean" ? o.onboarded : base.onboarded,
    journeyId: typeof o.journeyId === "string" ? (o.journeyId as DareStore["journeyId"]) : base.journeyId,
    version: 6,
  };

  if (o.journeyProgress && typeof o.journeyProgress === "object") {
    merged.journeyProgress = { ...base.journeyProgress, ...(o.journeyProgress as object) };
  }
  if (Array.isArray(o.checkins)) merged.checkins = o.checkins as DareStore["checkins"];
  if (o.lastCheckin && typeof o.lastCheckin === "object") merged.lastCheckin = o.lastCheckin as DareStore["lastCheckin"];
  if (Array.isArray(o.completed)) {
    // v2 completed llevaba `xp`; nos quedamos con dareId/date.
    merged.completed = (o.completed as Array<{ dareId?: string; date?: string }>)
      .filter((c) => c && typeof c.dareId === "string" && typeof c.date === "string")
      .map((c) => ({ dareId: c.dareId as string, date: c.date as string }));
  }
  if (Array.isArray(o.energyFeedback)) merged.energyFeedback = o.energyFeedback as DareStore["energyFeedback"];
  if (o.catCounts && typeof o.catCounts === "object") merged.catCounts = o.catCounts as DareStore["catCounts"];
  if (Array.isArray(o.lastCats)) merged.lastCats = o.lastCats as DareStore["lastCats"];

  // v2 streak → v3 momentum
  if (o.momentum && typeof o.momentum === "object") {
    merged.momentum = o.momentum as DareStore["momentum"];
  } else if (o.streak && typeof o.streak === "object") {
    merged.momentum = o.streak as DareStore["momentum"];
  }

  // v2 rewardDraws → v3 treats (misma forma date/tier/text)
  if (Array.isArray(o.treats)) merged.treats = o.treats as DareStore["treats"];
  else if (Array.isArray(o.rewardDraws)) merged.treats = o.rewardDraws as DareStore["treats"];

  // v2 tarot → v3 dailyCard (misma forma)
  if (o.dailyCard && typeof o.dailyCard === "object") merged.dailyCard = o.dailyCard as DareStore["dailyCard"];
  else if (o.tarot && typeof o.tarot === "object") merged.dailyCard = o.tarot as DareStore["dailyCard"];

  // v2 todaysDares: la forma de la entrada perdió `wild`? no — se conserva.
  if (Array.isArray(o.todaysDares)) merged.todaysDares = o.todaysDares as DareStore["todaysDares"];
  else if (o.todaysDare && typeof o.todaysDare === "object") {
    merged.todaysDares = [o.todaysDare as DareStore["todaysDares"][number]];
  }

  // Campos nuevos en v3 que un store previo pudo escribir (idempotencia).
  if (Array.isArray(o.journeysCompleted)) merged.journeysCompleted = o.journeysCompleted as DareStore["journeysCompleted"];
  if (o.dreamRewards && typeof o.dreamRewards === "object") merged.dreamRewards = o.dreamRewards as DareStore["dreamRewards"];
  if (Array.isArray(o.proofLibrary)) merged.proofLibrary = o.proofLibrary as DareStore["proofLibrary"];
  if (Array.isArray(o.traits)) merged.traits = o.traits as DareStore["traits"];
  else if (Array.isArray(o.badges)) merged.traits = []; // ids de badges v2 no mapean 1:1 a traits
  if (Array.isArray(o.identities)) merged.identities = o.identities as DareStore["identities"];
  if (o.milestones && typeof o.milestones === "object" && !Array.isArray(o.milestones)) {
    merged.milestones = o.milestones as DareStore["milestones"];
  }
  if (o.companionShelf && typeof o.companionShelf === "object") merged.companionShelf = o.companionShelf as DareStore["companionShelf"];
  if (o.bossPlaylist && typeof o.bossPlaylist === "object") merged.bossPlaylist = o.bossPlaylist as DareStore["bossPlaylist"];
  if (Array.isArray(o.plannedDares)) merged.plannedDares = o.plannedDares as DareStore["plannedDares"];
  // v5 — Planned Dares + Dares rechazados (nuevos; un store previo no los tuvo).
  if (Array.isArray(o.darePlans)) merged.darePlans = o.darePlans as DareStore["darePlans"];
  if (Array.isArray(o.rejectedDares)) merged.rejectedDares = o.rejectedDares as DareStore["rejectedDares"];
  if (Array.isArray(o.dates)) merged.dates = o.dates as DareStore["dates"];
  if (o.pendingFeedback && typeof o.pendingFeedback === "object") merged.pendingFeedback = o.pendingFeedback as DareStore["pendingFeedback"];
  if (typeof o.smallVersionUses === "number") merged.smallVersionUses = o.smallVersionUses;

  // v4 — journeys activos. Si el store ya los traía (v4), se respetan;
  // si no (v3 o anterior), se derivan del progreso para no perder el
  // Journey en curso de un usuario existente.
  if (Array.isArray(o.activeJourneyIds)) {
    merged.activeJourneyIds = o.activeJourneyIds as JourneyId[];
  } else {
    const derived = new Set<JourneyId>(merged.journeysCompleted);
    for (const id of Object.keys(merged.journeyProgress) as JourneyId[]) {
      if ((merged.journeyProgress[id] ?? 0) > 0) derived.add(id);
    }
    merged.activeJourneyIds = [...derived];
  }
  if (o.journeyStartedAt && typeof o.journeyStartedAt === "object") {
    merged.journeyStartedAt = o.journeyStartedAt as DareStore["journeyStartedAt"];
  }

  // v4/v5: preferencias de notificación. Un store v3 nunca las escribió →
  // recibe el default. Un v4 traía UNA franja (`{hour,minute,lastShown}`): se
  // promueve a la MAÑANA y la tarde recibe su default. Un v5 (con `morning`/
  // `evening`) se mergea franja a franja para completar campos que falten
  // (idempotencia).
  if (o.notifications && typeof o.notifications === "object" && !Array.isArray(o.notifications)) {
    const n = o.notifications as Record<string, unknown>;
    const enabled = typeof n.enabled === "boolean" ? n.enabled : base.notifications.enabled;
    const slot = (raw: unknown, def: DareStore["notifications"]["morning"]) =>
      raw && typeof raw === "object" && !Array.isArray(raw)
        ? { ...def, ...(raw as object) }
        : def;
    if ("morning" in n || "evening" in n) {
      // Forma v5.
      merged.notifications = {
        enabled,
        morning: slot(n.morning, base.notifications.morning),
        evening: slot(n.evening, base.notifications.evening),
      };
    } else {
      // Forma v4 (una sola hora) → franja de la mañana; tarde por defecto.
      merged.notifications = {
        enabled,
        morning: {
          hour: typeof n.hour === "number" ? n.hour : base.notifications.morning.hour,
          minute: typeof n.minute === "number" ? n.minute : base.notifications.morning.minute,
          lastShown: typeof n.lastShown === "string" ? n.lastShown : "",
        },
        evening: { ...base.notifications.evening },
      };
    }
  }

  // v5: estado del nudge de instalación. Un store anterior no lo tenía →
  // default; uno v5 parcial completa los campos que falten.
  if (o.install && typeof o.install === "object" && !Array.isArray(o.install)) {
    merged.install = { ...base.install, ...(o.install as object) };
  }

  return merged;
}

export function load(): DareStore {
  try {
    const cur = localStorage.getItem(KEY);
    if (cur) {
      const parsed = JSON.parse(cur);
      return parsed && parsed.version === 6 ? (parsed as DareStore) : migrate(parsed);
    }
    const v5 = localStorage.getItem(KEY_V5);
    if (v5) return migrate(JSON.parse(v5));
    const v4 = localStorage.getItem(KEY_V4);
    if (v4) return migrate(JSON.parse(v4));
    const v3 = localStorage.getItem(KEY_V3);
    if (v3) return migrate(JSON.parse(v3));
    const v2 = localStorage.getItem(KEY_V2);
    if (v2) return migrate(JSON.parse(v2));
    const v1 = localStorage.getItem(KEY_V1);
    if (v1) return migrate(JSON.parse(v1));
  } catch {
    /* almacenamiento corrupto — arrancar limpio */
  }
  return defaultStore();
}

export function save(store: DareStore): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(store));
  } catch {
    /* quota / modo privado — ignorar */
  }
}

export function clearStore(): void {
  try {
    localStorage.removeItem(KEY);
    localStorage.removeItem(KEY_V5);
    localStorage.removeItem(KEY_V4);
    localStorage.removeItem(KEY_V3);
    localStorage.removeItem(KEY_V2);
    localStorage.removeItem(KEY_V1);
  } catch {
    /* ignore */
  }
}

export { migrate as _migrate };
