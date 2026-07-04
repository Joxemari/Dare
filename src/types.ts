/* ============================================================
   DARE — shared types. Derived from the stable prototype data.
   ============================================================ */

export type Cat =
  | "forest"
  | "walk"
  | "dumbbells"
  | "fitboxing"
  | "pool"
  | "padel"
  | "recovery"
  | "focus"
  | "small";

export type Level = "Easy" | "Medium" | "Strong";

export type Loc = "home" | "outside" | "forest" | "pool" | "gym" | "padel";

export type MentalState = "blocked" | "tired" | "normal" | "active" | "stressed";

export type JourneyId = "ember" | "iron" | "water";

export type Tier = "common" | "rare" | "golden";

export interface Dare {
  id: string;
  title: string;
  cat: Cat;
  min: number;
  xp: number;
  level: Level;
  energy: [number, number];
  locs: Loc[];
  reward: string;
  steps: string[];
  /** Restricts the dare to certain mental states when scoring. */
  states?: MentalState[];
  /** Wildcards live in a separate pool and are revealed in gold. */
  wild?: boolean;
}

export interface Checkin {
  energy: number;
  time: number;
  loc: Loc;
  state: MentalState;
}

export interface TarotCard {
  id: string;
  num: string;
  name: string;
  msg: string;
}

export interface Journey {
  id: JourneyId;
  name: string;
  sym: string;
  color: string;
  tag: string;
  bias: Cat[];
  chapters: Chapter[];
}

export interface Chapter {
  n: string;
  name: string;
  goal: string;
}

export type MarkType = "letter" | "goal" | "action" | "motivator";

export interface Mark {
  t: MarkType;
  title: string;
  done: boolean;
}

export interface Badge {
  id: string;
  ico: string;
  name: string;
  how: string;
}

export interface RewardDraw {
  tier: Tier;
  text: string;
  x2: boolean;
}

/** A dare surfaced for a given day. `why` is the generated explanation. */
export interface TodaysDare {
  dareId: string;
  date: string;
  wild: boolean;
  revealed: boolean;
  why: string;
  startedAt: number | null;
  completedAt: number | null;
}

/** localStorage schema — version 2 (see DARE-project-instructions.md §6). */
export interface DareStore {
  version: 2;
  onboarded: boolean;
  journeyId: JourneyId;
  journeyProgress: Record<JourneyId, number>;
  checkins: Array<Checkin & { date: string }>;
  lastCheckin: Checkin | null;
  todaysDares: TodaysDare[];
  tarot: { date: string; options: string[]; cardId: string | null } | null;
  rewardDraws: Array<{ date: string; tier: Tier; text: string }>;
  completed: Array<{ dareId: string; date: string; xp: number }>;
  xp: number;
  streak: { count: number; lastDate: string };
  badges: string[];
  /** [most recent category, second most recent]. */
  lastCats: Cat[];
  catCounts: Partial<Record<Cat, number>>;
  energyFeedback: Array<{ date: string; cat: Cat; delta: number }>;
  /** Deferred "+30 min" feedback prompt; shown on the next opening ≥30 min later. */
  pendingFeedback: { dareId: string; cat: Cat; at: number } | null;
}
