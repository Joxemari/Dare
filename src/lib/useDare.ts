import { useEffect, useState } from "react";
import type {
  BossPlaylist,
  Cat,
  Checkin,
  CompanionShelf,
  Dare,
  DareStore,
  Dest,
  JourneyId,
  TarotCard,
  TreatDraw,
} from "../types";
import { DARES } from "../data/dares";
import { TAROT } from "../data/tarot";
import { TRAITS } from "../data/traits";
import { JOURNEYS, journeyById, chapterOf, SPRINT_DAYS } from "../data/journeys";
import { generateDare } from "./generator";
import { rollTreat, sample } from "./random";
import { findDare, findCard } from "./lookup";
import { earnedTraits } from "./achievements";
import { load, save, defaultStore, clearStore } from "./storage";
import { todayStr, daysBetween } from "./date";

export type Screen =
  | "onboarding"
  | "dream"
  | "home"
  | "checkin"
  | "detail"
  | "timer"
  | "complete"
  | "journey"
  | "journeys"
  | "progress"
  | "you";

/** Check-in parcial que se rellena en la pantalla de check-in. */
export type DraftCheckin = {
  energy: number | null;
  time: number | null;
  loc: Checkin["loc"] | null;
  dest: Dest | null;
  state: Checkin["state"] | null;
};

const emptyDraft: DraftCheckin = { energy: null, time: null, loc: null, dest: null, state: null };
const FB_DELAY = 30 * 60 * 1000; // 30 minutos

/** Rollover diario silencioso: archiva los dares de ayer, refresca la Daily Card. */
function rollover(s: DareStore): DareStore {
  const t = todayStr();
  const todaysDares = s.todaysDares.filter((e) => e.date === t);
  const dailyCard =
    s.dailyCard && s.dailyCard.date === t
      ? s.dailyCard
      : { date: t, options: sample(TAROT, 3).map((c) => c.id), cardId: null };
  return { ...s, todaysDares, dailyCard };
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
      !!store.momentum.lastDate &&
      daysBetween(store.momentum.lastDate, todayStr()) > 1,
  );

  // transitorio (no persistido)
  const [obIdx, setObIdx] = useState(0);
  const [draft, setDraft] = useState<DraftCheckin>(emptyDraft);
  const [treat, setTreat] = useState<TreatDraw | null>(null);
  const [treatFlipped, setTreatFlipped] = useState(false);
  const [lastProof, setLastProof] = useState<string>("");
  const [newTraits, setNewTraits] = useState<string[]>([]);
  const [justCompletedJourney, setJustCompletedJourney] = useState<JourneyId | null>(null);
  const [fbNote, setFbNote] = useState(false);
  const [secs, setSecs] = useState(0);
  const [paused, setPaused] = useState(false);
  const [usedSmall, setUsedSmall] = useState(false);

  useEffect(() => {
    save(store);
  }, [store]);

  // cuenta atrás del timer
  useEffect(() => {
    if (screen === "timer" && !paused && secs > 0) {
      const id = setTimeout(() => setSecs((s) => s - 1), 1000);
      return () => clearTimeout(id);
    }
  }, [screen, paused, secs]);
  // auto-finaliza cuando el reloj llega a 0
  useEffect(() => {
    if (screen === "timer" && secs === 0 && currentEntry && currentEntry.completedAt === null)
      finishDare();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secs, screen]);

  // ---- selectores derivados ----
  const journey = journeyById(store.journeyId);
  const daysDone = store.journeyProgress[store.journeyId];
  const chapter = chapterOf(journey, daysDone);
  const catFeedback = catFeedbackMap(store);
  const today = todayStr();
  const proofCount = store.proofLibrary.length;
  const dreamReward = store.dreamRewards[store.journeyId] ?? null;
  /** Identidad actual: la última desbloqueada, o la que persigue el journey. */
  const currentIdentity =
    store.identities.length > 0
      ? store.identities[store.identities.length - 1]
      : journey.identity.id;

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
  const cardOptions: TarotCard[] = (store.dailyCard?.options ?? [])
    .map((id) => findCard(id))
    .filter((c): c is TarotCard => !!c);
  const card = findCard(store.dailyCard?.cardId);
  const showPendingFb =
    !!store.pendingFeedback && Date.now() - store.pendingFeedback.at >= FB_DELAY;

  // ---- mutadores ----
  const patch = (p: Partial<DareStore>) => setStore((s) => ({ ...s, ...p }));

  /** Reemplaza la última entrada de hoy (mutando un campo), inmutablemente. */
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

  // ---- acciones ----
  function completeOnboarding() {
    patch({ onboarded: true });
    // Si no hay Dream Reward para The Ember, ir al setup; si no, a Today.
    setScreen(store.dreamRewards[store.journeyId] ? "home" : "dream");
  }

  function replayOnboarding() {
    setObIdx(0);
    setScreen("onboarding");
  }

  function setDreamReward(id: string) {
    setStore((s) => ({ ...s, dreamRewards: { ...s.dreamRewards, [s.journeyId]: id } }));
  }

  function confirmDreamReward(id: string) {
    setDreamReward(id);
    setScreen("home");
  }

  function pickCard(cardId: string) {
    setStore((s) => (s.dailyCard ? { ...s, dailyCard: { ...s.dailyCard, cardId } } : s));
  }

  function runCheckin(ci: Checkin) {
    const { dare, why } = generateDare(ci, store.lastCats, catFeedback, journey);
    setUsedSmall(false);
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
    setUsedSmall(true);
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
    const roll = rollTreat();
    const counts = { ...store.catCounts, [d.cat]: (store.catCounts[d.cat] || 0) + 1 };
    const completedBefore = todaysToday.filter((e) => e.completedAt !== null).length;
    const isFirstToday = completedBefore === 0;
    const nToday = completedBefore + 1;
    const h = new Date().getHours();
    const restartedAfterGap =
      !!store.momentum.lastDate && daysBetween(store.momentum.lastDate, today) > 1;
    const newMomentum = isFirstToday ? store.momentum.count + 1 : store.momentum.count;
    const totalCompleted = store.completed.length + 1;

    // ¿cierra el sprint del Journey? (día 7 completado)
    const newDaysDone = daysDone + 1;
    const finishesJourney =
      newDaysDone >= SPRINT_DAYS && !store.journeysCompleted.includes(store.journeyId);

    // traits ganados por este dare (función pura)
    const have = (id: string) => store.traits.includes(id);
    const earned = earnedTraits({
      dare: d,
      ci: store.lastCheckin,
      counts,
      totalCompleted,
      nToday,
      hour: h,
      momentum: newMomentum,
      usedSmallVersion: usedSmall,
      restartedAfterGap,
      prevCat: store.lastCats[0],
      have,
    });

    // traits e identidad de fin de Journey
    const newIdentities: string[] = [];
    if (finishesJourney) {
      const jTrait = store.journeyId === "ember" ? "proof-of-fire" : store.journeyId === "iron" ? "proof-of-iron" : null;
      if (jTrait && !have(jTrait) && !earned.includes(jTrait)) earned.push(jTrait);
      if (store.journeyId === "iron" && !have("quiet-power") && !earned.includes("quiet-power")) earned.push("quiet-power");
      const identId = journey.identity.id;
      if (!store.identities.includes(identId)) newIdentities.push(identId);
      // la identidad también existe como trait coleccionable
      if (!have(identId) && !earned.includes(identId)) earned.push(identId);
    }

    setStore((s) => {
      // sella la completion en la entrada activa
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
        completed: [...s.completed, { dareId: d.id, date: today }],
        proofLibrary: [...s.proofLibrary, { date: today, dareId: d.id, text: d.proof }],
        journeyProgress: { ...s.journeyProgress, [s.journeyId]: newDaysDone },
        journeysCompleted: finishesJourney ? [...s.journeysCompleted, s.journeyId] : s.journeysCompleted,
        momentum: { count: newMomentum, lastDate: today },
        lastCats: [d.cat, s.lastCats[0]].filter(Boolean).slice(0, 2) as Cat[],
        traits: [...s.traits, ...earned],
        identities: [...s.identities, ...newIdentities],
        treats: [...s.treats, { date: today, tier: roll.tier, text: roll.text }],
        pendingFeedback: { dareId: d.id, cat: d.cat, at: Date.now() },
      };
    });

    setTreat(roll);
    setTreatFlipped(false);
    setLastProof(d.proof);
    setNewTraits(earned);
    setJustCompletedJourney(finishesJourney ? store.journeyId : null);
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
    setTreat(null);
    setTreatFlipped(false);
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
    setTreat(null);
    setTreatFlipped(false);
    setLastProof("");
    setNewTraits([]);
    setJustCompletedJourney(null);
    setFbNote(false);
    setUsedSmall(false);
    setAway(false);
    setObIdx(0);
    setScreen("onboarding");
  }

  function setJourney(id: JourneyId) {
    patch({ journeyId: id });
  }

  /** Selecciona un journey desde el picker; si no tiene Dream Reward, va al setup. */
  function chooseJourney(id: JourneyId) {
    patch({ journeyId: id });
    setScreen(store.dreamRewards[id] ? "journey" : "dream");
  }

  // ---- milestones ----
  function completeMilestone(id: string) {
    setStore((s) => ({ ...s, milestones: { ...s.milestones, [id]: true } }));
  }

  function saveCompanionShelf(shelf: CompanionShelf, milestoneId?: string) {
    setStore((s) => ({
      ...s,
      companionShelf: shelf,
      milestones: milestoneId ? { ...s.milestones, [milestoneId]: true } : s.milestones,
    }));
  }

  function saveBossPlaylist(pl: BossPlaylist, milestoneId?: string) {
    setStore((s) => ({
      ...s,
      bossPlaylist: pl,
      milestones: milestoneId ? { ...s.milestones, [milestoneId]: true } : s.milestones,
    }));
  }

  // ---- planning + dates ----
  function planDare(dest: Dest, label: string) {
    setStore((s) => ({
      ...s,
      plannedDares: [...s.plannedDares, { id: `${dest}-${s.plannedDares.length}`, dest, label }],
    }));
  }

  function scheduleDate(when: string, idea?: string) {
    setStore((s) => ({
      ...s,
      dates: [...s.dates, { when, idea, journeyId: s.journeyId }],
      // "Self-Investor" se desbloquea al reservar una Date
      traits: s.traits.includes("self-investor") ? s.traits : [...s.traits, "self-investor"],
    }));
  }

  return {
    store,
    // navegación
    screen,
    setScreen,
    away,
    setAway,
    obIdx,
    setObIdx,
    // check-in draft
    draft,
    setDraft,
    // derivados
    journey,
    daysDone,
    chapter,
    catFeedback,
    currentDare,
    daresToday,
    cardOptions,
    card,
    proofCount,
    dreamReward,
    currentIdentity,
    showPendingFb,
    // timer + treat transitorio
    secs,
    setSecs,
    paused,
    setPaused,
    treat,
    treatFlipped,
    setTreatFlipped,
    lastProof,
    newTraits,
    justCompletedJourney,
    fbNote,
    // constantes útiles
    traitDefs: TRAITS,
    journeys: JOURNEYS,
    // acciones
    completeOnboarding,
    replayOnboarding,
    setDreamReward,
    confirmDreamReward,
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
    chooseJourney,
    completeMilestone,
    saveCompanionShelf,
    saveBossPlaylist,
    planDare,
    scheduleDate,
  };
}

export type DareApp = ReturnType<typeof useDare>;
