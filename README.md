# DARE — Daily Actions. Real Energy.

An energy-activation app for a busy, tired brain: **one dare a day, chosen for you.**
No lists, no plans, no decisions. Check in for 20 seconds → the app assigns a single
dare → you complete it → **Proof collected**, a **Treat Draw**, and a 7-day Journey
toward your **Dream Reward**.

DARE is a *Chief Energy Officer*, not a fitness tracker. Co-Star-style aesthetic:
dark, minimal, poetic. UI in English.

## Stack

- **Vite + React + TypeScript**
- **Tailwind CSS v4** (`@tailwindcss/vite`) — tokens live in `src/index.css`
- Self-hosted fonts via `@fontsource` (Cormorant Garamond + Space Grotesk) — no Google CDN
- State persisted to **localStorage** (schema v3, versioned with migration)
- **Installable PWA** (manifest + service worker, no extra dependency) — works offline, adds to home screen
- No router: screens are state

## Develop

```bash
npm install
npm run dev
```

Reference viewport is **390px** (phone). Open the dev URL and narrow the window.

```bash
npm run build      # tsc -b && vite build
npm run preview    # serve the production build locally
npm run typecheck  # tsc -b --noEmit
```

## Testing

Two layers:

```bash
npm test           # unit tests — Vitest (node env). Fast, deterministic, no DOM.
npm run test:e2e   # end-to-end smoke — Playwright, drives the app in a browser.
```

- **Unit (Vitest).** Cover the pure logic in `src/lib` and the data integrity in
  `src/data` (generator, achievements, storage migration, journey/dare/science
  wiring). This is what the **"Tests y build"** CI check runs (`npm ci`, `npm test`,
  `npm run build`).
- **E2E (Playwright).** `e2e/core-loop.spec.ts` drives the real flow —
  onboarding → Dream Reward → check-in → reveal → timer → completion (Proof +
  Treat + feedback) → Journey milestones → Progress/You — and asserts there are no
  page errors. It is **opt-in**: not part of `npm test` nor the required check,
  because it needs a browser and starts the dev server. It runs on PRs in a
  separate **E2E** workflow (`.github/workflows/e2e.yml`).

Run e2e locally (first time installs the browser):

```bash
npx playwright install chromium
npm run test:e2e
```

If a Chromium binary is already provided by your environment, point Playwright at
it instead of installing one: `PLAYWRIGHT_CHROMIUM=/path/to/chrome npm run test:e2e`.

## Deploy — GitHub Pages

Every push to `main` triggers `.github/workflows/deploy.yml`, which builds and
publishes to <https://joxemari.github.io/Dare/>.

Two one-time settings on GitHub (the workflow can't do these for you):

1. The repository must be **public** (Pages is free only for public repos on the free plan).
2. **Settings → Pages → Source: GitHub Actions.**

`vite.config.ts` sets `base: '/Dare/'` so the built assets resolve under the
`/Dare/` path — without it they 404 on Pages. The base must match the repository
name (`Dare`) exactly: the Pages path is case-sensitive.

## PWA — installable, offline

DARE is an installable PWA, done **without extra dependencies** (no
`vite-plugin-pwa`): a static manifest, a hand-written service worker, and a few
`<head>` tags.

- `public/manifest.webmanifest` — `display: standalone`, theme `#111`, icons.
  Paths are **relative**, so they resolve against `/Dare/` with no hardcoded base.
- `public/sw.js` — caching strategy chosen on purpose for iterating during a test:
  **network-first for navigation** (online always serves the latest deploy, so
  installed users never get stuck on a stale version) and **cache-first for hashed
  assets** (immutable by content hash → fast + offline after first load). Old caches
  are purged on activation via a version tag (`dare-v1` → bump on shell/strategy
  changes).
- `public/icons/` — app icons generated from the sparkle mark in `favicon.svg`
  (`192`, `512`, `512-maskable`, `apple-touch-180`). See `public/icons/README.md`
  to regenerate.
- Registered **prod-only** in `src/main.tsx` (`import.meta.env.PROD`), so dev and
  the Playwright e2e are unaffected.

On **iOS**, "Add to Home Screen" runs the app standalone (no browser chrome) and
gives it **durable storage** — without it, Safari can evict `localStorage` after
~7 days of inactivity, which would wipe a user's Journey progress.

`src/pwa.test.ts` guards this: manifest parses, every declared icon exists on disk,
and `index.html` links the manifest + apple-touch-icon.

## Project structure

```
src/
  data/        dares, wildcards, journeys (7-day plans + typed milestones),
               tarot, symbols, science, traits, rewards, icons, colors
  lib/         generator, achievements, storage (localStorage v3 + migration),
               useDare hook, prng, date, lookup, random
  components/  Ico, TarotArt, Dots, Nav, Meta, Effects, MilestoneModal, layout
  screens/     Onboarding, Dream, Reentry, Home, Checkin, Detail, Timer,
               Complete, Journey, Journeys, Progress, You
  App.tsx      screen router
e2e/           Playwright smoke test of the core loop
```

The product vocabulary (Proof / Identity / Traits / Treat Draw / Companion /
Milestones / Momentum) and the architecture are documented in
[`CLAUDE.md`](./CLAUDE.md).

## Reference

The product spec and the interactive prototype live in [`docs/`](./docs).

## Roadmap

- **Now:** Vite + React + TS + Tailwind, localStorage v3, Pages deploy, unit + E2E tests,
  installable PWA (offline + add to home screen).
  The Ember and Iron Quiet are complete 7-day Journeys.
- **Next:** Still Water Journey content; daily local reminder (PWA notifications);
  deep-linked rewards.
