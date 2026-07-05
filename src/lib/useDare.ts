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
import { CATS } from "../data/colors";
import { JOURNEYS, journeyById, currentChapter, SPRINT_DAYS } from "../data/journeys";
import { generateDare, recentDareIds } from "./generator";
import { rollTreat, sample } from "./random";
import { findDare, findCard } from "./lookup";
import { earnedTraits } from "./achievements";
import { load, save, defaultStore, clearStore } from "./storage";
import { todayStr, daysBetween } from "./date";
import { buildBriefing, buildReminder, reminderDue, type BriefingInput } from "./briefing";
import { notificationPermission, requestNotificationPermission, showReminderNotification } from "./notify";

export type Screen =
  | "onboarding"
  | "dream"
  | "home"
  | "card"
  | "checkin"
  | "detail"
  | "timer"
  | "complete"
  | "journey"
  | "journeys"
  | "progress"
  | "you";

/** Check-in parcial que se rellena en la pantalla de check-in.
 *  `dest`: null = SIN tocar (ningún botón marcado), "none" = "Not now"
 *  elegido explícitamente, o un destino concreto. */
export type DraftCheckin = {
  energy: number | null;
  time: number | null;
  loc: Checkin["loc"] | null;
  dest: Dest | "none" | null;
  state: Checkin["state"] | null;
};

const emptyDraft: DraftCheckin = { energy: null, time: null, loc: null, dest: null, state: null };
const FB_DELAY = 30 * 60 * 1000; // 30 minutos
/** Check-in por defecto para "Just dare me" sin check-in previo:
 *  corto, de baja fricción, inmediato. */
const SAFE_CI: Checkin = { energy: 5, time: 3, loc: "home", dest: null, state: "normal" };

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

/** Orden de importancia de los badges (para destacar solo uno en completion). */
const BADGE_PRIORITY = [
  // Badges finales de Journey (máxima prioridad al destacar en completion).
  "first-mover",
  "quiet-builder",
  "regulator",
  "clear-mind",
  "returner",
  "outwalker",
  "forged",
  "proof-of-iron",
  "proof-of-fire",
  "quiet-power",
  "builder",
  "courageous",
  "momentum-keeper",
  "water-reset",
  "forest-mind",
  "focus-keeper",
  "rhythm-finder",
  "reset-artist",
  "self-investor",
  "starter",
];

/** Devuelve el badge más importante de la lista, o null. Nunca más de uno. */
function featureBadge(earned: string[]): string | null {
  if (!earned.length) return null;
  const rank = (id: string) => {
    const i = BADGE_PRIORITY.indexOf(id);
    return i === -1 ? BADGE_PRIORITY.length : i;
  };
  return [...earned].sort((a, b) => rank(a) - rank(b))[0];
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
  /** Capítulo activo: por COMPLETADO de milestones, no por día de calendario. */
  const chapter = currentChapter(journey, store.milestones);
  /** Journeys arrancados por el usuario (pueden ser varios a la vez). */
  const activeJourneys = JOURNEYS.filter((j) => store.activeJourneyIds.includes(j.id));
  const isJourneyActive = store.activeJourneyIds.includes(store.journeyId);
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

  // ---- briefing diario (widget + recordatorio) ----
  const bestEnergyCat = (Object.entries(catFeedback) as [Cat, number][])
    .filter(([, v]) => (v ?? 0) > 0)
    .sort((a, b) => (b[1] ?? 0) - (a[1] ?? 0))[0];
  const briefingInput: BriefingInput = {
    date: today,
    hour: new Date().getHours(),
    momentum: store.momentum.count,
    journeyName: journey.name,
    journeySym: journey.sym,
    chapterName: chapter.name,
    daysDone,
    sprintDays: SPRINT_DAYS,
    doneToday: daresToday > 0,
    dareTitle:
      currentDare && currentDare.revealed && !currentDare.completed ? currentDare.dare.title : null,
    cardName: card ? card.name : null,
    topEnergyLabel: bestEnergyCat ? CATS[bestEnergyCat[0]].label : null,
    proofCount,
  };
  const briefing = buildBriefing(briefingInput);
  const notifyPermission = notificationPermission();

  // Recordatorio local: comprueba al montar, al enfocar la pestaña y cada
  // minuto mientras la app está viva. La DECISIÓN (`reminderDue`) y el
  // CONTENIDO (`buildReminder`) son puros; el efecto de mostrar y el permiso
  // viven en `notify.ts`. Límite honesto: sin backend no hay push con la app
  // cerrada (ver notify.ts).
  useEffect(() => {
    if (!store.notifications.enabled || notifyPermission !== "granted") return;
    let cancelled = false;
    const url = typeof window !== "undefined" ? window.location.href : "";
    const check = () => {
      if (cancelled) return;
      const now = new Date();
      if (!reminderDue(store.notifications, now, daresToday > 0)) return;
      const r = buildReminder({ ...briefingInput, hour: now.getHours() });
      showReminderNotification(r.title, r.body, url);
      setStore((s) => ({ ...s, notifications: { ...s.notifications, lastShown: todayStr(now) } }));
    };
    check();
    const id = setInterval(check, 60 * 1000);
    const onVis = () => {
      if (document.visibilityState === "visible") check();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      cancelled = true;
      clearInterval(id);
      document.removeEventListener("visibilitychange", onVis);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    store.notifications.enabled,
    store.notifications.hour,
    store.notifications.minute,
    store.notifications.lastShown,
    notifyPermission,
    daresToday,
  ]);

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
  /** Onboarding NO arranca ningún Journey: solo abre Today. El Journey se
   *  empieza explícitamente desde la pestaña Journey ("Begin Journey"). */
  function completeOnboarding() {
    patch({ onboarded: true });
    setScreen("home");
  }

  function replayOnboarding() {
    setObIdx(0);
    setScreen("onboarding");
  }

  function setDreamReward(id: string) {
    setStore((s) => ({ ...s, dreamRewards: { ...s.dreamRewards, [s.journeyId]: id } }));
  }

  /** Marca un Journey como activo (arrancado). Idempotente. */
  function activateJourney(id: JourneyId) {
    setStore((s) =>
      s.activeJourneyIds.includes(id)
        ? s
        : {
            ...s,
            activeJourneyIds: [...s.activeJourneyIds, id],
            journeyStartedAt: { ...s.journeyStartedAt, [id]: todayStr() },
          },
    );
  }

  /** "Begin Journey": si falta Dream Reward, primero su setup; si no, arranca ya.
   *  Arrancar un Journey NO detiene otros ya activos. */
  function startJourney(id: JourneyId) {
    patch({ journeyId: id });
    if (store.dreamRewards[id]) {
      activateJourney(id);
      setScreen("journey");
    } else {
      setScreen("dream");
    }
  }

  /** Confirma el Dream Reward del Journey en foco y lo arranca. */
  function confirmDreamReward(id: string) {
    setDreamReward(id);
    activateJourney(store.journeyId);
    setScreen("journey");
  }

  function pickCard(cardId: string) {
    setStore((s) => (s.dailyCard ? { ...s, dailyCard: { ...s.dailyCard, cardId } } : s));
    // Al elegir carta se revela a pantalla completa (screen "card"); desde el
    // recap de Home se puede reabrir con setScreen("card").
    setScreen("card");
  }

  /**
   * Genera un Dare desde un check-in. `navigate: "detail"` lo abre en la
   * pantalla de Detalle (flujo "Get my Dare"); `navigate: "home"` lo revela
   * inline en Today (ritual de un toque, sin cambiar de pantalla).
   */
  function generateInto(ci: Checkin, opts: { persistCheckin: boolean; navigate: "detail" | "home" }) {
    const recentIds = recentDareIds([...store.completed, ...store.todaysDares]);
    const { dare, why } = generateDare(ci, store.lastCats, catFeedback, journey, recentIds);
    setUsedSmall(false);
    setStore((s) => ({
      ...s,
      lastCheckin: ci,
      checkins: opts.persistCheckin ? [...s.checkins, { ...ci, date: todayStr() }].slice(-60) : s.checkins,
      // Reemplaza cualquier Dare de hoy aún SIN completar (p. ej. "Another dare"
      // no apila): conserva los ya completados para el recuento del día.
      todaysDares: [
        ...s.todaysDares.filter((e) => !(e.date === todayStr() && e.completedAt === null)),
        {
          dareId: dare.id,
          date: todayStr(),
          wild: !!dare.wild,
          revealed: true, // "Get my Dare" / "Just dare me" / "Reveal" abren el Dare directamente
          why,
          startedAt: null,
          completedAt: null,
        },
      ],
    }));
    setDraft(emptyDraft);
    setScreen(opts.navigate === "home" ? "home" : "detail");
  }

  /** "Get my Dare" desde el check-in completo → abre el Detail directamente. */
  function runCheckin(ci: Checkin) {
    generateInto(ci, { persistCheckin: true, navigate: "detail" });
  }

  /** "Just dare me": Dare inmediato. Último check-in si existe, o default seguro. */
  function justDareMe() {
    generateInto(store.lastCheckin ?? SAFE_CI, { persistCheckin: false, navigate: "detail" });
  }

  /** Today "Reveal today's dare": revela el Dare de hoy INLINE (sin navegar).
   *  Si ya hay uno sin revelar, lo abre; si no, genera uno al instante. */
  function revealTodayDare() {
    if (currentEntry && currentEntry.completedAt === null) {
      if (!currentEntry.revealed) patchCurrentEntry({ revealed: true });
      return;
    }
    generateInto(store.lastCheckin ?? SAFE_CI, { persistCheckin: false, navigate: "home" });
  }

  /** Today "Another dare": genera un Dare distinto y lo deja revelado inline. */
  function anotherDare() {
    generateInto(store.lastCheckin ?? SAFE_CI, { persistCheckin: false, navigate: "home" });
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
    // El treat conoce el CONTEXTO: la categoría del Dare recién hecho
    // (nada de "un café sentado" tras un paseo por el bosque).
    const roll = rollTreat(d.cat);
    const counts = { ...store.catCounts, [d.cat]: (store.catCounts[d.cat] || 0) + 1 };
    const completedBefore = todaysToday.filter((e) => e.completedAt !== null).length;
    const isFirstToday = completedBefore === 0;
    const newMomentum = isFirstToday ? store.momentum.count + 1 : store.momentum.count;
    const totalCompleted = store.completed.length + 1;
    // días distintos con al menos un Dare (para el badge Momentum Keeper)
    const distinctDays = new Set([...store.completed.map((c) => c.date), today]).size;
    // veces usada la versión de baja energía (para el badge Reset Artist)
    const newSmallUses = store.smallVersionUses + (usedSmall ? 1 : 0);

    // El progreso/completion del Journey SOLO cuenta si el Journey en foco está
    // activo (arrancado). Sin Journey activo, el Dare aún cuenta para proof,
    // momentum y badges globales, pero no avanza ningún sprint.
    const journeyActive = store.activeJourneyIds.includes(store.journeyId);
    const newDaysDone = journeyActive ? daysDone + 1 : daysDone;
    const finishesJourney =
      journeyActive && newDaysDone >= SPRINT_DAYS && !store.journeysCompleted.includes(store.journeyId);

    // badges ganados por este Dare (función pura, umbrales acumulados)
    const have = (id: string) => store.traits.includes(id);
    const earned = earnedTraits({
      dare: d,
      ci: store.lastCheckin,
      counts,
      totalCompleted,
      distinctDays,
      smallVersionUses: newSmallUses,
      have,
    });

    // badges e identidad de fin de Journey
    const newIdentities: string[] = [];
    if (finishesJourney) {
      const jTrait = store.journeyId === "ember" ? "proof-of-fire" : store.journeyId === "iron" ? "proof-of-iron" : null;
      if (jTrait && !have(jTrait) && !earned.includes(jTrait)) earned.push(jTrait);
      if (store.journeyId === "iron") {
        // Iron Quiet completado → Quiet Power y Builder (vía Journey).
        for (const b of ["quiet-power", "builder"]) if (!have(b) && !earned.includes(b)) earned.push(b);
      }
      const identId = journey.identity.id;
      if (!store.identities.includes(identId)) newIdentities.push(identId);
      // la identidad también existe como badge coleccionable
      if (!have(identId) && !earned.includes(identId)) earned.push(identId);
    }

    // Un único badge "destacado" para la pantalla de completion (el más
    // importante); el resto se desbloquean en silencio y aparecen en Progress.
    const featured = featureBadge(earned);

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
        journeyProgress: journeyActive ? { ...s.journeyProgress, [s.journeyId]: newDaysDone } : s.journeyProgress,
        journeysCompleted: finishesJourney ? [...s.journeysCompleted, s.journeyId] : s.journeysCompleted,
        momentum: { count: newMomentum, lastDate: today },
        lastCats: [d.cat, s.lastCats[0]].filter(Boolean).slice(0, 2) as Cat[],
        traits: [...s.traits, ...earned],
        smallVersionUses: newSmallUses,
        identities: [...s.identities, ...newIdentities],
        treats: [...s.treats, { date: today, tier: roll.tier, text: roll.text }],
        pendingFeedback: { dareId: d.id, cat: d.cat, at: Date.now() },
      };
    });

    setTreat(roll);
    setTreatFlipped(false);
    setLastProof(d.proof);
    setNewTraits(featured ? [featured] : []);
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

  /** Selecciona un Journey desde el picker → lo pone en foco y abre su pantalla.
   *  NO lo arranca: eso ocurre con "Begin Journey" (startJourney). */
  function chooseJourney(id: JourneyId) {
    patch({ journeyId: id });
    setScreen("journey");
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
  /** Plan de un destino con toggle: si ya está planeado, lo quita; si no, lo añade. */
  function togglePlanDare(dest: Dest, label: string) {
    setStore((s) => {
      const has = s.plannedDares.some((p) => p.dest === dest);
      return {
        ...s,
        plannedDares: has
          ? s.plannedDares.filter((p) => p.dest !== dest)
          : [...s.plannedDares, { id: `${dest}-${s.plannedDares.length}`, dest, label }],
      };
    });
  }

  function scheduleDate(when: string, idea?: string) {
    setStore((s) => ({
      ...s,
      dates: [...s.dates, { when, idea, journeyId: s.journeyId }],
      // "Self-Investor" se desbloquea al reservar una Date
      traits: s.traits.includes("self-investor") ? s.traits : [...s.traits, "self-investor"],
    }));
  }

  // ---- notificaciones (recordatorio diario) ----
  /** Pide permiso y activa el recordatorio si se concede. Devuelve el estado. */
  async function enableNotifications(): Promise<NotificationPermission | "unsupported"> {
    const perm = await requestNotificationPermission();
    setStore((s) => ({
      ...s,
      notifications: { ...s.notifications, enabled: perm === "granted" },
    }));
    return perm;
  }

  function disableNotifications() {
    setStore((s) => ({ ...s, notifications: { ...s.notifications, enabled: false } }));
  }

  /** Fija la hora local del recordatorio; resetea `lastShown` para permitir
      que un horario recién adelantado pueda disparar hoy mismo. */
  function setNotificationTime(hour: number, minute: number) {
    setStore((s) => ({ ...s, notifications: { ...s.notifications, hour, minute, lastShown: "" } }));
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
    activeJourneys,
    isJourneyActive,
    catFeedback,
    currentDare,
    daresToday,
    cardOptions,
    card,
    proofCount,
    dreamReward,
    currentIdentity,
    showPendingFb,
    briefing,
    notifyPermission,
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
    startJourney,
    activateJourney,
    pickCard,
    runCheckin,
    justDareMe,
    revealTodayDare,
    anotherDare,
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
    togglePlanDare,
    scheduleDate,
    enableNotifications,
    disableNotifications,
    setNotificationTime,
  };
}

export type DareApp = ReturnType<typeof useDare>;
