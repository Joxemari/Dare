import { defineConfig, devices } from "@playwright/test";

/* ============================================================
   Playwright — smoke E2E del loop principal de DARE.
   NO forma parte de `npm test` (Vitest, entorno node) ni del
   check "Tests y build" de la CI: necesita un navegador y arranca
   el dev server. Se corre aparte con `npm run test:e2e`.

   El navegador se resuelve así:
   - por defecto, el Chromium que trae Playwright (`npx playwright
     install chromium` en local / en el workflow de e2e);
   - si `PLAYWRIGHT_CHROMIUM` apunta a un binario (p. ej. un
     Chromium preinstalado en el entorno), se usa ese.
   ============================================================ */
const PORT = 5173;
const BASE = "/Dare/"; // debe coincidir con `base` de vite.config.ts

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  timeout: 30_000,
  use: {
    baseURL: `http://localhost:${PORT}${BASE}`,
    trace: "on-first-retry",
    // Móvil primero: 390px es el viewport de referencia de DARE.
    viewport: { width: 390, height: 844 },
    launchOptions: {
      executablePath: process.env.PLAYWRIGHT_CHROMIUM || undefined,
      // --no-sandbox es necesario en contenedores CI; inofensivo en local.
      args: ["--no-sandbox"],
    },
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  // Arranca el dev server de Vite y espera a que responda.
  webServer: {
    command: "npm run dev",
    url: `http://localhost:${PORT}${BASE}`,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
