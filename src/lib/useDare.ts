import { useEffect, useRef, useState } from "react";
import type {
  BossPlaylist,
  Cat,
  Checkin,
  CompanionShelf,
  CompanionVibe,
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
import { JOURNEYS, MVP_JOURNEYS, journeyById, currentChapter, journeyMilestoneIds, todaysDayPlan, journeyComplete } from "../data/journeys";
import { generateDare, recentDareIds, buildWhy } from "./generator";
import { recommendJourney } from "./recommend";
import { rollTreat, sample } from "./random";
import { findDare, findCard } from "./lookup";
import { earnedTraits } from "./achievements";
import { load, save, defaultStore, clearStore } from "./storage";
import { todayStr, daysBetween } from "./date";
import { buildReminder, dueSlot } from "./briefing";
import { notificationPermission, requestNotificationPermission, showReminderNotification } from "./notify";
import { installOffer, isIOS, isInStandaloneMode, type InstallOffer } from "./install";

export type Screen =
  | "onboarding"
  | "dream"
  | "home"
  | "card"
  | "checkin"
  | "detail"
  | "timer"
  | "complete"
  | "journeyComplete"
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
  /** "¿Qué lo haría menos aburrido hoy?" — opcional (null = surprise). */
  vibe: CompanionVibe | null;
};

const emptyDraft: DraftCheckin = { energy: null, time: null, loc: null, dest: null, state: null, vibe: null };
const FB_DELAY = 30 * 60 * 1000; // 30 minutos
/** Check-in por defecto para "Just dare me" sin check-in previo:
 *  corto, de baja fricción, inmediato. */
const SAFE_CI: Checkin = { energy: 5, time: 3, loc: "home", dest: null, state: "normal" };

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

/** ¿Toca el ritual de la Daily Card al abrir la app? "Una vez al día":
 *  onboarded, aún sin carta hoy y sin haberlo resuelto (sacado/saltado) hoy.
 *  El usuario "away" no cuenta: App muestra Reentry por encima del screen. */
function shouldOpenCardIntro(s: DareStore): boolean {
  return s.onboarded && (s.dailyCard?.cardId ?? null) === null && s.cardIntroDate !== todayStr();
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
  "bright-mover",
  "regulator",
  "clear-mind",
  "returner",
  "outwalker",
  "forged",
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

/** Badges extra que otorga TERMINAR un Journey, además de su identidad final
 *  (`journey.identity.id`). Solo First Flame e Iron Quiet tienen badges de
 *  "Proof of…" propios; el resto se cierran solo con su identidad. */
function journeyCompletionExtras(journeyId: JourneyId): string[] {
  if (journeyId === "ember") return ["proof-of-fire"];
  if (journeyId === "iron") return ["proof-of-iron", "quiet-power", "builder"];
  return [];
}

export function useDare() {
  const [store, setStore] = useState<DareStore>(() => rollover(load()));
  const [screen, setScreen] = useState<Screen>(() =>
    !store.onboarded ? "onboarding" : shouldOpenCardIntro(store) ? "card" : "home",
  );
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
  /** Journey del MVP a destacar HOY según el último check-in (Today's Body Dare).
   *  Puro (recommend.ts): prioriza los activos; si no hay, sugiere uno. */
  const recommendedJourneyId = recommendJourney({
    state: store.lastCheckin?.state ?? "normal",
    energy: store.lastCheckin?.energy ?? 5,
    active: store.activeJourneyIds,
    returning: away,
  });
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

  // ---- briefing diario (SOLO recordatorio) ----
  // El briefing ya no tiene widget in-app (Today es mínimo); su contenido se
  // construye bajo demanda en el efecto del recordatorio (buildReminder).
  const notifyPermission = notificationPermission();

  // ---- Planned Dares vencidos (para surface en Today) ----
  const duePlannedDares = store.darePlans.filter(
    (p) => p.when !== "journey" && p.dueDate && p.dueDate <= today,
  );

  // Recordatorio local (dos franjas: mañana y tarde): comprueba al montar, al
  // enfocar la pestaña y cada minuto mientras la app está viva. La DECISIÓN
  // (`dueSlot`, qué franja toca) y el
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
      const slot = dueSlot(store.notifications, now, daresToday > 0);
      if (!slot) return;
      const r = buildReminder({ date: todayStr(now), doneToday: daresToday > 0 }, slot);
      showReminderNotification(r.title, r.body, url);
      const today = todayStr(now);
      // Sella SOLO la franja disparada (dedupe independiente mañana/tarde).
      setStore((s) => ({
        ...s,
        notifications: {
          ...s.notifications,
          [slot]: { ...s.notifications[slot], lastShown: today },
        },
      }));
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
    store.notifications.morning.hour,
    store.notifications.morning.minute,
    store.notifications.morning.lastShown,
    store.notifications.evening.hour,
    store.notifications.evening.minute,
    store.notifications.evening.lastShown,
    notifyPermission,
    daresToday,
  ]);

  // ---- instalación PWA (frontera con efectos) ----
  // Capturamos `beforeinstallprompt` para poder ofrecer una instalación de 1
  // toque, y detectamos si la app ya corre en standalone (instalada). La
  // DECISIÓN de qué ofrecer es PURA (`install.ts`); esto solo mueve el
  // efecto/estado del navegador, como `notify.ts` para el recordatorio.
  const installEvtRef = useRef<{ prompt: () => void; userChoice: Promise<unknown> } | null>(null);
  const [installPromptAvailable, setInstallPromptAvailable] = useState(false);
  const [standalone, setStandalone] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    const display = window.matchMedia?.("(display-mode: standalone)").matches ?? false;
    const ios = (window.navigator as unknown as { standalone?: boolean }).standalone ?? false;
    return isInStandaloneMode(display, ios);
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const onBIP = (e: Event) => {
      // Evita el mini-infobar del navegador: mostramos NUESTRO nudge.
      e.preventDefault();
      installEvtRef.current = e as unknown as { prompt: () => void; userChoice: Promise<unknown> };
      setInstallPromptAvailable(true);
    };
    const onInstalled = () => {
      installEvtRef.current = null;
      setInstallPromptAvailable(false);
      setStandalone(true);
      setStore((s) => ({ ...s, install: { ...s.install, installedAt: todayStr() } }));
    };
    window.addEventListener("beforeinstallprompt", onBIP);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBIP);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

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

  /** Pausa un Journey: sale de los activos pero CONSERVA su progreso,
   *  milestones y Dream Reward. Reanudable sin perder nada. */
  function pauseJourney(id: JourneyId) {
    setStore((s) => ({ ...s, activeJourneyIds: s.activeJourneyIds.filter((j) => j !== id) }));
  }

  /** Reanuda un Journey pausado: vuelve a los activos sin tocar su progreso.
   *  Mantiene su `journeyStartedAt` si ya existía. */
  function resumeJourney(id: JourneyId) {
    setStore((s) =>
      s.activeJourneyIds.includes(id)
        ? s
        : {
            ...s,
            activeJourneyIds: [...s.activeJourneyIds, id],
            journeyStartedAt: s.journeyStartedAt[id]
              ? s.journeyStartedAt
              : { ...s.journeyStartedAt, [id]: todayStr() },
          },
    );
  }

  /** Cancela un Journey: lo saca de activos y RESETEA su sprint — progreso a 0,
   *  sus milestones borrados, fuera de completados y sin fecha de inicio. El
   *  Dream Reward elegido se conserva (para reempezar sin re-configurar). */
  function cancelJourney(id: JourneyId) {
    const msIds = journeyMilestoneIds(journeyById(id));
    setStore((s) => {
      const milestones = { ...s.milestones };
      for (const mid of msIds) delete milestones[mid];
      const journeyStartedAt = { ...s.journeyStartedAt };
      delete journeyStartedAt[id];
      return {
        ...s,
        activeJourneyIds: s.activeJourneyIds.filter((j) => j !== id),
        journeyProgress: { ...s.journeyProgress, [id]: 0 },
        journeysCompleted: s.journeysCompleted.filter((j) => j !== id),
        milestones,
        journeyStartedAt,
      };
    });
  }

  /** Today's Body Dare de un Journey activo: lanza el Dare PRESCRITO del día
   *  que toca (plan[daysDone]) directamente al Detail. Si el día no fija un
   *  dareId concreto, cae al check-in de ese Journey. Pone el Journey en foco
   *  para que completar avance SU sprint. */
  function startJourneyDay(id: JourneyId) {
    const j = journeyById(id);
    const prog = store.journeyProgress[id] ?? 0;
    const day = todaysDayPlan(j, prog);
    patch({ journeyId: id });
    const dare = day?.dareId ? findDare(day.dareId) : null;
    if (day && dare) {
      const t = todayStr();
      setStore((s) => ({
        ...s,
        journeyId: id,
        todaysDares: [
          ...s.todaysDares.filter((e) => !(e.date === t && e.completedAt === null)),
          {
            dareId: dare.id,
            date: t,
            wild: false,
            revealed: true,
            why: `${j.name} · Day ${prog + 1}: ${day.title}. Today's action from your journey.`,
            startedAt: null,
            completedAt: null,
          },
        ],
      }));
      setScreen("detail");
    } else {
      // Sin dareId fijo (p. ej. días de recuperación abiertos) → check-in del Journey.
      setScreen("checkin");
    }
  }

  function pickCard(cardId: string) {
    // Elegir carta marca el ritual del día como resuelto (cardIntroDate) para
    // que no reaparezca al reabrir la app hoy.
    setStore((s) =>
      s.dailyCard ? { ...s, dailyCard: { ...s.dailyCard, cardId }, cardIntroDate: todayStr() } : s,
    );
    // Al elegir carta se revela a pantalla completa (screen "card"); desde el
    // recap de You se puede reabrir con setScreen("card").
    setScreen("card");
  }

  /** Salta el ritual de la Daily Card al abrir: marca el día como resuelto (no
   *  reaparece hoy) y entra a Today. La carta puede sacarse luego desde You. */
  function skipCardIntro() {
    setStore((s) => ({ ...s, cardIntroDate: todayStr() }));
    setScreen("home");
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

  /** Today "Just dare me": genera al instante (último check-in o default seguro)
   *  y lo revela INLINE en Today, sin pasar por el check-in rápido. El check-in
   *  queda como opción ("Check in first"), no como peaje diario. */
  function quickDareMe() {
    generateInto(store.lastCheckin ?? SAFE_CI, { persistCheckin: false, navigate: "home" });
  }

  /** Today "Reveal today's dare": revela el Dare de hoy INLINE (sin navegar).
   *  Solo revela un Dare ya generado que estaba oculto (p. ej. un Planned
   *  Dare). La generación fresca pasa SIEMPRE por el check-in rápido. */
  function revealTodayDare() {
    if (currentEntry && currentEntry.completedAt === null && !currentEntry.revealed) {
      patchCurrentEntry({ revealed: true });
    }
  }

  /** Marca un Dare como rechazado (no repetir pronto). */
  function rejectDare(dareId: string) {
    setStore((s) => ({
      ...s,
      rejectedDares: [...s.rejectedDares, { dareId, date: todayStr() }].slice(-40),
    }));
  }

  /** Today "Another dare": rechaza el actual y abre el check-in (el único, la
   *  pantalla completa "How are you today?") para elegir de nuevo. */
  function anotherDare() {
    if (currentEntry) rejectDare(currentEntry.dareId);
    setScreen("checkin");
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
    // Treat CONSCIENTE DEL CONTEXTO y SESGADO. Dos intenciones combinadas:
    //  - contexto: la categoría del Dare recién hecho (nada de "un café sentado"
    //    tras un paseo por el bosque) → `d.cat`.
    //  - sesgo (temptation bundling / ciencia del hábito): premia fuerte
    //    completar con poca motivación y probar una categoría nueva → `treatBoost`.
    const ci = store.lastCheckin;
    const lowMotivation = !!ci && (ci.energy <= 3 || ci.state === "blocked" || ci.state === "tired");
    const newCategory = (store.catCounts[d.cat] || 0) === 0;
    const treatBoost = (lowMotivation ? 0.5 : 0) + (newCategory ? 0.5 : 0);
    const roll = rollTreat(d.cat, treatBoost);
    const counts = { ...store.catCounts, [d.cat]: (store.catCounts[d.cat] || 0) + 1 };
    const completedBefore = todaysToday.filter((e) => e.completedAt !== null).length;
    const isFirstToday = completedBefore === 0;
    const newMomentum = isFirstToday ? store.momentum.count + 1 : store.momentum.count;
    const totalCompleted = store.completed.length + 1;
    // días distintos con al menos un Dare (para el badge Momentum Keeper)
    const distinctDays = new Set([...store.completed.map((c) => c.date), today]).size;
    // veces usada la versión de baja energía (para el badge Reset Artist)
    const newSmallUses = store.smallVersionUses + (usedSmall ? 1 : 0);

    // El progreso del Journey (índice de día) SOLO avanza si el Journey en foco
    // está activo. La COMPLETION del Journey ya NO depende de este contador: se
    // dispara al completar todos los milestones (ver completeMilestone), no al
    // llegar a 7 días. Sin Journey activo, el Dare aún cuenta para proof,
    // momentum y badges globales, pero no avanza ningún sprint.
    const journeyActive = store.activeJourneyIds.includes(store.journeyId);
    const newDaysDone = journeyActive ? daysDone + 1 : daysDone;

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

    // Un único badge "destacado" para la pantalla de completion (el más
    // importante); el resto se desbloquean en silencio y aparecen en Progress.
    // El cierre de Journey (capstone/identity) ya NO se dispara aquí: es
    // milestone-based y vive en `completeMilestone` (pantalla journeyComplete).
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
        momentum: { count: newMomentum, lastDate: today },
        lastCats: [d.cat, s.lastCats[0]].filter(Boolean).slice(0, 2) as Cat[],
        traits: [...s.traits, ...earned],
        smallVersionUses: newSmallUses,
        treats: [...s.treats, { date: today, tier: roll.tier, text: roll.text }],
        pendingFeedback: { dareId: d.id, cat: d.cat, at: Date.now() },
      };
    });

    setTreat(roll);
    setTreatFlipped(false);
    setLastProof(d.proof);
    setNewTraits(featured ? [featured] : []);
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
  /**
   * Aplica un cambio en los milestones y, si con ello algún Journey ACTIVO
   * queda con TODOS sus milestones completados por primera vez, lo marca como
   * terminado, desbloquea su Dream Reward + Badge/identidad final y dispara la
   * celebración (pantalla `journeyComplete`). La completion persiste vía
   * `journeysCompleted` (idempotente: solo se celebra una vez por Journey).
   * Los demás Journeys activos no se ven afectados.
   */
  function applyMilestones(patch: Record<string, boolean>, extra?: Partial<DareStore>) {
    const nextMilestones = { ...store.milestones, ...patch };
    // ¿Algún Journey activo acaba de completarse (y no estaba ya completado)?
    const completedId = store.activeJourneyIds.find(
      (id) => !store.journeysCompleted.includes(id) && journeyComplete(journeyById(id), nextMilestones),
    );

    if (!completedId) {
      setStore((s) => ({ ...s, ...extra, milestones: { ...s.milestones, ...patch } }));
      return;
    }

    const cj = journeyById(completedId);
    const identId = cj.identity.id;
    const newBadges = [identId, ...journeyCompletionExtras(completedId)].filter(
      (b) => !store.traits.includes(b),
    );
    const newIdentities = store.identities.includes(identId) ? [] : [identId];

    setStore((s) => ({
      ...s,
      ...extra,
      milestones: { ...s.milestones, ...patch },
      journeysCompleted: [...s.journeysCompleted, completedId],
      traits: [...s.traits, ...newBadges.filter((b) => !s.traits.includes(b))],
      identities: [...s.identities, ...newIdentities.filter((i) => !s.identities.includes(i))],
      // Enfoca el Journey recién terminado para que la celebración y las
      // pantallas siguientes muestren su Dream Reward e identidad.
      journeyId: completedId,
    }));

    setJustCompletedJourney(completedId);
    setScreen("journeyComplete");
  }

  function completeMilestone(id: string) {
    applyMilestones({ [id]: true });
  }

  function saveCompanionShelf(shelf: CompanionShelf, milestoneId?: string) {
    applyMilestones(milestoneId ? { [milestoneId]: true } : {}, { companionShelf: shelf });
  }

  function saveBossPlaylist(pl: BossPlaylist, milestoneId?: string) {
    applyMilestones(milestoneId ? { [milestoneId]: true } : {}, { bossPlaylist: pl });
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

  /** Fija la hora local de una franja (mañana/tarde); resetea su `lastShown`
      para permitir que un horario recién adelantado pueda disparar hoy mismo. */
  function setNotificationSlot(slot: "morning" | "evening", hour: number, minute: number) {
    setStore((s) => ({
      ...s,
      notifications: {
        ...s.notifications,
        [slot]: { hour, minute, lastShown: "" },
      },
    }));
  }

  // ---- instalación PWA ----
  /** Lanza el diálogo nativo de instalación (si hay `beforeinstallprompt`). */
  async function promptInstall() {
    const evt = installEvtRef.current;
    if (!evt) return;
    try {
      evt.prompt();
      await evt.userChoice;
    } catch {
      /* el usuario canceló o el navegador lo rechazó — sin ruido */
    }
    installEvtRef.current = null;
    setInstallPromptAvailable(false);
  }

  /** Descarta el nudge; se silencia una temporada (ver install.ts). */
  function dismissInstall() {
    setStore((s) => ({ ...s, install: { ...s.install, dismissedAt: todayStr() } }));
  }

  // Ofertas de instalación (decisión PURA en install.ts). El NUDGE respeta el
  // umbral (algo que perder) y el silencio tras un descarte; en AJUSTES se
  // ofrece siempre que la app NO esté ya instalada (el usuario está buscándolo).
  const installBase = {
    standalone,
    ios: typeof navigator !== "undefined" ? isIOS(navigator.userAgent) : false,
    promptAvailable: installPromptAvailable,
    today: todayStr(),
  };
  const installNudge: InstallOffer = installOffer({
    ...installBase,
    proofCount,
    activeJourneys: activeJourneys.length,
    dismissedAt: store.install.dismissedAt,
  });
  const installSettings: InstallOffer = installOffer({
    ...installBase,
    proofCount: 1,
    activeJourneys: 1,
    dismissedAt: "",
  });

  return {
    store,
    // navegación
    screen,
    setScreen,
    away,
    setAway,
    obIdx,
    setObIdx,
    // check-in draft (pantalla completa "How are you today?")
    draft,
    setDraft,
    // derivados
    journey,
    daysDone,
    chapter,
    activeJourneys,
    isJourneyActive,
    recommendedJourneyId,
    catFeedback,
    currentDare,
    daresToday,
    cardOptions,
    card,
    proofCount,
    dreamReward,
    currentIdentity,
    showPendingFb,
    notifyPermission,
    duePlannedDares,
    // instalación PWA
    installNudge,
    installSettings,
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
    journeys: MVP_JOURNEYS,
    // acciones
    completeOnboarding,
    replayOnboarding,
    setDreamReward,
    confirmDreamReward,
    startJourney,
    activateJourney,
    pauseJourney,
    resumeJourney,
    cancelJourney,
    startJourneyDay,
    pickCard,
    skipCardIntro,
    runCheckin,
    justDareMe,
    quickDareMe,
    revealTodayDare,
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
    setNotificationSlot,
    promptInstall,
    dismissInstall,
  };
}

export type DareApp = ReturnType<typeof useDare>;
