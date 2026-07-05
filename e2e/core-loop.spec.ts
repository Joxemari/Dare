import { test, expect, type Page } from "@playwright/test";

/* ============================================================
   Smoke E2E del loop principal de DARE. Complementa a los tests
   unitarios de Vitest (lógica pura, entorno node): aquí se
   comprueba que las pantallas montan y el flujo real funciona en
   un navegador, sin errores de página.
   ============================================================ */

/** Falla el test si la página emite errores de JS o console.error. */
function guardPageErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(`console.error: ${m.text()}`);
  });
  return errors;
}

/** Onboarding (2 pantallas) → Today. NO arranca ningún Journey (eso es explícito). */
async function enterApp(page: Page) {
  await page.addInitScript(() => localStorage.clear()); // arranque limpio y determinista
  await page.goto("/Dare/");
  await expect(page.getByText("You don't need")).toBeVisible();
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("button", { name: "Enter DARE" }).click();
  // Today mínimo: atmósfera + un Dare oculto. Sin arrancar Journey.
  await expect(page.getByText("Today's Door")).toBeVisible();
}

test("Today: ritual de carta + revelado inline del Dare, loop sin errores", async ({ page }) => {
  const errors = guardPageErrors(page);
  await enterApp(page);

  // atmósfera + Dare cerrado + sin Journeys todavía
  await expect(page.getByText("One opening is enough.")).toBeVisible();
  await expect(page.getByText("One dare is waiting.")).toBeVisible();
  await expect(page.getByText("No Journey started yet.")).toBeVisible();

  // ritual de la carta del día vive fuera de Today, tras el icono del header
  await page.getByRole("button", { name: "Today's card" }).click();
  await expect(page.getByText("Draw your card.")).toBeVisible();
  await page.locator('button[aria-label="Face-down daily card"]').first().click();
  await expect(page.getByText("Tap to continue")).toBeVisible();
  await page.getByText("Tap to continue").click();
  await expect(page.getByText("Today's Door")).toBeVisible();

  // revelar el Dare INLINE, de un solo toque (sin cambiar de pantalla)
  await page.getByRole("button", { name: "Reveal today's dare" }).click();
  await expect(page.getByRole("button", { name: "Start now" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Another dare" })).toBeVisible();

  // start → timer → finish → completion
  await page.getByRole("button", { name: "Start now" }).click();
  await page.getByRole("button", { name: "Finish dare" }).click();
  await expect(page.getByText("Dare completed.")).toBeVisible();
  await expect(page.getByText("Treat unlocked.")).toBeVisible();

  // el Treat es el héroe: se revela de un toque; la feedback aparece tras revelar.
  // La tarjeta tiene animación `pulse` (nunca "stable"): forzamos el click.
  await page.getByText("Tap to reveal").click({ force: true });

  // no debe aparecer XP en ninguna parte visible de la completion
  const body = (await page.locator("body").innerText()).toLowerCase();
  expect(body).not.toMatch(/\bxp\b/);

  // energy feedback + volver a Today (Dare de hoy ya hecho)
  await page.getByRole("button", { name: "A little more" }).click();
  await page.getByRole("button", { name: "Back home" }).click();
  await expect(page.getByText("Done for today.", { exact: true })).toBeVisible();

  expect(errors, errors.join("\n")).toEqual([]);
});

test("Today: check-in personalizado → Get my dare abre el Detail", async ({ page }) => {
  const errors = guardPageErrors(page);
  await enterApp(page);

  // el check-in de 30 s sigue accesible desde Today (link discreto)
  await page.getByRole("button", { name: /Personalize/ }).click();
  await expect(page.getByText("How are you today?")).toBeVisible();
  await page.getByRole("button", { name: "6", exact: true }).click();
  await page.getByRole("button", { name: "20 min" }).click();
  await page.getByRole("button", { name: "Home", exact: true }).click();
  await page.getByRole("button", { name: "Normal" }).click();
  await page.getByRole("button", { name: "Get my dare" }).click();

  // "Get my dare" abre el Detail directamente — sin tap-to-reveal
  await expect(page.getByText("Expected Effect")).toBeVisible();
  await expect(page.getByText("Treat Locked")).toBeVisible();
  await expect(page.getByText("Why this Dare today")).toBeVisible();

  expect(errors, errors.join("\n")).toEqual([]);
});

test("Journey: Begin explícito, milestones accionables + tabs Progress/You", async ({ page }) => {
  const errors = guardPageErrors(page);
  await enterApp(page);

  // Journey tab — sin arrancar aún, ofrece "Begin Journey"
  await page.getByRole("button", { name: "Journey", exact: true }).click();
  await page.getByRole("button", { name: /Begin Journey/ }).click();

  // sin Dream Reward → setup; al elegirlo, el Journey arranca y muestra capítulos.
  // El Journey en foco por defecto es Iron Quiet (MVP, physical-energy-first).
  await expect(page.getByText(/What would feeling stronger/)).toBeVisible();
  await page.getByText("New training top").click();
  // La pantalla Journey ya NO muestra "Days Ahead": se centra en capítulos,
  // milestones, % de completion y Dream Reward activo.
  await expect(page.getByText("Chapters")).toBeVisible();
  await expect(page.getByText("The days ahead")).toHaveCount(0);
  await expect(page.getByText(/milestones completed/).first()).toBeVisible();

  // La "Next step" card lleva de un toque al milestone pendiente exacto —
  // lo abre y se completa (arregla el "Start" muerto de milestones).
  await expect(page.getByText(/Next step/)).toBeVisible();
  await page.getByText(/Next step/).click();
  await expect(page.getByRole("button", { name: "Mark as read" })).toBeVisible();
  await page.getByRole("button", { name: "Mark as read" }).click();

  // Progress: Proof / Momentum / Badges + fila semanal
  await page.getByRole("button", { name: /Progress/ }).click();
  await expect(page.getByText("This week")).toBeVisible();
  await expect(page.getByText("Proof collected")).toBeVisible();
  await expect(page.getByText("Momentum").first()).toBeVisible();
  await expect(page.getByText(/Badges —/)).toBeVisible();

  // You: Identity
  await page.getByRole("button", { name: /You/ }).click();
  await expect(page.getByText(/Identity:/)).toBeVisible();

  expect(errors, errors.join("\n")).toEqual([]);
});
