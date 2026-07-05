# Pipeline de contenido generativo

DARE genera contenido nuevo (Dares) **en el pipeline de PRs**, no en el
navegador. Es la opción que encaja con la arquitectura actual: SPA estática sin
backend, contenido como **datos tipados** en `src/data/*.ts` validados por tests.

> Por qué NO se genera en runtime: un SPA estático tendría que llevar la API key
> en el bundle (se filtra), el coste escalaría por usuario, rompería el modo
> offline y el determinismo del `generator` (que depende de contenido estable y
> de resolver por `id`). Generar en el pipeline mantiene el contenido
> **revisable, versionado y reversible**.

## Flujo

```
scripts/generate-content.mjs        →  redacta propuestas (LLM o stub)
  src/data/_proposed/week-<AAAA-Www>.ts   (PROPOSED: Dare[])
        │
        ▼
npm test  →  src/data/_proposed/proposed.test.ts  →  validateDare()   [COMPUERTA]
        │
        ▼
.github/workflows/content.yml  →  abre PR  →  TÚ revisas y mergeas   [VALIDACIÓN HUMANA]
        │
        ▼
promoción: mover entradas a dares.ts/wildcards.ts + borrar el fichero de _proposed/
```

### 1. Generación (`scripts/generate-content.mjs`)

- Lee el corpus vivo (ids + títulos, para estilo y dedup) y los `scienceId`
  válidos.
- Lee `feedback.json` en la raíz si existe (ver **Feedback** abajo) y lo mete en
  el prompt.
- Si hay `ANTHROPIC_API_KEY`, pide propuestas al modelo; si no, usa un **stub
  determinista** para que el pipeline corra sin red.
- Pre-valida en JS (dedup + kebab + palabras prohibidas) y escribe el lote.

Lanzarlo a mano:

```bash
node scripts/generate-content.mjs            # sin key → stub determinista
ANTHROPIC_API_KEY=sk-... node scripts/generate-content.mjs
DARE_BATCH=5 ANTHROPIC_API_KEY=sk-... node scripts/generate-content.mjs
```

### 2. Validación automática (la compuerta)

`src/lib/contentSchema.ts` expone validadores **puros** que codifican las reglas
duras del dominio (schema, rangos, ids únicos/aditivos, `scienceId` existente,
ejercicios y vocabulario prohibidos):

- `validateDare` → `PROPOSED` (Dares).
- `validateWildcard` → `PROPOSED_WILDCARDS` (Dare con `wild:true`).
- `validateTreat` → `PROPOSED_TREATS` (`{ tier, text, fits?, avoid?, special? }`;
  `special` solo en golden; sin duplicar texto).

**Qué se auto-propone:** Dares, Wildcards y Treats. **Human-first** (la generación
no los toca autónomamente): Journeys (columna vertebral) y fichas de Ciencia
(claims de salud). Los validadores los usan:

- `src/data/data.test.ts` sobre el **corpus vivo** (garantiza que las reglas
  reflejan la realidad), y
- `src/data/_proposed/proposed.test.ts` sobre las **propuestas** (recoge todos
  los `week-*.ts` con `import.meta.glob`).

Si una propuesta no cumple, `npm test` se pone en rojo → la CI marca la PR.

### 3. Validación humana + promoción

La PR semanal (workflow `content.yml`, lunes) deja el lote en `_proposed/`.
**Aprobar = mergear** tras revisar tono y encaje. Al aprobar, **promociona**:
mueve las entradas a `src/data/dares.ts` (o `wildcards.ts`) y borra el fichero de
`_proposed/`. En `main`, `_proposed/` está normalmente vacío.

## Feedback → generación

`src/lib/generationInput.ts` (`buildGenerationInput(store)`) resume el estado del
usuario en una señal compacta y serializable: energía por categoría, categorías
más energizantes, y completados por `dareId`. Solo usa datos **ya persistidos**
(no necesita migración de esquema).

Como el estado vive en `localStorage` (por dispositivo), hoy el puente es
**manual**: exportar ese resumen y dejarlo en `feedback.json` en la raíz del repo
antes de generar. Próximo paso natural: un botón *Export data* en la pantalla
**You** que serialice `buildGenerationInput(store)`. Cuando exista backend, se
sustituye por un endpoint opt-in anónimo.

## Reglas invariantes

- **Aditivo, nunca mutar.** La generación crea `id` nuevos; nunca cambia ni borra
  los existentes (romperia las referencias guardadas en `localStorage`).
- **La ciencia es curada a mano.** Las propuestas solo pueden **reutilizar**
  `scienceId` existentes; no se auto-generan afirmaciones de salud.
- **Lotes pequeños** (3–5/semana) para evitar deriva de tono y saturación.
