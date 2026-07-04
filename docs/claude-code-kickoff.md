# DARE — Kickoff para Claude Code

Objetivo: convertir el prototipo `dare-prototype.jsx` en una web app real, desplegada gratis en GitHub Pages en `https://joxemari.github.io/dare/`.

Lee primero `DARE-project-instructions.md` (spec de producto completa) y `dare-prototype.jsx` (referencia funcional y visual — la app debe verse y comportarse igual). Ambos ficheros van en la raíz del repo, en `/docs`.

## 1. Repo y scaffold

- Repo público `dare` (Pages gratis requiere repo público en el plan free).
- `npm create vite@latest . -- --template react-ts`
- Tailwind CSS v4 (`@tailwindcss/vite`). Consultar Context7 para la config actual de Tailwind 4 + Vite — no usar la config de v3 de memoria.
- **`vite.config.ts` → `base: '/dare/'`** (crítico: sin esto los assets 404 en Pages).
- Sin router: la navegación por pantallas se queda como estado (`screen`), igual que el prototipo. Si algún día hay rutas, HashRouter (Pages no reescribe URLs).

## 2. Migración del prototipo

- Trocear el monolito en módulos: `data/` (dares, wildcards, journeys, marks, tarot, draws, badges), `lib/` (generator, chapterOf, rollDraw, prng), `components/` (Ico, TarotArt, Dots, Nav, Meta, cards), `screens/` (Onboarding, Home, Checkin, Detail, Timer, Complete, Journey, Journeys, Progress, You, Reentry).
- Tipar todo (los datos ya tienen forma estable — derivar interfaces de ellos).
- Fuentes: Cormorant Garamond + Space Grotesk self-hosted vía `@fontsource` (no depender del CDN de Google).
- Los CSS strings inline del prototipo → Tailwind + un pequeño CSS de tokens (colores de `C`, animaciones pulse/rise/flip, `prefers-reduced-motion`).
- Iconografía: mantener el set line-art `ICONS`/`Ico` tal cual. **Nunca emoji.**
- Cartas Arcana: `gen-card.js` genera los SVG (por ahora The Sun y The Tower); guardarlos en `src/assets/arcana/` e importarlos como componentes o `<img>`. Para los 10 arcanos sin ilustración final, mantener el `TarotArt` line-art mini como placeholder.

## 3. Persistencia (lo único realmente nuevo)

- Implementar el esquema localStorage v2 de las instrucciones (clave `dare:v2`), con `load()/save()` y migración versionada.
- Sustituir el seed demo por estado inicial vacío + onboarding real.
- Lógica de día: al abrir, comparar `todaysDares[].date` con hoy → archivar en silencio lo de ayer; comparar con `streak.lastDate` → si hueco > 1 día, pantalla de re-entrada.
- El feedback "+30 min" en real: guardarlo como pendiente y mostrarlo en la siguiente apertura si han pasado ≥30 min (sin notificaciones todavía — eso es Fase 2 PWA).
- Quitar los helpers "(demo)".

## 4. Deploy — GitHub Pages con Actions

`.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages
on:
  push:
    branches: [main]
permissions:
  contents: read
  pages: write
  id-token: write
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22, cache: npm }
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with: { path: dist }
  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

En el repo: Settings → Pages → Source: **GitHub Actions**. Cada push a `main` publica.

## 5. Criterios de hecho (v1.0)

- Onboarding → check-in / Just dare me → sealed → detail (1 tap) → timer → completion con reward draw → feedback.
- Tarot diario (una tirada/día, persistida), journeys con marcas de The Ember, wildcards, multi-dare, re-entrada tras ausencia.
- Todo persiste entre sesiones; funciona en el móvil (viewport 390px es el diseño de referencia).
- Lighthouse: sin fuentes bloqueantes, contraste AA en textos dim.

## Fase 2 (no ahora)

PWA (manifest + service worker + notificación diaria a hora elegida), deep-links en rewards, rewards personalizados desde la marca "Build your reward shelf", los 10 arcanos restantes, marcas de Iron Quiet y Still Water.
