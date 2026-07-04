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
- Persistencia en **`localStorage`**, esquema versionado (v2) con migración.
- Sin router: las pantallas son estado, no rutas.
- Node **22**, gestor **npm** (hay `package-lock.json` → en CI se usa `npm ci`).

## Comandos (los reales de Dare)

```bash
npm install         # instalar dependencias (usa package-lock.json)
npm run dev         # servidor de desarrollo (Vite). Viewport de referencia: 390px (móvil)

npm test            # tests una vez (vitest run) — lo que corre la CI
npm run test:watch  # tests en modo watch durante el desarrollo
npm run typecheck   # tsc -b --noEmit (chequeo de tipos sin emitir)

npm run build       # tsc -b && vite build  → genera dist/
npm run preview     # sirve el build de producción en local
```

---

## Arquitectura — dónde vive la lógica y por qué

La regla es simple: **la lógica de negocio vive en módulos puros y testeables;
los componentes de UI son presentacionales.** El estado y los efectos se
concentran en la frontera (hook + `storage`), no repartidos por las pantallas.

```
src/
  data/        Datos de dominio (constantes, sin lógica): dares, wildcards,
               journeys, tarot, draws, badges, icons, colors.
  lib/         Lógica. La mayoría son funciones PURAS y deterministas:
                 generator.ts  motor de selección del dare (scoring, no if/else)
                 prng.ts       PRNG con semilla (mulberry32), reproducible
                 random.ts     sample() y rollDraw() (usan Math.random)
                 date.ts       helpers de fecha local (todayStr, daysBetween)
                 lookup.ts     búsquedas sobre los datos (findDare, findCard)
               Frontera con efectos (I/O), aisladas a propósito:
                 storage.ts    load/save/migrate sobre localStorage (v2)
                 useDare.ts    hook de React: estado de la app + orquestación
  components/  Presentacionales: Ico, TarotArt, Dots, Nav, Meta, layout.
  screens/     Pantallas (Onboarding, Reentry, Home, Checkin, Detail, Timer,
               Complete, Journey, Journeys, Progress, You). Consumen el hook.
  App.tsx      "Router" por estado: decide qué pantalla mostrar.
```

Por qué así:

- **`src/lib` puro = testeable sin DOM.** Los tests corren en entorno `node`
  (ver `vitest.config.ts`), sin jsdom, y son rápidos y deterministas.
- **`src/data` sin lógica.** Cambiar contenido (retos, recompensas…) no toca
  código; añadir lógica sobre esos datos va siempre en `src/lib`.
- **Efectos en la frontera.** `storage.ts` es el único que habla con
  `localStorage`; `useDare.ts` es el único que mantiene estado de React. Así el
  resto se testea como funciones.

### Datos persistidos (`localStorage`)

- **Qué se guarda vs. qué se recalcula:** se persiste el *estado* del usuario
  (onboarding, journey y progreso, check-ins, dares del día, XP, racha, badges,
  historial de recompensas y feedback). Lo *derivable* (p. ej. el scoring de un
  dare) se recalcula, no se guarda.
- **Guarda referencias, no copias.** Persiste **identificadores** (p. ej. el `id`
  del dare o de la carta) y re-resuelve el resto contra la fuente viva (`src/data`
  vía `lookup.ts`) al leer. Así, cambiar el contenido de un dato no rompe los
  datos antiguos guardados. Copiar el objeto entero dentro del store obliga a
  migrar en cuanto cambie su forma.
- **Versionado de la forma + migración:** el store lleva `version` (hoy `2`) bajo
  la clave `dare:v2`. `storage.ts` migra cualquier forma antigua/desconocida a v2
  mergeando sobre `defaultStore()` (ver `migrate()`), de modo que un campo que un
  build viejo nunca escribió recibe un valor por defecto. La migración es
  **idempotente**: aplicarla a un store ya v2 lo deja igual. Si cambia la forma,
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
  la PR. Ejemplos ya presentes: `base: '/dare/'` en `vite.config.ts`, la
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
  en **GitHub Pages** (<https://joxemari.github.io/dare/>). `vite.config.ts` fija
  `base: '/dare/'` para que los assets resuelvan bajo `/dare/`.
