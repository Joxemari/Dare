import type { DareStore, JourneyId } from "../types";

const KEY = "dare:v4";
/** Claves antiguas, si un build previo escribió alguna. */
const KEY_V3 = "dare:v3";
const KEY_V2 = "dare:v2";
const KEY_V1 = "dare:v1";

export function defaultStore(): DareStore {
  return {
    version: 4,
    onboarded: false,
    journeyId: "ember",
    activeJourneyIds: [],
    journeyStartedAt: {},
    journeyProgress: { ember: 0, iron: 0, water: 0, clear: 0, current: 0, wild: 0, fire: 0 },
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
    dates: [],
    pendingFeedback: null,
    notifications: { enabled: false, hour: 9, minute: 0, lastShown: "" },
  };
}

/**
 * Migra una forma desconocida/antigua hasta v4. Defensiva: mergea sobre
 * los defaults, de modo que cualquier campo que el build viejo nunca
 * escribió reciba un valor razonable. Idempotente: aplicada a un store ya
 * v4 lo deja igual.
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
    version: 4,
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

  // v4: preferencias de notificación. Se mergean sobre el default para que un
  // store v3 (que nunca escribió el campo) reciba valores por defecto, y para
  // que un v4 parcial complete los campos que falten (idempotencia).
  if (o.notifications && typeof o.notifications === "object" && !Array.isArray(o.notifications)) {
    merged.notifications = { ...base.notifications, ...(o.notifications as object) };
  }

  return merged;
}

export function load(): DareStore {
  try {
    const cur = localStorage.getItem(KEY);
    if (cur) {
      const parsed = JSON.parse(cur);
      return parsed && parsed.version === 4 ? (parsed as DareStore) : migrate(parsed);
    }
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
    localStorage.removeItem(KEY_V3);
    localStorage.removeItem(KEY_V2);
    localStorage.removeItem(KEY_V1);
  } catch {
    /* ignore */
  }
}

export { migrate as _migrate };
