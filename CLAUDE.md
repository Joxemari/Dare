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
- Persistencia en **`localStorage`**, esquema versionado (v7) con migración.
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
               `traits` del store), rewards (treats etiquetados por
               contexto — `fits`/`avoid` por categoría —, dates, dream;
               antes draws), companions (catálogo de companions +
               config de vibes; temptation bundling), briefings (biblioteca
               de "Today's Briefing": consejos inspirados en personas
               conocidas + hábito real), icons, colors.
  lib/         Lógica. La mayoría son funciones PURAS y deterministas:
                 generator.ts     selección del dare (scoring, no if/else),
                                  con contexto+destino del check-in completo
                                  + evitar rechazados. Aún soporta foco/avoiding
                                  en el scoring, hoy sin UI que los alimente.
                                  generateJourneyDayDare(): Dare de un día de
                                  Journey sin dareId, restringido al Journey
                 achievements.ts  earnedTraits() — qué traits gana un dare
                 companions.ts    sistema de Companions (temptation bundling):
                                  clasifica/resuelve el companion de un dare,
                                  lo ROTA por fecha, y vibeBonus() sesga el
                                  generador según el vibe del check-in
                 prng.ts          PRNG con semilla (mulberry32), reproducible
                 random.ts        sample() (Math.random) y rollTreat(cat, boost,
                                  rand): treat draw consciente del contexto
                                  (excluye `avoid`, prima `fits` ×3) y SESGADO
                                  por `boost` (baja motivación/novedad); rand
                                  inyectable → testeable con semilla
                 date.ts          helpers de fecha local (todayStr, daysBetween)
                 lookup.ts        búsquedas sobre los datos (findDare, findCard)
                 contentSchema.ts validateDare/validateWildcard/validateTreat():
                                  reglas duras del contenido (schema, rangos, ids
                                  aditivos, ejercicios y vocabulario prohibidos).
                                  Red del pipeline de contenido generativo.
                 generationInput.ts  buildGenerationInput(): resume el store en
                                  la señal de feedback que alimenta la generación
                 recommend.ts     recommendJourney(): qué Journey del MVP
                                  destacar HOY en Today según el check-in
                                  (estado+energía). Puro, prioriza los activos
                 share.ts         capa social: texto/payload PUROS para compartir
                                  la Daily Card vía Web Share API (ver más abajo)
                 briefing.ts      "Today's Briefing": elige un consejo inspirado
                                  en alguien conocido (biblioteca `briefings`)
                                  SOLO para el recordatorio (buildBriefing/
                                  buildReminder) + dueSlot() (qué franja del
                                  recordatorio toca: mañana/tarde). Puro, seeded por
                                  fecha (ver más abajo)
                 install.ts       decisión PURA del nudge "añadir a inicio" (PWA):
                                  isIOS/isInStandaloneMode/installOffer (ver más
                                  abajo)
               Frontera con efectos (I/O), aisladas a propósito:
                 storage.ts    load/save/migrate sobre localStorage (v7)
                 useDare.ts    hook de React: estado de la app + orquestación
                 feedback.ts   vibración (navigator.vibrate) + sonido sintetizado
                               (Web Audio, sin assets). Impuro; no se testea.
                 notify.ts     recordatorio local: permiso + showNotification vía
                               service worker. Impuro; no se testea.
  components/  Presentacionales: Ico, TarotArt, Dots, Nav, Meta, Effects,
               MilestoneModal, ShareCardButton, PlanForLater, layout;
               Wordmark (la marca: glifo ✦ + "DARE" + eslogan; se reutiliza en
               Splash, Onboarding y el masthead de Today); DailyCardDraw (card
               pull del día, vive en You); y los de Today: TodayHeader (masthead:
               marca + fecha + saludo inspirador con glow), TodayDareRevealCard,
               PlannedDueList, ActiveJourneyList.
  screens/     Pantallas (Splash, Onboarding, Dream, Reentry, Home, Card, Checkin,
               Detail, Timer, Complete, JourneyComplete, Journey, Journeys,
               Progress, You). Consumen el hook.
               Splash: pantalla oscura de apertura con la marca (crece + shine),
               transitoria (~1.7s) SOLO tras el onboarding y con motion normal;
               el gate (showSplash) vive en App.tsx, no se persiste y respeta
               prefers-reduced-motion.
  App.tsx      "Router" por estado: decide qué pantalla mostrar (+ gate del Splash).
```

### Today — ritual diario mínimo (no dashboard)

La pestaña Today (`screens/Home.tsx`) es deliberadamente MÍNIMA y **sin iconos-
acción en las esquinas** (el perfil vive en la pestaña **You** del nav inferior).
Principio: **UNA acción evidente al abrir**, cero adornos compitiendo arriba (el
manifiesto es *"one decision removed, one action begun"*). De arriba a abajo:

1. **Masthead** (`TodayHeader`): un encabezado de CONTEXTO, no una acción, pero
   **inspirador** — la **marca** (`Wordmark`: glifo + "DARE" + *"Daily Actions.
   Real Energy."*), un pequeño **hero con glow de horizonte** (glifo decorativo,
   `aria-hidden`), la **fecha** ("SUNDAY 5 JULY", `formatDayLabel`) y un titular
   serif: **saludo** por franja horaria ("Good morning/afternoon/evening",
   `greetingFor(hour)`, ambos puros en `lib/date.ts`) + *"Today is yours."* +
   *"Small steps. Real energy."*. Ya **NO** muestra la línea del capítulo del
   Journey: el estado de cada Journey vive abajo, en *"Today's plan"*
   (`ActiveJourneyList`), para no duplicarlo. Da calidez/orientación sin competir
   con el Dare.
2. **Your Dare** como HÉROE (`TodayDareRevealCard`).
3. La lista de **Planned Dares vencidos** (`PlannedDueList`) y `ActiveJourneyList`.

NO muestra carta del día, briefing, proofs, badges, ciencia ni métricas — la
carta vive en **You**, el briefing solo en el recordatorio, y proofs/badges/
ciencia en **Progress**.

**Your Dare: dos vías, AMBAS en la propia card.** El estado cerrado ofrece
**"Start check-in"** (primario) que abre el **único check-in** de la app —la
pantalla completa `Checkin` (*"How are you today?"*)— y, como segunda opción en
la MISMA card, **"Just dare me ✦"** (`quickDareMe`: rápido y aleatorio con el
último check-in —o un default seguro—, se revela **INLINE en la card**, sin
entrar en la pantalla del Dare; ayuda: *"Skips the questions. Uses what we
know."*). Flujo afinado: Your Dare → *Start check-in* → `Checkin` → *Get my dare*
→ Detail → Start. Flujo rápido: Your Dare → *Just dare me* → Dare revelado inline
→ Start. En el hook: `runCheckin` (desde `Checkin`, navega a Detail) y
`quickDareMe` (aleatorio, `navigate:"home"` → inline). **"Another dare" en el
flujo rápido es IGUAL de aleatorio** (`anotherQuickDare`: rechaza el actual —si
no está completado— y vuelve a generar al instante SIN check-in); `anotherDare`
(rechazar + abrir `Checkin`) queda disponible pero ya sin UI que lo invoque.

**El check-in es CORTO a propósito** (tres preguntas + una): **Energy** (1-10) ·
**Time available** · **Where are you right now?** · **Mental state**. La pregunta
de ubicación incluye una última opción **"Send me somewhere ✦"** (loc
`"anywhere"`): en vez de una segunda pregunta de destino, si la eliges el
generador te **manda a un sitio** (piscina/gym/bosque/…, vía
`currentToDareLocs("anywhere")`). El Dare resultante es **coherente** con
energía, tiempo, ubicación y estado mental, y su **duración (`min`) coincide con
el "time available"** (peso decisivo en el scoring del generador; nunca elige un
Dare más largo que el tiempo disponible). **Notas:** el check-in "rápido" inline
(`QuickCheckin`: Energy/Focus/Avoiding 1-5) se **eliminó** para tener uno solo; y
la pregunta de **vibe/companion** y el módulo **"Plan a Dare this week"** también
se retiraron para acortarlo (el generador aún soporta `vibe`/`focus`/`avoiding`
en el scoring, hoy sin UI que los alimente; los companions siguen rotando por
fecha).

Con **varios Journeys activos**, `ActiveJourneyList` prioriza el Journey
recomendado por el check-in (`recommendJourney` en `lib/recommend.ts`: energía
baja → Still Water, con ganas → Iron Quiet, atascado → Wild Ground, con energía
alta → Bright Pulse, overwhelmed → Still Water, returning → el activo más suave),
lo sube y lo marca (`· today`).

El **card pull del día** (tarot, `DailyCardDraw`) tiene dos superficies, y
NINGUNA es Today (que queda mínimo):

- **Ritual de apertura, UNA VEZ AL DÍA y SALTABLE.** Al abrir la app, si aún no
  hay carta hoy y no se ha resuelto el ritual, la pantalla `Card` aparece con las
  3 cartas boca abajo (*"Draw your card."*) ANTES de Today. Elegir una la revela
  a pantalla completa; al continuar, la carta **"viaja" hacia la esquina de You**
  (translate+scale+fade, hint *"Saved in You"*; respeta `prefers-reduced-motion`)
  para que se entienda que NO se pierde —queda guardada en You— y entra a Today.
  **"Skip for now"** (`skipCardIntro`) lo
  salta sin sacar carta. El gate es puro (`shouldOpenCardIntro` en `useDare`:
  `onboarded && dailyCard.cardId == null && cardIntroDate !== hoy`) y se decide en
  el inicializador del `screen`; tanto sacar (`pickCard`) como saltar sellan
  `store.cardIntroDate = hoy`, así **no reaparece** en reaperturas del mismo día.
  El usuario *away* no lo ve (Reentry manda). Es un placer, no un peaje.
- **En la pestaña You**, `DailyCardDraw` es el sitio para sacarla si se saltó, y
  para reabrir la ya sacada (miniatura). Antes vivía arriba en Today.

El check-in COMPLETO (loc/dest, para encaminar Dares de piscina/gym/bosque) ya no
cuelga de Today; se alcanza desde el "one more" de la completion.

### Contenido generativo (pipeline de PRs, no runtime)

El contenido nuevo se **propone en el pipeline**, no en el navegador:
`scripts/generate-content.mjs` (workflow semanal `content.yml`) redacta
propuestas en `src/data/_proposed/week-<AAAA-Www>.ts`, que pasan por la MISMA
compuerta que el corpus vivo (`npm test`) antes de abrir una PR para tu
validación humana. La generación es **aditiva** (ids nuevos, nunca mutar/borrar
los existentes: romperia las referencias guardadas).

**Qué se auto-propone y qué no** (regla de producto): la generación cubre solo
lo que es aditivo por `id`/texto, lo valida un validador automático y no es
sensible ni columna vertebral:

- **Auto-proponible** (compuerta en `_proposed/proposed.test.ts`):
  - **Dares** → `PROPOSED`, validados por `validateDare`.
  - **Wildcards** → `PROPOSED_WILDCARDS`, `validateWildcard` (Dare + `wild:true`).
  - **Treats** → `PROPOSED_TREATS` (`{ tier, text, fits?, avoid?, special? }`),
    `validateTreat` (tier válido, cats reales, `special` solo en golden, sin
    vocabulario prohibido, sin duplicar texto).
- **Human-first** (la generación NO los toca autónomamente): **Journeys**
  (columna vertebral: ids con migración, milestones estables, badge) y las
  **fichas de Ciencia** (claims de salud). Como mucho, borrador asistido en PR.

El feedback del usuario (`buildGenerationInput`) alimenta el prompt. Al aprobar:
promocionar (Dares/Wildcards → `dares.ts`/`wildcards.ts`, Treats → `rewards.ts`
por `tier`) y borrar el fichero de `_proposed/`. Detalle en
`docs/content-pipeline.md`.

### Clave visual — base editorial sobria + calor en 3 momentos

DARE busca calidad percibida en clave **híbrida**: una **base editorial sobria**
(mucho aire, tipografía como jerarquía, casi sin adornos) y **calor concentrado
SOLO en 3 momentos**: **Splash + Onboarding**, **Daily Card** (ritual) y
**Completion** (`Complete` de Dare + `JourneyComplete`). Regla dura: el **glow**
(`box-shadow` de color) y las animaciones cálidas se **reservan** a esos momentos;
las superficies rutinarias (Detail, Journey, Journeys, Progress, You, Dream)
llevan solo **borde/hairline**, sin glow. **Excepción documentada:** Today lleva
un **toque cálido tenue y ESTÁTICO** (glow suave en el masthead, sin pulso y sin
un segundo sparkle), aunque no sea uno de los 3 momentos. El **color por Journey**
se mantiene (identidad propia). Cuerpo en **weight 400** (antes 300) para más peso
editorial sobre `#111`. Al añadir un `box-shadow`/glow o una animación de "magia"
nueva, pregúntate si estás en uno de los 3 momentos; si no, va sobrio.

**Capas de superficie.** Tres niveles: fondo `#111`, `card` (#1C1C1C, superficie
PRIMARIA/elevada) y `card2` (#141412, superficie RECESIVA de apoyo — más cerca del
fondo, para que las primarias destaquen; antes era #191917, casi idéntica a
`card`, y todo se leía como un gris). Las completions (`Complete`,
`JourneyComplete`) mantienen su calor pero con decoración **contenida** (3 glifos
flotando, no una lluvia). El **emoji** solo vive en las opciones de Dream Reward
(`Dream`): ahí es contenido con significado (🎨 clase, 💆 masaje, 👟 zapatillas…),
no decoración — un glifo abstracto no distinguiría "masaje" de "libro", así que se
mantiene a propósito (excepción consciente al sistema de glifos).

**Escala tipográfica (tokens en `index.css`).** Los títulos serif usan **5 pasos**
únicos (no tamaños inline sueltos): `.t-display` (40, marca/celebración) ·
`.t-title` (32, título de pantalla) · `.t-heading` (24, título de card) ·
`.t-subhead` (20, subtítulo/capítulo/stat) · `.t-quote` (17, cita/serif body). Se
aplican junto a `.serif` (`className="serif t-title"`), sin `fontSize` inline. Las
labels tienen piso de legibilidad: `.lbl` (10px) y `.lbl-sm` (9px, tracking menor)
— **no** bajar de 9px. Al maquetar texto nuevo, elige el paso más cercano en vez
de inventar un tamaño.

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

### Companions — recompensa DURANTE (temptation bundling)

El **Companion** NO es un personaje ni decoración: es una **recompensa
simultánea** que hace la actividad menos aburrida MIENTRAS ocurre. Es *temptation
bundling* (Nudge): emparejar algo que "deberías" hacer (esfuerzo) con algo que
"quieres" (placer). Regla dura: **el companion pasa DURANTE el Dare, nunca antes**
(«ves el episodio SOLO mientras haces las sentadillas» — ese es el anzuelo). Cinco
familias (`CompanionCategory`): *entertainment* (Netflix/YouTube/podcast/
audiobook/playlist), *social* (llamar a alguien, clase con gente), *sensory*
(café, vela, sauna, ducha caliente, sol), *novelty* (ruta/clase/deporte/sitio
nuevo), *identity* ("Hot Walk Mode", "Strong Woman Mode", "Boxing Girl Mode").

Reparto (regla del repo): el **catálogo** y la config de vibes viven en
`data/companions.ts`; la **lógica** (clasificar, resolver, ROTAR por fecha, sesgar
el generador) en `lib/companions.ts` (puro, testeado); la **UI** (chip + label +
nota) solo presenta. `resolveCompanion` elige un companion concreto y accionable
(coherente con la actividad: filtra por la categoría del Dare) rotándolo por
fecha para no aburrir.

**Orden y jerarquía del detalle del Dare** (`screens/Detail.tsx`): **What this is
→ Steps → Companion → Why this works → Expected Effect → CTAs**. Los headers de
sección son **neutros** (sin arcoíris de acentos): la jerarquía se expresa con el
prop `tone` de `Section`, no con color. *What this is* y *Steps* son `primary`
(label `.lbl`); *Companion*, *Why this works* y *Expected Effect* son `muted`
(label `.lbl-sm`, glifo y padding más contenidos) — apoyo, no protagonistas. El
masthead de Today es **compacto** (marca con glow tenue detrás + fecha + titular;
sin sparkle suelto extra) para que el Dare quede sobre el pliegue. El Companion ya **no**
lleva la línea "during only — that's the hook" (se retiró por ruido); *"Why this
works"* muestra el porqué **+ la ficha de ciencia COMPLETA** (`science.text` +
`longTerm`, química/comportamiento/largo plazo), no solo la primera frase. En el
Timer (*"On the move"*) el companion tampoco lleva esa línea, y se listan
**todos** los pasos (no solo el primero), cabiendo en una pantalla sin scroll.
La completion (`Complete`) ya **no** pregunta "More energy than before?" (se
retiró; el Treat revelado añade un texto de celebración). "Plan for later" ya no
ofrece "Add to Journey".

**Vibe del check-in** (`CompanionVibe`, watch/listen/talk/elsewhere/aesthetic/
social/brutal/surprise): `vibeBonus` sesga el generador hacia esa familia de
companion y los vibes de novedad suben la tasa de wildcards. El campo `vibe` sigue
en `Checkin` (opcional) y el generador lo soporta, pero **ya no hay UI que lo
pregunte**: la pregunta *"What would make this less boring today?"* se retiró del
check-in para acortarlo (sin vibe = surprise; los companions siguen rotando por
fecha). Queda disponible para reintroducirlo o alimentarlo desde otra superficie.

**Variabilidad de la recompensa** (spec): el pool de Treats y Date ideas es amplio
a propósito, y `rollTreat(boost)` **sesga** la tirada hacia mejores treats cuando
el Dare lo merece — completar con **poca motivación** (energía baja / blocked /
tired) o probar una **categoría nueva** (premiar la novedad, no solo la racha).

### Símbolos (`src/data/symbols.ts`)

Mapa único `SYMBOLS` (design tokens tipográficos). **Nunca** usar un glifo suelto
en la UI: siempre por su clave. Cada Journey tiene un símbolo primario, cada
Chapter uno secundario, cada sección del detalle y cada Trait usan claves del
mapa. Nunca mostrar dorado/oro sin explicarlo con etiqueta (el Badge final de un
Journey usa símbolo + label, nunca color a secas).

### Journeys — sprints de 7 días

Cada Journey es un sprint de 7 días con un `plan` (día 1..7) y 4 chapters, cada
chapter con `days:[from,to]` y `milestones` tipados de **id estable**. Tipos de
milestone: `letter/goal/action/motivator/science/proof/reflection/badge`. Los
milestones son accionables (modal `MilestoneModal`): cada tipo tiene su CTA real
y persiste en `store.milestones`. **Cada chapter de los 4 Journeys del MVP tiene
al menos 2 `goal` (Dares)** — se hacen dos activaciones por capítulo, no una.
Los milestones de un chapter se completan **en orden** (`milestoneUnlocked(c,
index, done)` en `journeys.ts`, puro y testeado): un milestone solo se activa
("Start") cuando TODOS los anteriores del mismo chapter están hechos; los
posteriores aparecen bloqueados (🔒). El CTA **"Take me to my Dare"** de un
milestone `goal` lanza un Dare **concreto del Journey en foco**
(`startJourneyDay`, coherente con el journey), **sin pedir check-in**.

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
(orden ◌→◆→⟁, "real" cae a `dare`) queda disponible para el selector
Soft/Real/Bold del detalle del día (pendiente de UI). La pantalla Journey **ya no
muestra ninguna línea de tiempo de días** ("Days Ahead") ni el modal de día
(`DayModal`, eliminado): el `plan` alimenta el contenido de cada día pero la
pantalla Journey se centra solo en capítulos, milestones, % de completion y Dream
Reward activo.

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

**Today's plan (acción del día).** Con Journeys activos, Today lista para cada
uno la **acción de HOY** del plan (`todaysDayPlan(j, daysDone)` →
`plan[daysDone]`, o null si el sprint está completo): "Day N · título" + un botón
que lanza el Dare de ese día directamente al Detail (`startJourneyDay`, pone el
Journey en foco para que completar avance SU sprint). **El Dare del día se
resuelve SIEMPRE dentro del Journey, nunca del pool global aleatorio:** si el día
fija un `dareId`, ese; si no (días de recuperación/foco abiertos), se **genera
restringido** a la categoría del día → categorías del Journey (`journey.bias`) →
`small`, vía `generateJourneyDayDare` (puro, en `generator.ts`, testeado). Antes
esos días caían al check-in y al pool global, y el Journey acababa ofreciendo un
Dare aleatorio ajeno — ya no. Si el sprint está completo (sin día), el botón abre
la pantalla del Journey. Así se ve de un vistazo qué toca hoy de cada Journey en
marcha (p. ej. fuerza de Iron Quiet + respiración de Still Water). Con más de uno,
sube y marca (`· today`) el recomendado por el check-in ("choose your lane").

**Capítulos por COMPLETADO, no por calendario** (`chapterState` /
`unlockedChapterCount` / `currentChapter` en `journeys.ts`): el capítulo I nace
desbloqueado; el N+1 se desbloquea en cuanto TODOS los milestones del N están
hechos, aunque sea el mismo día. La pantalla Journey NO usa línea de tiempo de
días; la fila semanal de Progress (Today/Tomorrow/…) sí es de calendario.

**Completion del Journey por MILESTONES + celebración** (`journeyComplete()` en
`journeys.ts`): un Journey se da por terminado cuando TODOS los milestones de
TODOS sus capítulos están hechos —aunque hayan pasado menos de 7 días—, no por
un contador de días. `useDare.applyMilestones` centraliza la detección: al
marcar el último milestone de un Journey ACTIVO no terminado, lo añade a
`journeysCompleted`, desbloquea su Badge/identidad final (`journey.identity.id`
+ extras: First Flame→`proof-of-fire`, Iron Quiet→`proof-of-iron`/`quiet-power`/
`builder`), enfoca ese Journey y navega a la pantalla `journeyComplete`
(celebración: Dream Reward como héroe + identidad + siguiente paso). Es
**idempotente** (solo se celebra una vez por Journey, vía `journeysCompleted`) e
**independiente** (terminar uno no afecta a otros activos). `finishDare` ya NO
completa Journeys por contador de días. La pantalla `Complete` (fin de Dare) es
independiente: Treat como héroe, sin badges ni cita de proof; los dos flujos no
colisionan.

**Progreso y próxima acción por MILESTONES (fuente única).** `milestoneProgress(j,
done)` → `{done,total,pct}` es la MISMA base que dispara `journeyComplete`, así
que la banda de completion de la pantalla Journey y la barra de Dream Reward de
Progress miden lo mismo (milestones, no días). `nextMilestone(j, done)` devuelve
el primer milestone pendiente del capítulo en curso (o null si está completo) y
`nextAction` es su título (o la promesa del Journey como cierre). La pantalla
Journey muestra una **"Next step" card** que abre ese milestone exacto de un
toque, y un **banner de "Journey complete"** persistente (vía
`journeysCompleted`) al revisitar un Journey ya terminado. Today reutiliza
`nextAction` en `ActiveJourneyList`.

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

### Today's Briefing (consejo inspirado) — SOLO en el recordatorio

**Today's Briefing** es UN consejo concreto: inspirado en una **persona conocida**
y un **hábito/método/anécdota real**, accionable HOY y corto (formato *persona →
insight → "Today: acción"*). NADA de motivación genérica, "draw a card", lenguaje
de Journey confuso ni nombres de estado internos. **Ya NO tiene widget in-app**:
antes se revelaba detrás de "Today's Door" en Today, pero para mantener Today
mínimo (una sola acción) ese widget —junto con `TodaysDoor`, `AtmosphereHero` y el
componente `Briefing`— se **eliminó**. El briefing sobrevive en su única
superficie útil: el **recordatorio local** (notificación). Reparto según la regla
del repo (puro vs. frontera):

- **`src/data/briefings.ts`** — datos de dominio SIN lógica: la biblioteca
  `BRIEFINGS` (persona + insight + acción + símbolo).
- **`src/lib/briefing.ts`** — PURO y testeado (`briefing.test.ts`).
  `buildBriefing()` elige una entrada de la biblioteca `BRIEFINGS` (lo usa
  internamente `buildReminder`);
  `buildReminder(input, slot)` deriva el título/cuerpo de la notificación (el
  título varía por franja: la tarde dice *"Still time today"* sin culpar);
  `dueSlot()` decide (recibiendo `now`) **qué franja toca** avisar
  (`"morning"`/`"evening"`/`null`). **Dos empujones al día**: la mañana dispara en
  su ventana `[hora_mañana, hora_tarde)` y la tarde a partir de su hora (con
  prioridad, para no reavisar una mañana ya pasada al abrir de noche); cada franja
  lleva su propio `lastShown` (dedupe independiente). La elección se hace con un
  **PRNG sembrado por la FECHA** (`mulberry32`), así el briefing es **estable
  dentro del día** y cambia cada día (y los tests son reproducibles). Un test
  *guard* prohíbe XP/level/streak/badge/calorie/burn **y "draw a card"**.
- **`src/lib/notify.ts`** — frontera con efectos (impura, no testeada, como
  `feedback.ts`): permiso (`Notification`), y `showReminderNotification()` vía
  `serviceWorker.ready.showNotification` (fallback a `new Notification`). El clic
  lo maneja `public/sw.js` (`notificationclick` → enfoca/abre la app).
- **`src/lib/useDare.ts`** — orquesta: las acciones
  (`enableNotifications`/`disableNotifications`/`setNotificationSlot(slot,h,m)`) y
  un efecto que comprueba `dueSlot` al montar, al enfocar la pestaña y **cada
  minuto mientras la app está viva**; al disparar, construye el recordatorio con
  `buildReminder` y sella **solo** el `lastShown` de la franja avisada (dedupe
  diario por franja). Ya NO expone un `briefing` derivado (no hay widget).
- **`src/screens/You.tsx`** — la sección **"Daily notification"** (toggle + **dos
  horas**, mañana/tarde + estado del permiso). La nota de límite honesto
  ("Delivered while DARE is open… needs a server — coming later") se retiró de la
  UI (queda documentada aquí abajo); se reintroducirá al lanzar con backend.

**Límite honesto (sin backend):** es un recordatorio **LOCAL**, fiable mientras la
pestaña vive. El **push con la app cerrada** exige servidor push + VAPID → queda
**diferido** a cuando DARE tenga backend. Las preferencias viven en
`store.notifications` (ver *Datos persistidos*).

### Nudge de instalación (PWA) — proteger el localStorage

En **iOS**, una web **no instalada** pierde el `localStorage` a los ~7 días de
inactividad (Safari lo desaloja) → se borraría el progreso del Journey. Por eso
DARE **empuja a instalar** ("Add to Home Screen"), lo que hace el almacenamiento
duradero. Reparto según la regla del repo (lógica pura vs. efectos):

- **`src/lib/install.ts`** — PURO y testeado (`install.test.ts`): `isIOS(ua)`,
  `isInStandaloneMode(display, ios)` y `installOffer(input)` → `"prompt"` (hay
  `beforeinstallprompt` capturado: instalación de 1 toque), `"ios-manual"` (iOS
  sin ese evento: instrucciones Compartir → Add to Home Screen) o `"none"`. No
  molesta el día 1 (exige algo que perder: ≥1 proof o journey activo) y se
  **silencia** una temporada (14 días) tras un descarte.
- **`src/lib/useDare.ts`** — frontera: captura `beforeinstallprompt`/`appinstalled`,
  detecta standalone, expone `installNudge` (respeta umbral+silencio, para el
  banner de Reentry), `installSettings` (siempre que NO esté instalada, para
  Ajustes) y las acciones `promptInstall`/`dismissInstall`.
- **`src/components/InstallBanner.tsx`** — presentacional (recibe la decisión ya
  tomada). Se monta en **`src/screens/Reentry.tsx`** (quien vuelve tras una
  ausencia es justo el de mayor riesgo de desalojo) y en la sección de Ajustes de
  **`src/screens/You.tsx`**. NO se muestra en Today (se mantiene mínimo).

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
  planned dares (destinos) + Planned Dares (`darePlans`) + Dares rechazados
  (`rejectedDares`), dates, historial de treats, feedback, las preferencias de
  notificación (dos franjas), el estado del nudge de instalación (`install`:
  `dismissedAt`/`installedAt`) y `cardIntroDate` (día en que se resolvió el ritual
  de la Daily Card al abrir)). Los check-ins guardan también el **vibe** de
  companion elegido (campo opcional en `Checkin`). Lo *derivable* (p. ej. el
  scoring de un dare, el companion concreto resuelto, el nº de proofs,
  la identidad actual, el capítulo desbloqueado, **el briefing del día**) se
  recalcula, no se guarda.
- **Guarda referencias, no copias.** Persiste **identificadores** (p. ej. el `id`
  del dare o de la carta) y re-resuelve el resto contra la fuente viva (`src/data`
  vía `lookup.ts`) al leer. Así, cambiar el contenido de un dato no rompe los
  datos antiguos guardados. Copiar el objeto entero dentro del store obliga a
  migrar en cuanto cambie su forma.
- **Versionado de la forma + migración:** el store lleva `version` (hoy `7`) bajo
  la clave `dare:v7`. `storage.ts` migra cualquier forma antigua/desconocida a v7
  mergeando sobre `defaultStore()` (ver `migrate()`), de modo que un campo que un
  build viejo nunca escribió recibe un valor por defecto. v2→v3 renombra el
  vocabulario del prototipo al de producto (streak→momentum, rewardDraws→treats,
  tarot→dailyCard) y **descarta** `xp`/`badges` v2 (no mapean 1:1). v3→v4 añade el
  modelo multi-journey y el recordatorio diario: como un store v3 nunca tuvo
  `activeJourneyIds`, se **deriva** (cualquier Journey con progreso > 0 o
  completado se marca activo), así un usuario existente no pierde su Journey en
  curso; y `notifications` recibe su valor por defecto al mergear.
  **v4→v5→v6 (nota de unión):** hubo VARIAS "v5" en ramas paralelas que aquí se
  unifican en **v6**. Una v5 añadió los **Planned Dares** (`darePlans`: Dares
  concretos apartados para más tarde, guardan el `id` del Dare + cuándo vencen) y
  el registro de **Dares rechazados** (`rejectedDares`, para no repetir pronto lo
  descartado con "Another dare"). Otra v5 añadió el recordatorio de **dos
  franjas** + el **nudge de instalación** (`install`). Otra v5 añadió los
  **Companions** (campo **opcional** `vibe` en cada `Checkin`). v6 cubre TODAS:
  los campos nuevos (`darePlans`/`rejectedDares`/`install`) reciben su default al
  mergear si faltan; el `notifications` de UNA sola hora (v4 o la v5 de Planned
  Dares) se **promueve** a la franja de la **mañana** (conservando la hora y su
  `lastShown`) mientras la **tarde** recibe el default (18:00); y los check-ins
  sin `vibe` se leen tal cual (sin `vibe` = surprise), sin transformar nada. Un
  store guardado por cualquiera de esas v5 (o un v4) migra a v6 sin pérdida.
  **v6→v7:** añade `cardIntroDate` (gate del ritual de la Daily Card al abrir);
  un store v6 no lo tenía → recibe `""` al mergear, y `"" ≠ hoy` hace que el
  ritual aparezca en la próxima apertura (comportamiento deseado, no una
  pérdida). La migración es
  **idempotente**: aplicarla a un store ya v7 lo deja igual. Si cambia la forma,
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
