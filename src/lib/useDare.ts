import { useEffect, useState } from "react";
import type {
  Cat,
  Checkin,
  Dare,
  DareStore,
  JourneyId,
  RewardDraw,
  TarotCard,
} from "../types";
import { DARES } from "../data/dares";
import { TAROT } from "../data/tarot";
import { BADGES } from "../data/badges";
import { JOURNEYS, CH_SIZE, chapterOf } from "../data/journeys";
import { generateDare } from "./generator";
import { rollDraw, sample } from "./random";
import { findDare, findCard } from "./lookup";
import { load, save, defaultStore, clearStore } from "./storage";
import { todayStr, daysBetween } from "./date";

export type Screen =
  | "onboarding"
  | "home"
  | "checkin"
  | "detail"
  | "timer"
  | "complete"
  | "journey"
  | "journeys"
  | "progress"
  | "you";

/** Partial check-in being filled on the check-in screen. */
export type DraftCheckin = {
  energy: number | null;
  time: number | null;
  loc: Checkin["loc"] | null;
  state: Checkin["state"] | null;
};

const emptyDraft: DraftCheckin = { energy: null, time: null, loc: null, state: null };
const FB_DELAY = 30 * 60 * 1000; // 30 minutes

/** Silent daily rollover: archive yesterday's dares, refresh the tarot draw. */
function rollover(s: DareStore): DareStore {
  const t = todayStr();
  const todaysDares = s.todaysDares.filter((e) => e.date === t);
  const tarot =
    s.tarot && s.tarot.date === t
      ? s.tarot
      : { date: t, options: sample(TAROT, 3).map((c) => c.id), cardId: null };
  return { ...s, todaysDares, tarot };
}

function catFeedbackMap(s: DareStore): Partial<Record<Cat, number>> {
  const m: Partial<Record<Cat, number>> = {};
  for (const f of s.energyFeedback) m[f.cat] = (m[f.cat] || 0) + f.delta;
  return m;
}

export function useDare() {
  const [store, setStore] = useState<DareStore>(() => rollover(load()));
  const [screen, setScreen] = useState<Screen>(() => (store.onboarded ? "home" : "onboarding"));
  const [away, setAway] = useState<boolean>(
    () =>
      store.onboarded &&
      !!store.streak.lastDate &&
      daysBetween(store.streak.lastDate, todayStr()) > 1,
  );

  // transient (not persisted)
  const [obIdx, setObIdx] = useState(0);
  const [draft, setDraft] = useState<DraftCheckin>(emptyDraft);
  const [draw, setDraw] = useState<RewardDraw | null>(null);
  const [drawFlipped, setDrawFlipped] = useState(false);
  const [lastGain, setLastGain] = useState(0);
  const [newBadges, setNewBadges] = useState<string[]>([]);
  const [fbNote, setFbNote] = useState(false);
  const [secs, setSecs] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    save(store);
  }, [store]);

  // timer countdown
  useEffect(() => {
    if (screen === "timer" && !paused && secs > 0) {
      const id = setTimeout(() => setSecs((s) => s - 1), 1000);
      return () => clearTimeout(id);
    }
  }, [screen, paused, secs]);
  // auto-finish when the clock runs out
  useEffect(() => {
    if (screen === "timer" && secs === 0 && currentEntry && currentEntry.completedAt === null)
      finishDare();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secs, screen]);

  // ---- derived selectors ----
  const journey = JOURNEYS.find((j) => j.id === store.journeyId)!;
  const jd = store.journeyProgress[store.journeyId];
  const chapter = chapterOf(journey, jd);
  const level = Math.floor(store.xp / 200) + 1;
  const catFeedback = catFeedbackMap(store);
  const today = todayStr();

  const todaysToday = store.todaysDares.filter((e) => e.date === today);
  const currentEntry = todaysToday.length ? todaysToday[todaysToday.length - 1] : null;
  const currentDare = currentEntry
    ? (() => {
        const dare = findDare(currentEntry.dareId);
        if (!dare) return null;
        return {
          entry: currentEntry,
          dare,
          why: currentEntry.why,
          revealed: currentEntry.revealed,
          completed: currentEntry.completedAt !== null,
        };
      })()
    : null;

  const daresToday = todaysToday.filter((e) => e.completedAt !== null).length;
  const cardOptions: TarotCard[] = (store.tarot?.options ?? [])
    .map((id) => findCard(id))
    .filter((c): c is TarotCard => !!c);
  const card = findCard(store.tarot?.cardId);
  const showPendingFb =
    !!store.pendingFeedback && Date.now() - store.pendingFeedback.at >= FB_DELAY;

  // ---- mutators ----
  const patch = (p: Partial<DareStore>) => setStore((s) => ({ ...s, ...p }));

  /** Replace the last-of-today entry (mutating one field), immutably. */
  function patchCurrentEntry(fields: Partial<DareStore["todaysDares"][number]>) {
    setStore((s) => {
      const arr = [...s.todaysDares];
      let idx = -1;
      for (let i = arr.length - 1; i >= 0; i--) {
        if (arr[i].date === todayStr()) {
          idx = i;
          break;
        }
      }
      if (idx === -1) return s;
      arr[idx] = { ...arr[idx], ...fields };
      return { ...s, todaysDares: arr };
    });
  }

  // ---- actions ----
  function completeOnboarding() {
    patch({ onboarded: true });
    setScreen("home");
  }

  function replayOnboarding() {
    setObIdx(0);
    setScreen("onboarding");
  }

  function pickCard(cardId: string) {
    setStore((s) => (s.tarot ? { ...s, tarot: { ...s.tarot, cardId } } : s));
  }

  function runCheckin(ci: Checkin) {
    const { dare, why } = generateDare(ci, store.lastCats, catFeedback, journey);
    setStore((s) => ({
      ...s,
      lastCheckin: ci,
      checkins: [...s.checkins, { ...ci, date: todayStr() }].slice(-60),
      todaysDares: [
        ...s.todaysDares,
        {
          dareId: dare.id,
          date: todayStr(),
          wild: !!dare.wild,
          revealed: false,
          why,
          startedAt: null,
          completedAt: null,
        },
      ],
    }));
    setDraft(emptyDraft);
    setScreen("home");
  }

  function justDareMe() {
    if (store.lastCheckin) runCheckin(store.lastCheckin);
    else setScreen("checkin");
  }

  function revealDare() {
    patchCurrentEntry({ revealed: true });
    setScreen("detail");
  }

  function startDare() {
    if (!currentDare) return;
    patchCurrentEntry({ startedAt: Date.now() });
    setSecs(currentDare.dare.min * 60);
    setPaused(false);
    setScreen("timer");
  }

  function swapToSmall() {
    const smalls = DARES.filter((d) => d.cat === "small");
    const dare = smalls[Math.floor(Math.random() * smalls.length)];
    patchCurrentEntry({
      dareId: dare.id,
      wild: false,
      revealed: true,
      why: "No energy is a valid state. This is the whole ask.",
      startedAt: null,
      completedAt: null,
    });
    setScreen("detail");
  }

  function finishDare() {
    if (!currentDare || currentDare.completed) return;
    const d: Dare = currentDare.dare;
    const roll = rollDraw();
    const gain = d.xp * (roll.x2 ? 2 : 1);
    const counts = { ...store.catCounts, [d.cat]: (store.catCounts[d.cat] || 0) + 1 };
    const completedBefore = todaysToday.filter((e) => e.completedAt !== null).length;
    const isFirstToday = completedBefore === 0;
    const nToday = completedBefore + 1;
    const h = new Date().getHours();
    const newStreakCount = isFirstToday ? store.streak.count + 1 : store.streak.count;

    const earned: string[] = [];
    const has = (id: string) => store.badges.includes(id) || earned.includes(id);
    if (!has("showed-up")) earned.push("showed-up");
    if (d.cat === "small" && !has("small-dare")) earned.push("small-dare");
    if (store.lastCheckin && store.lastCheckin.energy <= 3 && !has("no-excuses")) earned.push("no-excuses");
    if ((counts.forest || 0) >= 3 && !has("forest-explorer")) earned.push("forest-explorer");
    if ((d.cat === "dumbbells" || d.cat === "fitboxing") && !has("strength")) earned.push("strength");
    if ((counts.recovery || 0) + (counts.focus || 0) >= 3 && !has("clear-mind")) earned.push("clear-mind");
    if (d.wild && !has("wildcard")) earned.push("wildcard");
    if (d.cat === "pool" && !has("water-soul")) earned.push("water-soul");
    if (nToday >= 2 && !has("twice")) earned.push("twice");
    if (h >= 21 && !has("night")) earned.push("night");
    if (newStreakCount >= 7 && !has("week")) earned.push("week");
    if ((jd + 1) % CH_SIZE === 0 && chapter.idx < 3 && !has("chapter")) earned.push("chapter");

    setStore((s) => {
      // stamp completion on the active entry
      const arr = [...s.todaysDares];
      for (let i = arr.length - 1; i >= 0; i--) {
        if (arr[i].date === today && arr[i].completedAt === null) {
          arr[i] = { ...arr[i], completedAt: Date.now() };
          break;
        }
      }
      return {
        ...s,
        todaysDares: arr,
        catCounts: counts,
        xp: s.xp + gain,
        completed: [...s.completed, { dareId: d.id, date: today, xp: gain }],
        journeyProgress: { ...s.journeyProgress, [s.journeyId]: jd + 1 },
        streak: { count: newStreakCount, lastDate: today },
        lastCats: [d.cat, s.lastCats[0]].filter(Boolean).slice(0, 2) as Cat[],
        badges: [...s.badges, ...earned],
        rewardDraws: [...s.rewardDraws, { date: today, tier: roll.tier, text: roll.text }],
        pendingFeedback: { dareId: d.id, cat: d.cat, at: Date.now() },
      };
    });

    setDraw(roll);
    setDrawFlipped(false);
    setLastGain(gain);
    setNewBadges(earned);
    setFbNote(false);
    setScreen("complete");
  }

  function giveFeedback(delta: number) {
    const cat = store.pendingFeedback?.cat;
    if (!cat) return;
    setStore((s) => ({
      ...s,
      energyFeedback: [...s.energyFeedback, { date: todayStr(), cat, delta }],
      pendingFeedback: null,
    }));
    setFbNote(true);
  }

  function oneMore() {
    setDraw(null);
    setDrawFlipped(false);
    setFbNote(false);
    setDraft(emptyDraft);
    setScreen("checkin");
  }

  function dismissAway() {
    setAway(false);
    setScreen("home");
  }

  function doComeback() {
    const comeback = findDare("out-the-door")!;
    setStore((s) => ({
      ...s,
      todaysDares: [
        ...s.todaysDares,
        {
          dareId: comeback.id,
          date: todayStr(),
          wild: false,
          revealed: true,
          why: "You were away. This is the whole comeback — nothing more is asked.",
          startedAt: null,
          completedAt: null,
        },
      ],
    }));
    setAway(false);
    setScreen("detail");
  }

  function resetAll() {
    clearStore();
    setStore(rollover(defaultStore()));
    setDraft(emptyDraft);
    setDraw(null);
    setDrawFlipped(false);
    setLastGain(0);
    setNewBadges([]);
    setFbNote(false);
    setAway(false);
    setObIdx(0);
    setScreen("onboarding");
  }

  function setJourney(id: JourneyId) {
    patch({ journeyId: id });
  }

  return {
    store,
    // navigation
    screen,
    setScreen,
    away,
    setAway,
    obIdx,
    setObIdx,
    // check-in draft
    draft,
    setDraft,
    // derived
    journey,
    jd,
    chapter,
    level,
    catFeedback,
    currentDare,
    daresToday,
    cardOptions,
    card,
    showPendingFb,
    // timer + reward transient
    secs,
    setSecs,
    paused,
    setPaused,
    draw,
    drawFlipped,
    setDrawFlipped,
    lastGain,
    newBadges,
    fbNote,
    // constants passed through for convenience
    badgeDefs: BADGES,
    // actions
    completeOnboarding,
    replayOnboarding,
    pickCard,
    runCheckin,
    justDareMe,
    revealDare,
    startDare,
    swapToSmall,
    finishDare,
    giveFeedback,
    oneMore,
    dismissAway,
    doComeback,
    resetAll,
    setJourney,
  };
}

export type DareApp = ReturnType<typeof useDare>;
