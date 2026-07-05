import { useEffect, useState } from "react";
import type {
  Avoid,
  BossPlaylist,
  Cat,
  Checkin,
  CompanionShelf,
  Dare,
  DarePlan,
  DareStore,
  Dest,
  JourneyId,
  PlanWhen,
  TarotCard,
  TreatDraw,
} from "../types";
import { DARES } from "../data/dares";
import { TAROT } from "../data/tarot";
import { TRAITS } from "../data/traits";
import { JOURNEYS, journeyById, currentChapter, SPRINT_DAYS } from "../data/journeys";
import { generateDare, recentDareIds, buildWhy } from "./generator";
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

/** Check-in RÁPIDO de Today: energía + foco (1-5) + qué se evita. Sin
 *  ningún valor por defecto seleccionado (todos null hasta que el usuario
 *  toca). Ver pantalla `QuickCheckin` en TodayDareRevealCard. */
export type QuickDraft = {
  energy: number | null;
  focus: number | null;
  avoiding: Avoid | null;
};
const emptyQuick: QuickDraft = { energy: null, focus: null, avoiding: null };

/** Convierte el check-in rápido (1-5) en un Checkin completo (contexto casa).
 *  Escala energía/foco a 1-10 y deriva el estado mental. */
function quickToCheckin(q: { energy: number; focus: number; avoiding: Avoid }): Checkin {
  const state: Checkin["state"] = q.energy <= 2 ? "tired" : q.focus <= 2 ? "blocked" : "normal";
  return {
    energy: q.energy * 2,
    time: 10,
    loc: "home",
    dest: null,
    state,
    focus: q.focus * 2,
    avoiding: q.avoiding,
  };
}

/** Fecha (YYYY-MM-DD) a partir de la cual un Planned Dare vuelve a Today.
 *  "journey" no tiene fecha (vive en el contexto del Journey). Impuro (usa
 *  Date), pero vive en la frontera useDare, no en un módulo puro. */
function dueDateFor(when: PlanWhen): string {
  const d = new Date();
  if (when === "later-today") return todayStr(d);
  if (when === "tomorrow-am" || when === "tomorrow-pm") {
    d.setDate(d.getDate() + 1);
    return todayStr(d);
  }
  if (when === "weekend") {
    // próximo sábado (o hoy si ya es sábado)
    const delta = (6 - d.getDay() + 7) % 7;
    d.setDate(d.getDate() + delta);
    return todayStr(d);
  }
  return ""; // journey
}

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
  const [quickDraft, setQuickDraft] = useState<QuickDraft>(emptyQuick);
  /** ¿Se está mostrando el check-in rápido en Today (gate de "Your Dare")? */
  const [checkingIn, setCheckingIn] = useState(false);
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
  const briefingInput: BriefingInput = { date: today, doneToday: daresToday > 0 };
  const briefing = buildBriefing(briefingInput);
  const notifyPermission = notificationPermission();

  // ---- Planned Dares vencidos (para surface en Today) ----
  const duePlannedDares = store.darePlans.filter(
    (p) => p.when !== "journey" && p.dueDate && p.dueDate <= today,
  );

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
      const r = buildReminder({ date: todayStr(now), doneToday: daresToday > 0 });
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
    // Dares rechazados recientemente ("Another dare") — se evitan un tiempo.
    const cutoff = todayStr(new Date(Date.now() - 2 * 24 * 60 * 60 * 1000));
    const rejectedIds = store.rejectedDares.filter((r) => r.date >= cutoff).map((r) => r.dareId);
    const { dare, why } = generateDare(ci, store.lastCats, catFeedback, journey, recentIds, rejectedIds);
    setUsedSmall(false);
    setCheckingIn(false);
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
   *  Solo revela un Dare ya generado que estaba oculto (p. ej. un Planned
   *  Dare). La generación fresca pasa SIEMPRE por el check-in rápido. */
  function revealTodayDare() {
    if (currentEntry && currentEntry.completedAt === null && !currentEntry.revealed) {
      patchCurrentEntry({ revealed: true });
    }
  }

  /** Today "Your Dare": abre el check-in rápido (gate previo a generar). */
  function startQuickCheckin() {
    setQuickDraft(emptyQuick);
    setCheckingIn(true);
  }

  function cancelQuickCheckin() {
    setCheckingIn(false);
    setQuickDraft(emptyQuick);
  }

  /** Genera el Dare a partir del check-in rápido y lo revela inline en Today. */
  function runQuickCheckin(q: { energy: number; focus: number; avoiding: Avoid }) {
    const ci = quickToCheckin(q);
    generateInto(ci, { persistCheckin: true, navigate: "home" });
  }

  /** Marca un Dare como rechazado (no repetir pronto). */
  function rejectDare(dareId: string) {
    setStore((s) => ({
      ...s,
      rejectedDares: [...s.rejectedDares, { dareId, date: todayStr() }].slice(-40),
    }));
  }

  /** Today "Another dare": rechaza el actual y vuelve al check-in rápido para
   *  elegir de nuevo (variedad guiada por el estado). */
  function anotherDare() {
    if (currentEntry) rejectDare(currentEntry.dareId);
    startQuickCheckin();
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

  // ---- Planned Dares (v5): apartar un Dare concreto para más tarde ----
  /** Aparta el Dare `dareId` para el momento `when`. Guarda referencia (id),
   *  no copia; el resto se re-resuelve al iniciarlo. */
  function planDare(dareId: string, when: PlanWhen, label: string) {
    setStore((s) => ({
      ...s,
      darePlans: [
        ...s.darePlans,
        {
          id: `${dareId}-${when}-${s.darePlans.length}`,
          dareId,
          when,
          dueDate: dueDateFor(when),
          label,
          createdAt: todayStr(),
        },
      ],
    }));
  }

  function removeDarePlan(id: string) {
    setStore((s) => ({ ...s, darePlans: s.darePlans.filter((p) => p.id !== id) }));
  }

  /** "Plan for later" desde la pantalla del Dare: aparta el Dare ACTUAL para
   *  el momento elegido, lo quita de hoy (para que Today vuelva al check-in) y
   *  regresa a Today. */
  function planCurrentForLater(when: PlanWhen) {
    if (!currentDare) return;
    const d = currentDare.dare;
    planDare(d.id, when, d.title);
    setStore((s) => ({
      ...s,
      todaysDares: s.todaysDares.filter((e) => !(e.date === todayStr() && e.completedAt === null)),
    }));
    setScreen("home");
  }

  /** Retoma un Planned Dare: lo pone como Dare de hoy (revelado), lo quita de
   *  la lista y abre el detalle. Completarlo cuenta como cualquier otro Dare. */
  function startPlannedDare(plan: DarePlan) {
    const dare = findDare(plan.dareId);
    if (!dare) {
      removeDarePlan(plan.id);
      return;
    }
    setStore((s) => ({
      ...s,
      darePlans: s.darePlans.filter((p) => p.id !== plan.id),
      todaysDares: [
        ...s.todaysDares.filter((e) => !(e.date === todayStr() && e.completedAt === null)),
        {
          dareId: dare.id,
          date: todayStr(),
          wild: !!dare.wild,
          revealed: true,
          why: buildWhy(store.lastCheckin ?? SAFE_CI, dare),
          startedAt: null,
          completedAt: null,
        },
      ],
    }));
    setScreen("detail");
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
    // check-in draft (completo) + check-in rápido de Today
    draft,
    setDraft,
    quickDraft,
    setQuickDraft,
    checkingIn,
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
    duePlannedDares,
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
    startQuickCheckin,
    cancelQuickCheckin,
    runQuickCheckin,
    rejectDare,
    anotherDare,
    planDare,
    planCurrentForLater,
    removeDarePlan,
    startPlannedDare,
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
