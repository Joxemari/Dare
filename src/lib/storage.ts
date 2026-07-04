import type { DareStore } from "../types";

const KEY = "dare:v2";
/** Legacy v1 key, if a pre-journeys build ever wrote one. */
const KEY_V1 = "dare:v1";

export function defaultStore(): DareStore {
  return {
    version: 2,
    onboarded: false,
    journeyId: "ember",
    journeyProgress: { ember: 0, iron: 0, water: 0 },
    checkins: [],
    lastCheckin: null,
    todaysDares: [],
    tarot: null,
    rewardDraws: [],
    completed: [],
    xp: 0,
    streak: { count: 0, lastDate: "" },
    badges: [],
    lastCats: [],
    catCounts: {},
    energyFeedback: [],
    pendingFeedback: null,
  };
}

/**
 * Migrate an unknown/older shape up to v2. Defensive: merges over the
 * defaults so any field the old build never wrote gets a sane value.
 * v1 → v2: singular `todaysDare` becomes the `todaysDares` array; journeys,
 * tarot and reward draws are added.
 */
function migrate(raw: unknown): DareStore {
  const base = defaultStore();
  if (!raw || typeof raw !== "object") return base;
  const o = raw as Record<string, unknown>;

  const merged: DareStore = { ...base, ...(o as Partial<DareStore>), version: 2 };

  // v1 singular dare → array
  if (!Array.isArray(merged.todaysDares) && o.todaysDare && typeof o.todaysDare === "object") {
    merged.todaysDares = [o.todaysDare as DareStore["todaysDares"][number]];
  }

  // guard collections that must be arrays/objects
  if (!Array.isArray(merged.todaysDares)) merged.todaysDares = [];
  if (!Array.isArray(merged.checkins)) merged.checkins = [];
  if (!Array.isArray(merged.rewardDraws)) merged.rewardDraws = [];
  if (!Array.isArray(merged.completed)) merged.completed = [];
  if (!Array.isArray(merged.badges)) merged.badges = [];
  if (!Array.isArray(merged.lastCats)) merged.lastCats = [];
  if (!Array.isArray(merged.energyFeedback)) merged.energyFeedback = [];
  if (!merged.catCounts || typeof merged.catCounts !== "object") merged.catCounts = {};
  if (!merged.journeyProgress || typeof merged.journeyProgress !== "object") {
    merged.journeyProgress = { ember: 0, iron: 0, water: 0 };
  }
  if (!merged.streak || typeof merged.streak !== "object") merged.streak = { count: 0, lastDate: "" };

  return merged;
}

export function load(): DareStore {
  try {
    const cur = localStorage.getItem(KEY);
    if (cur) {
      const parsed = JSON.parse(cur);
      return parsed && parsed.version === 2 ? (parsed as DareStore) : migrate(parsed);
    }
    const legacy = localStorage.getItem(KEY_V1);
    if (legacy) return migrate(JSON.parse(legacy));
  } catch {
    /* corrupt storage — start clean */
  }
  return defaultStore();
}

export function save(store: DareStore): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(store));
  } catch {
    /* quota / private mode — ignore */
  }
}

export function clearStore(): void {
  try {
    localStorage.removeItem(KEY);
    localStorage.removeItem(KEY_V1);
  } catch {
    /* ignore */
  }
}
