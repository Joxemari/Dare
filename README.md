# DARE — Daily Actions. Real Energy.

An energy-activation app for a busy, tired brain: **one dare a day, chosen for you.**
No lists, no plans, no decisions. Check in for 20 seconds → the app assigns a single
dare → you complete it → XP, reward draw, and a 4-chapter journey.

Co-Star-style aesthetic: dark, minimal, poetic. UI in English.

## Stack

- **Vite + React + TypeScript**
- **Tailwind CSS v4** (`@tailwindcss/vite`) — tokens live in `src/index.css`
- Self-hosted fonts via `@fontsource` (Cormorant Garamond + Space Grotesk) — no Google CDN
- State persisted to **localStorage** (schema v2, versioned with migration)
- No router: screens are state, matching the prototype

## Develop

```bash
npm install
npm run dev
```

Reference viewport is **390px** (phone). Open the dev URL and narrow the window.

```bash
npm run build      # tsc -b && vite build
npm run preview    # serve the production build locally
```

## Deploy — GitHub Pages

Every push to `main` triggers `.github/workflows/deploy.yml`, which builds and
publishes to <https://joxemari.github.io/Dare/>.

Two one-time settings on GitHub (the workflow can't do these for you):

1. The repository must be **public** (Pages is free only for public repos on the free plan).
2. **Settings → Pages → Source: GitHub Actions.**

`vite.config.ts` sets `base: '/Dare/'` so the built assets resolve under the
`/Dare/` path — without it they 404 on Pages. The base must match the repository
name (`Dare`) exactly: the Pages path is case-sensitive.

## Project structure

```
src/
  data/        dares, wildcards, journeys + Ember marks, tarot, draws, badges, icons, colors
  lib/         generator, storage (localStorage v2 + migration), useDare hook, prng, date, random
  components/  Ico, TarotArt, Dots, Nav, Meta, layout
  screens/     Onboarding, Reentry, Home, Checkin, Detail, Timer, Complete, Journey, Journeys, Progress, You
  App.tsx      screen router
```

## Reference

The product spec and the interactive prototype live in [`docs/`](./docs):
`DARE-project-instructions.md`, `claude-code-kickoff.md`, `dare-prototype.jsx`.

## Roadmap

- **Phase 1 (this build):** Vite + React + TS + Tailwind, localStorage persistence, Pages deploy.
- **Phase 2:** installable PWA with a daily local reminder; deep-linked rewards; the
  remaining 10 Arcana illustrations; Iron Quiet & Still Water chapter marks.
