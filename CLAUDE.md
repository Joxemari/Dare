# CLAUDE.md — DARE

DARE (Daily Actions. Real Energy.) es una app de activación de energía: un reto
("dare") al día, elegido por ti. Frontend SPA sin backend (todavía). La UI está
en inglés; el **vocabulario de dominio y toda la documentación de desarrollo
—commits, PRs, este fichero— van en español**.

Este documento describe la **arquitectura** (dónde vive la lógica y por qué),
además de la operativa de desarrollo. No es solo una lista de comandos.

---

## Stack

- **Vite 6 + React 18 + TypeScript** (SPA).
- **Tailwind CSS v4** vía `@tailwindcss/vite`; los tokens viven en `src/index.css`.
- **Vitest** para los tests.
- Fuentes autoalojadas con `@fontsource` (Cormorant Garamond + Space Grotesk); sin CDN de Google.
- Persistencia en **`localStorage`**, esquema versionado (v4) con migración.
- **PWA instalable** sin dependencias extra (manifest estático + service worker
  a mano); offline y "añadir a inicio". Ver sección *PWA* más abajo.
- Sin router: las pantallas son estado, no rutas.
- Node **22**, gestor **npm** (hay `package-lock.json` → en CI se usa `npm ci`).

## Comandos (los reales de Dare)

```bash
npm install         # instalar dependencias (usa package-lock.json)
npm run dev         # servidor de desarrollo (Vite). Viewport de referencia: 390px (móvil)

npm test            # tests unitarios una vez (vitest run) — lo que corre la CI
npm run test:watch  # tests en modo watch durante el desarrollo
npm run test:e2e    # smoke E2E (Playwright) — NO forma parte de `npm test`/CI
npm run typecheck   # tsc -b --noEmit (chequeo de tipos sin emitir)

npm run build       # tsc -b && vite build  → genera dist/
npm run preview     # sirve el build de producción en local
```

> **E2E (Playwright).** `e2e/core-loop.spec.ts` recorre el loop real en un
> navegador (onboarding → dream → check-in → reveal → timer → completion →
> journey/milestones → tabs) y falla ante cualquier error de página. Es
> **opt-in**: necesita navegador (`npx playwright install chromium`) y arranca el
> dev server, por eso NO está en `npm test` ni en el check "Tests y build". Corre
> en PRs en un workflow aparte (`.github/workflows/e2e.yml`). En entornos con un
> Chromium ya provisto, apúntalo con `PLAYWRIGHT_CHROMIUM=/ruta/chrome`. El
> `tsc -b` del build no compila `e2e/` (el `tsconfig.app.json` solo incluye `src`).

---

## Arquitectura — dónde vive la lógica y por qué

La regla es simple: **la lógica de negocio vive en módulos puros y testeables;
los componentes de UI son presentacionales.** El estado y los efectos se
concentran en la frontera (hook + `storage`), no repartidos por las pantallas.

```
src/
  data/        Datos de dominio (constantes, sin lógica): dares, wildcards,
               modes (MovementMode + CAT_MODE: capa de "tipo de movimiento"
               sobre las categorías), journeys (planes de 7 días + milestones
               tipados; MVP_JOURNEY_IDS marca los 4 ofrecibles), tarot,
               symbols (mapa central de glifos), science (biblioteca),
               traits (BADGES: hitos difíciles; persisten bajo la clave
               `traits` del store), rewards (treats/dates/dream,
               antes draws), icons, colors.
  lib/         Lógica. La mayoría son funciones PURAS y deterministas:
                 generator.ts     selección del dare (scoring, no if/else),
                                  con contexto+destino del check-in
                 achievements.ts  earnedTraits() — qué traits gana un dare
                 prng.ts          PRNG con semilla (mulberry32), reproducible
                 random.ts        sample() y rollTreat() (usan Math.random)
                 date.ts          helpers de fecha local (todayStr, daysBetween)
                 lookup.ts        búsquedas sobre los datos (findDare, findCard)
                 contentSchema.ts validateDare(): reglas duras del contenido
                                  (schema, rangos, ids aditivos, ejercicios y
                                  vocabulario prohibidos). Red del pipeline
                                  de contenido generativo.
                 generationInput.ts  buildGenerationInput(): resume el store en
                                  la señal de feedback que alimenta la generación
                 recommend.ts     recommendJourney(): qué Journey del MVP
                                  destacar HOY en Today según el check-in
                                  (estado+energía). Puro, prioriza los activos
                 share.ts         capa social: texto/payload PUROS para compartir
                                  la Daily Card vía Web Share API (ver más abajo)
                 briefing.ts      "lectura del día" estilo Co-Star: contenido del
                                  widget Y del recordatorio (buildBriefing/
                                  buildReminder) + reminderDue(). Puro, seeded por
                                  fecha (ver más abajo)
               Frontera con efectos (I/O), aisladas a propósito:
                 storage.ts    load/save/migrate sobre localStorage (v4)
                 useDare.ts    hook de React: estado de la app + orquestación
                 feedback.ts   vibración (navigator.vibrate) + sonido sintetizado
                               (Web Audio, sin assets). Impuro; no se testea.
                 notify.ts     recordatorio local: permiso + showNotification vía
                               service worker. Impuro; no se testea.
  components/  Presentacionales: Ico, TarotArt, Dots, Nav, Meta, Effects,
               MilestoneModal, ShareCardButton, Briefing, layout; y los de
               Today: AtmosphereHero, TodayDareRevealCard, ActiveJourneyList.
  screens/     Pantallas (Onboarding, Dream, Reentry, Home, Card, Checkin,
               Detail, Timer, Complete, Journey, Journeys, Progress, You).
               Consumen el hook.
  App.tsx      "Router" por estado: decide qué pantalla mostrar.
```

### Today — ritual diario mínimo (no dashboard)

La pestaña Today (`screens/Home.tsx`) es deliberadamente MÍNIMA: header
(icono carta · TODAY · perfil), un `AtmosphereHero` (atmósfera diaria: símbolo
de línea + textos, modular por props para variar por estado/journey), un
`TodayDareRevealCard` (un Dare oculto que se **revela inline de un toque**, sin
navegar; estados cerrado/revelado/completado), y `ActiveJourneyList` (filas
compactas: símbolo + próxima acción + Start, que abre la pestaña Journey). Con
**varios Journeys activos**, Today prioriza el "Today's Body Dare": sube y
marca (`· today`) el Journey recomendado por el check-in (`recommendJourney` en
`lib/recommend.ts`: energía baja → Still Water, con ganas → Iron Quiet, atascado
→ Wild Ground, con energía alta → Bright Pulse, overwhelmed → Still Water,
returning → el activo más suave). Bajo
el hero se mantiene el widget `Briefing` (la "lectura del día" estilo Co-Star,
parte de la atmósfera diaria). NO muestra proofs, métricas ni calendario — eso
vive en Progress. El **ritual de
la carta del día** (tarot) se movió FUERA de Today: vive en la pantalla `Card`
(elegir 1 de 3 → revelado a pantalla completa), accesible desde el icono
izquierdo del header. `revealTodayDare`/`anotherDare` en el hook generan el
Dare y lo revelan sin salir de Today; el check-in completo ("Get my Dare")
sigue accesible desde un link discreto y abre el Detail.

### Contenido generativo (pipeline de PRs, no runtime)

El contenido nuevo (Dares) se **propone en el pipeline**, no en el navegador:
`scripts/generate-content.mjs` (workflow semanal `content.yml`) redacta
propuestas en `src/data/_proposed/week-<AAAA-Www>.ts`, que pasan por la MISMA
compuerta que el corpus vivo — `validateDare` vía `npm test` — antes de abrir una
PR para tu validación humana. La generación es **aditiva** (ids nuevos, nunca
mutar/borrar los existentes: romperia las referencias guardadas). El feedback del
usuario (`buildGenerationInput`) alimenta el prompt. Detalle completo en
`docs/content-pipeline.md`.

### Vocabulario del producto (UI en inglés)

DARE no es un tracker de fitness: es un *Chief Energy Officer*. El vocabulario de
producto NO usa gamificación clásica. Traducciones fijas (interno → UI):
**Proof** (no XP) · **Identity** (no Levels) · **Badges** (hitos con
significado, no premios por cada acción; en el store persisten bajo la clave
`traits` por compatibilidad) · **Treat Draw** (no Reward Draw) ·
**Companion** (recompensa durante el dare) · **Milestones** (no Marks) ·
**Momentum** (no flexible streak). Los Badges se ganan raramente: la mayoría de
Dares NO desbloquean ninguno, y la completion muestra COMO MUCHO uno (el más
importante; el resto quedan en Progress). Dos vías, sin spam: **capstone** —
al terminar un Journey se otorga UN badge deliberado (su `identity`: First
Mover, Quiet Builder…), con reveal premium (`.badge-reveal`) en la completion;
y **badges por umbral** (`achievements.ts`) que caen por hitos acumulados
(3 del mismo tipo, 3 días distintos, un Strong…), nunca por cada Dare. Así un
Journey deja más de un badge sin premiar cada acción. No mostrar XP,
niveles, "streak failed", calorías ni "burn". El sistema de recompensas está
separado a propósito: *Trigger* (antes) · *Companion* (durante) · *Treat*
(después) · *Date* (semanal) · *Dream Reward* (al terminar el Journey).

### Símbolos (`src/data/symbols.ts`)

Mapa único `SYMBOLS` (design tokens tipográficos). **Nunca** usar un glifo suelto
en la UI: siempre por su clave. Cada Journey tiene un símbolo primario, cada
Chapter uno secundario, cada sección del detalle y cada Trait usan claves del
mapa. Nunca mostrar dorado/oro sin explicarlo con etiqueta (Days Ahead usa
símbolo + label, nunca color a secas).

### Journeys — sprints de 7 días

Cada Journey es un sprint de 7 días con un `plan` (día 1..7) y 4 chapters, cada
chapter con `days:[from,to]` y `milestones` tipados de **id estable**. Tipos de
milestone: `letter/goal/action/motivator/science/proof/reflection/badge`. Los
milestones son accionables (modal `MilestoneModal`): cada tipo tiene su CTA real
y persiste en `store.milestones`.

**MVP: 4 Journeys ofrecibles** — DARE es **physical-energy-first**: el objetivo
es ayudar a construir el hábito de moverse (fuerza, cardio, aire libre,
recuperación) sin aburrimiento. El picker (`Journeys.tsx`) y la lista de Today
solo ofrecen estos 4 (`MVP_JOURNEY_IDS = ["iron","pulse","wild","water"]`):

- **Iron Quiet △** (`iron`) — fuerza: mancuernas, kettlebell, carries. Sin gym.
- **Bright Pulse ◆** (`pulse`) — cardio divertido: fitboxing, shadowboxing,
  standing tabata, dance cardio, sesiones cortas y sudadas. **Journey nuevo.**
- **Wild Ground ↟** (`wild`) — fuera: caminar, luz, bosque, rutas, colinas,
  escaleras, microaventuras.
- **Still Water ☾** (`water`) — recuperación: piscina, movilidad suave,
  respiración, apagado de la noche.

Cada Journey tiene símbolo, color propio (`JOURNEY_COLOR`) y Badge final
(`identity`, 1 por Journey; su id existe también como Trait para el render del
anillo). El de Bright Pulse es **Bright Mover** (`bright-mover`).

**Roadmap (en datos, NO empezables).** Los otros 4 del set histórico se
conservan en `JOURNEYS` (`ROADMAP_JOURNEYS`) como conceptos de roadmap y para no
romper el progreso guardado: **First Flame ✦** (`ember`, hoy concepto de
onboarding/primera activación), **Clear Signal ◇** (`clear`, foco),
**Steady Current ⌁** (`current`, consistencia), **Quiet Fire ⟁** (`fire`,
coraje). En el picker aparecen al final como **"Coming soon"**: solo un preview
(nombre, tag, promesa y la estructura de capítulos), sin CTA — no se pueden
empezar. Los ids internos `ember/iron/water` se conservan (no romper datos
guardados). Al reintroducir uno, basta con añadir su id a `MVP_JOURNEY_IDS`.

**Contenido de los Journeys del MVP** — estándar de calidad (aplicado a los 4):
las *letters* citan trabajos y autores concretos (BJ Fogg, Wendy Wood, Katy
Milkman, James Clear, Bandura, Tabata, Gibala, Karageorghis, Kelly McGonigal,
Stuart Brown, los Kaplan, Qing Li, Oppezzo, Keltner, Benson, el trial de
cyclic sighing de Stanford 2023, Wallace J. Nichols, Cal Newport, Masicampo &
Baumeister, Matthew Walker…); cada capítulo incluye *setup actions* que cambian
conducta (pesos a la vista, mínimo de dos reps, temptation bundle, lift log,
anclar el hueco diario, three-song ladder, invitar a alguien, agendar el agua,
shutdown shelf…); la ciencia va con referencias pero lenguaje prudente ("is
associated with", "may support"); y los *proofs* son específicos, nunca de
relleno. La biblioteca (`science.ts`) tiene fichas reutilizables para esto
(habit-automaticity, temptation-bundling, progressive-overload, grip-longevity,
exercise-snacks, awe-walks, cyclic-sighing, shutdown-ritual, blue-mind…).

**Modos de movimiento** (`src/data/modes.ts`): `MovementMode` (Strong · Sweaty ·
Outside · Water · Recovery · Soft · Play · Social · Travel) es una capa por
encima de las categorías (`CAT_MODE`). Regla **anti-aburrimiento**: el generador
penaliza repetir el mismo MODO más de dos veces seguidas (además de la
penalización por `Cat`). Cada Journey rota modos, companions y treats a lo largo
de sus 7 días para no sentirse repetitivo.

**Ejercicios permitidos/prohibidos.** Nunca: push-ups, planks, burpees, mountain
climbers, trabajo de suelo con manos apoyadas, HIIT largo, lenguaje de calorías/
peso/vergüenza (lo refuerza `contentSchema` + `data.test.ts`). Permitido:
mancuernas, kettlebells, bandas, carries, sentadillas goblet, zancadas, press,
remo, curls, shadowboxing, fitboxing, padel, natación, caminar, colinas,
escaleras, dance cardio, movilidad de pie.

**Variantes de dificultad por día** (`DayPlan`): `soft` (◌ baja energía),
`dare`/`real` (◆ recomendada), `bold` (⟁ más dura), más `trigger`, `companion`,
`treat`, `proof` y una ficha corta `scienceTitle`/`scienceBody` ("Science Behind
Today's Dare"). La ciencia usa lenguaje cuidadoso ("may support", "is associated
with", "research suggests"); sin claims médicos. El helper puro `dayVariants(p)`
(orden ◌→◆→⟁, "real" cae a `dare`) alimenta la UI.

**Briefing de día** (`DayModal`): en la pantalla Journey, tocar un día hecho o el
actual abre su plan — selector ◌/◆/⟁ (efímero, por defecto Real), Trigger,
Companion, Treat, Proof y la ficha de ciencia. Los días futuros siguen sellados
(no accionables). El timeline usa "Day N" (no Today/Tomorrow).

**Arranque explícito y multi-journey.** Ningún Journey arranca solo: el
onboarding lleva a Today sin activar nada. Un Journey se empieza pulsando
"Begin Journey" en la pestaña Journey (`startJourney` → si falta Dream Reward,
su setup primero). Pueden estar **varios activos a la vez**
(`store.activeJourneyIds`): arrancar uno no detiene otro. El progreso/completion
de un Journey solo cuenta si está activo.

**Ciclo de vida: launch · pause · resume · cancel** (acciones del hook). *Begin*
activa (`activateJourney`, sella `journeyStartedAt`). *Pause* (`pauseJourney`)
lo saca de `activeJourneyIds` pero **conserva** progreso, milestones y Dream
Reward → reanudable. *Resume* (`resumeJourney`) lo devuelve a activos sin tocar
nada. *Cancel* (`cancelJourney`) **resetea el sprint**: progreso a 0, borra los
milestones del Journey (`journeyMilestoneIds`), lo saca de completados y borra
`journeyStartedAt` (conserva el Dream Reward). "Pausado" se distingue de "sin
empezar" por la presencia de `journeyStartedAt`. Los controles viven en la
pantalla Journey (Pause/Cancel activo; Resume/Cancel pausado, con confirmación
inline para cancelar); el picker muestra el estado ("Paused · Day N of 7").

**Today's plan (acción prescrita del día).** Con Journeys activos, Today lista
para cada uno la **acción de HOY** del plan (`todaysDayPlan(j, daysDone)` →
`plan[daysDone]`, o null si el sprint está completo): "Day N · título" + un botón
que lanza el Dare prescrito de ese día directamente al Detail
(`startJourneyDay`, pone el Journey en foco para que completar avance SU sprint;
si el día no fija `dareId`, cae al check-in). Así se ve de un vistazo qué toca
hoy de cada Journey en marcha (p. ej. fuerza de Iron Quiet + respiración de Still
Water). Con más de uno, sube y marca (`· today`) el recomendado por el check-in
("choose your lane").

**Capítulos por COMPLETADO, no por calendario** (`chapterState` /
`unlockedChapterCount` / `currentChapter` en `journeys.ts`): el capítulo I nace
desbloqueado; el N+1 se desbloquea en cuanto TODOS los milestones del N están
hechos, aunque sea el mismo día. La línea de tiempo de la pantalla Journey usa
etiquetas de SECUENCIA (**Day 1..Day 7**), no de calendario; la fila semanal de
Progress (Today/Tomorrow/…) sí es de calendario.

Por qué así:

- **`src/lib` puro = testeable sin DOM.** Los tests corren en entorno `node`
  (ver `vitest.config.ts`), sin jsdom, y son rápidos y deterministas.
- **`src/data` sin lógica.** Cambiar contenido (retos, recompensas…) no toca
  código; añadir lógica sobre esos datos va siempre en `src/lib`.
- **Efectos en la frontera.** `storage.ts` es el único que habla con
  `localStorage`; `useDare.ts` es el único que mantiene estado de React. Así el
  resto se testea como funciones.

### Arte de las cartas (arcanos mayores)

Las **22 cartas del tarot** se sirven como **WebP estático** desde
`public/arcana/`, un fichero por carta nombrado **exactamente igual que su `id`**
en `src/data/tarot.ts` (p. ej. `fool.webp`, `priestess.webp`, `wheel.webp`). El
componente `TarotArt` resuelve la URL como
`` `${import.meta.env.BASE_URL}arcana/${id}.webp` `` (respeta el `base: '/Dare/'`)
y **cae a una marca ✦** si el fichero falta, para no romper el layout. Los
nombres van en **minúscula, una palabra, sin espacios** (la ruta de Pages
distingue mayúsculas); `src/data/tarot.test.ts` verifica que los `id` cumplen esa
forma. Los WebP están redimensionados a **800px de ancho, calidad 82** (se
muestran a 54–88px); ver `public/arcana/README.md` para regenerarlos desde PNG
con `sharp`. Añadir una carta = añadir su entrada en `tarot.ts` **y** su WebP en
`public/arcana/` con el mismo `id`.

### Capa social — compartir la Daily Card

Primera pieza social de DARE, **sin backend**: la pantalla `Card` (revelado de la
Daily Card a pantalla completa) ofrece **"Share card"**. Reparto según la regla
del repo (lógica pura vs. efectos en la frontera):

- **`src/lib/share.ts`** — PURO y testeado (`share.test.ts`): `buildCardShareText`
  y `buildCardShareData` construyen el texto/payload. Sin efectos.
- **`src/components/ShareCardButton.tsx`** — frontera con el DOM: compone la carta
  en `<canvas>` (PNG 1080×1350) reutilizando el WebP de `public/arcana/`, la
  entrega a la **Web Share API** (WhatsApp, IG Stories…) y **cae a copiar al
  portapapeles** si no hay `navigator.share`. Efecto DOM → no se testea en `node`,
  como `TarotArt`. Defensivo: si el canvas o el share fallan, degrada a texto.
- **`src/screens/Card.tsx`** monta el botón; su contenedor hace `stopPropagation`
  para que pulsar Share no dispare el "tap to continue" de la pantalla.

El feed de amigos (BeReal / How We Feel) queda **diferido**: exige backend +
identidad. El diseño completo y el modelo de datos a preparar están en
`docs/social-layer.md` (principio de producto: *presencia, no ranking* — no
romper el tono anti-gamificación).

### Briefing diario + recordatorio (estilo Co-Star)

Una **"lectura del día"** —titular poético + líneas de estado + un empujón
concreto— que sirve DE FORMA COMPARTIDA a dos superficies: el **widget in-app**
(tarjeta en Home) y el **recordatorio local** (notificación). Reparto según la
regla del repo (lógica pura vs. efectos en la frontera):

- **`src/lib/briefing.ts`** — PURO y testeado (`briefing.test.ts`).
  `buildBriefing()` construye la lectura; `buildReminder()` deriva el título/cuerpo
  de la notificación; `reminderDue()` decide (recibiendo `now`) si toca avisar.
  La variedad se elige con un **PRNG sembrado por la FECHA** (`mulberry32`), así el
  briefing es **estable dentro del día** y cambia cada día (y los tests son
  reproducibles). Respeta el vocabulario del producto: un test *guard* prohíbe
  XP/level/streak/badge/calorie/burn.
- **`src/lib/notify.ts`** — frontera con efectos (impura, no testeada, como
  `feedback.ts`): permiso (`Notification`), y `showReminderNotification()` vía
  `serviceWorker.ready.showNotification` (fallback a `new Notification`). El clic
  lo maneja `public/sw.js` (`notificationclick` → enfoca/abre la app).
- **`src/lib/useDare.ts`** — orquesta: expone el `briefing` derivado, las acciones
  (`enableNotifications`/`disableNotifications`/`setNotificationTime`) y un efecto
  que comprueba `reminderDue` al montar, al enfocar la pestaña y **cada minuto
  mientras la app está viva**; al disparar, sella `notifications.lastShown` (dedupe
  diario).
- **`src/components/Briefing.tsx`** (widget presentacional, en Home) y la sección
  **"Daily reminder"** de `src/screens/You.tsx` (toggle + hora + estado del permiso).

**Límite honesto (sin backend):** es un recordatorio **LOCAL**, fiable mientras la
pestaña vive. El **push con la app cerrada** exige servidor push + VAPID → queda
**diferido** a cuando DARE tenga backend. Igual, los **widgets nativos** de
pantalla de inicio no existen para una PWA; por eso el "widget" es la tarjeta
in-app. Las preferencias viven en `store.notifications` (ver *Datos persistidos*).

### PWA (instalable + offline)

DARE es una PWA instalable hecha **sin dependencias** (nada de `vite-plugin-pwa`):
manifest estático, service worker a mano y unas etiquetas en `<head>`. Piezas:

- **`public/manifest.webmanifest`** — `display: standalone`, tema `#111`, iconos.
  Rutas **relativas** (`start_url`/`scope`/iconos), así resuelven contra `/Dare/`
  sin hardcodear el base. Vite antepone `base` a las rutas `/…` de `index.html`,
  pero NO al contenido del manifest (fichero estático) → por eso van relativas.
- **`public/sw.js`** — estrategia elegida a propósito para iterar durante un test:
  **network-first en navegación** (online sirve siempre el último deploy → los que
  instalen NO se clavan en una versión vieja) y **cache-first en assets hasheados**
  (inmutables por hash de contenido → rápido y offline tras la primera carga). El
  `CACHE` lleva versión (`dare-v2`); al activar purga las viejas — **súbela si
  cambias la estrategia o el shell**. El `BASE` se deriva del scope del SW, no del
  literal `/Dare/`. También maneja `notificationclick` (recordatorio diario →
  enfoca/abre la app; ver *Briefing diario*).
- **`public/icons/`** — iconos derivados del glifo sparkle de `favicon.svg`
  (`192`, `512`, `512-maskable`, `apple-touch-180`). Se generan con el Chromium de
  Playwright; ver `public/icons/README.md`.
- **Registro solo en producción** (`src/main.tsx`, guard `import.meta.env.PROD`),
  para no cachear el dev server ni interferir con el e2e de Playwright.

Por qué importa para el producto: en **iOS**, añadir a inicio corre en standalone y
da **almacenamiento duradero**; sin instalar, Safari puede desalojar el
`localStorage` a los ~7 días de inactividad y borrar el progreso del Journey.
`src/pwa.test.ts` verifica que el manifest parsea, que cada icono existe en disco y
que `index.html` enlaza manifest + apple-touch-icon.

### Datos persistidos (`localStorage`)

- **Qué se guarda vs. qué se recalcula:** se persiste el *estado* del usuario
  (onboarding, journey en foco + `activeJourneyIds` + `journeyStartedAt`,
  progreso por journey, journeys completados, dream rewards, check-ins, dares
  del día, daily card, proof library, momentum, badges (clave `traits`),
  `smallVersionUses`, identidades, milestones, companion shelf, boss playlist,
  planned dares, dates, historial de treats, feedback y las preferencias de
  notificación). Lo *derivable* (p. ej. el scoring de un dare, el nº de proofs,
  la identidad actual, el capítulo desbloqueado, **el briefing del día**) se
  recalcula, no se guarda.
- **Guarda referencias, no copias.** Persiste **identificadores** (p. ej. el `id`
  del dare o de la carta) y re-resuelve el resto contra la fuente viva (`src/data`
  vía `lookup.ts`) al leer. Así, cambiar el contenido de un dato no rompe los
  datos antiguos guardados. Copiar el objeto entero dentro del store obliga a
  migrar en cuanto cambie su forma.
- **Versionado de la forma + migración:** el store lleva `version` (hoy `4`) bajo
  la clave `dare:v4`. `storage.ts` migra cualquier forma antigua/desconocida a v4
  mergeando sobre `defaultStore()` (ver `migrate()`), de modo que un campo que un
  build viejo nunca escribió recibe un valor por defecto. v2→v3 renombra el
  vocabulario del prototipo al de producto (streak→momentum, rewardDraws→treats,
  tarot→dailyCard) y **descarta** `xp`/`badges` v2 (no mapean 1:1). v3→v4 añade el
  modelo multi-journey y el recordatorio diario: como un store v3 nunca tuvo
  `activeJourneyIds`, se **deriva** (cualquier Journey con progreso > 0 o
  completado se marca activo), así un usuario existente no pierde su Journey en
  curso; y `notifications` recibe su valor por defecto al mergear. La migración es
  **idempotente**: aplicarla a un store ya v4 lo deja igual. Si cambia la forma,
  **hay que subir la versión y ampliar la migración en la misma PR.**
- **Defensivo ante datos corruptos:** si el JSON no parsea, se arranca limpio con
  `defaultStore()` en vez de romper.

---

## Workflow

- **Una PR nueva por cada modificación**, en su propia rama desde `main`, con su
  PR dedicado. **Nunca** reutilizar ni añadir commits a una PR ya
  mergeada/cerrada: si hay que retomar algo, es un cambio nuevo → **rama nueva
  desde el último `main`**.
- **PRs pequeñas y de un solo tema.** Una PR = una cosa. Si tocas dos asuntos
  independientes, sepáralos en dos PRs o avísalo explícitamente en el cuerpo.
  Enfocadas = review más fácil y **revert limpio** si algo sale mal.
- **Commits claros y descriptivos.** Los commits, las PRs y el vocabulario de
  dominio van **en español**. La **UI de Dare está en inglés**: los strings de
  interfaz que añadas van en inglés y consistentes con los existentes.

## Testing y "check verde"

- La **lógica de negocio vive en módulos puros y sin efectos secundarios**
  (`src/lib`, salvo la frontera `storage.ts`/`useDare.ts`) y **esos módulos se
  testean**; los **componentes de UI son presentacionales**. "Lógica" aquí es
  todo lo que transforma o decide: transformaciones de estado, validación,
  serialización/migración, scoring y cálculos.
- **Mantén puras las funciones testeadas** — sin efectos secundarios. Los tests
  dependen de ello; si una función necesita I/O, mueve el I/O a la frontera
  (`storage.ts`/`useDare.ts`) y deja pura la parte que decide.
- **Tests colocados junto al código** (`*.test.ts`, ver `src/lib/*.test.ts`).
  **Todo cambio de lógica lleva su test**, y se menciona en la PR.
- **Antes de abrir la PR, en local:** dejar en verde
  ```bash
  npm test          # + npm run typecheck si tocaste tipos
  npm run build
  ```
  y **documentar el resultado en el cuerpo de la PR** (nº de tests en verde +
  build OK). Es lo mismo que exige la CI (`.github/workflows/ci.yml`).
- Entorno de test: `node` (ver `vitest.config.ts`). Para testear `storage.ts`
  (localStorage) o componentes haría falta `jsdom` — cambiarlo entonces, no antes.

## Cómo documentar las Pull Requests (en español)

Explica **QUÉ** cambia, **POR QUÉ** y **CÓMO se ha verificado**, no solo el qué.
Usa las secciones que convengan (no todas en cada PR):

- `## Qué / Qué cambia`
- `## Problema / Contexto`
- `## Detalle / Solución` — fichero a fichero, explicando las decisiones no obvias
- `## Cambios`
- `## Tests / Verificación`
- `## Cómo usarlo`
- `## Notas / Pendiente`

Principios:

- Encabezados con `##`; código, rutas y comandos en `` `código` ``.
- Explica el **porqué** de las decisiones raras.
- **Honestidad total** sobre lo NO verificado y lo pendiente: nunca decir que
  algo está probado si no se ha ejecutado; separar lo que es **código** de lo que
  es **acción manual pendiente**.
- Nada de truncamientos silenciosos.

## Documentación y decisiones

- Documenta las decisiones raras **en el propio código** (comentario), no solo en
  la PR. Ejemplos ya presentes: `base: '/Dare/'` en `vite.config.ts`, la
  migración en `storage.ts`, por qué `vitest.config.ts` está separado de
  `vite.config.ts`.
- Este `CLAUDE.md` describe la **arquitectura**, no solo comandos.

## CLAUDE.md vivo — MANTENERLO ACTUALIZADO

Requisito permanente: este fichero evoluciona con el repo. **Cada vez que un
cambio altere la arquitectura, los comandos, la estructura de carpetas o las
convenciones, actualiza este `CLAUDE.md` en la MISMA PR** que introduce el
cambio.

En particular, **cuando se añada el BACKEND** (Dare aún no lo tiene, pero lo
tendrá), documenta en su momento:

- su **stack y comandos**;
- la **operativa de despliegue**;
- **qué garantiza la CI**;
- y las **reglas de datos persistidos**: qué se guarda vs. qué se recalcula,
  **versionado de la forma de los datos + migración** cuando cambie, e
  **idempotencia** de cualquier proceso de arranque/migración.

> Nota: Dare **no tiene nada que ver con Odoo**; no arrastres integraciones de
> otros proyectos.

---

## CI/CD

- **`.github/workflows/ci.yml`** — corre `npm ci`, `npm test` y `npm run build` en
  cada **pull request** y en cada **push a `main`**. Es la base para marcarlo como
  *required status check* sobre `main`. **Acción manual pendiente** (no la hace el
  workflow): en `Settings → Branches → Branch protection` sobre `main`, activar
  *Require status checks to pass* y marcar el check **"Tests y build"**. Hasta
  entonces la CI informa, pero no bloquea el merge en rojo.
- **`.github/workflows/deploy.yml`** — en cada push a `main`, build y publicación
  en **GitHub Pages** (<https://joxemari.github.io/Dare/>). `vite.config.ts` fija
  `base: '/Dare/'` para que los assets resuelvan bajo `/Dare/` (debe coincidir
  EXACTAMENTE con el nombre del repo `Dare`: la ruta de Pages distingue mayúsculas;
  un rename a `dare` no es posible porque GitHub trata ambos nombres como iguales).
- **`.github/workflows/content.yml`** — semanal (lunes) + `workflow_dispatch`.
  Genera propuestas de Dares (`scripts/generate-content.mjs`), las valida con
  `npm test`/`typecheck` (misma compuerta que la CI) y abre una PR para tu
  revisión. Usa `secrets.ANTHROPIC_API_KEY` si está; si no, stub determinista.
  Ver `docs/content-pipeline.md`.
