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
  // Onboarding lleva directo a Today, sin arrancar Journey.
  await expect(page.getByText("One dare today.")).toBeVisible();
}

test("recorre el loop diario completo sin errores de página", async ({ page }) => {
  const errors = guardPageErrors(page);
  await enterApp(page);

  // sin Journey activo, Today invita a elegir uno (sin bloquear el Dare)
  await expect(page.getByText("Choose a Journey to begin.")).toBeVisible();
  await expect(page.getByText("No active Journey")).toBeVisible();

  // draw daily card → se revela a pantalla completa → tap para continuar
  await page.locator('button[aria-label="Face-down daily card"]').first().click();
  await expect(page.getByText("Tap to continue")).toBeVisible();
  await page.getByText("Tap to continue").click();

  // check-in — ningún botón viene preseleccionado
  await page.getByRole("button", { name: "Start check-in" }).click();
  await expect(page.getByText("How are you today?")).toBeVisible();
  await page.getByRole("button", { name: "6", exact: true }).click();
  await page.getByRole("button", { name: "20 min" }).click();
  await page.getByRole("button", { name: "Home", exact: true }).click();
  await page.getByRole("button", { name: "Normal" }).click();
  await page.getByRole("button", { name: "Get my dare" }).click();

  // "Get my dare" abre el Detail directamente — sin tap-to-reveal
  await expect(page.getByText("Expected Effect")).toBeVisible();
  await expect(page.getByText("Treat Locked")).toBeVisible();
  // "Why this Dare today" existe pero al final de la página
  await expect(page.getByText("Why this Dare today")).toBeVisible();

  // start → timer → finish → completion
  await page.getByRole("button", { name: "Start dare" }).click();
  await page.getByRole("button", { name: "Finish dare" }).click();
  await expect(page.getByText("Dare completed.")).toBeVisible();
  await expect(page.getByText("Treat unlocked.")).toBeVisible();

  // no debe aparecer XP en ninguna parte visible de la completion
  const body = (await page.locator("body").innerText()).toLowerCase();
  expect(body).not.toMatch(/\bxp\b/);

  // energy feedback + volver a Today
  await page.getByRole("button", { name: "A little more" }).click();
  await page.getByRole("button", { name: "Back home" }).click();
  await expect(page.getByText("One dare today.")).toBeVisible();

  expect(errors, errors.join("\n")).toEqual([]);
});

test("Journey: Begin explícito, milestones accionables + tabs Progress/You", async ({ page }) => {
  const errors = guardPageErrors(page);
  await enterApp(page);

  // Journey tab — sin arrancar aún, ofrece "Begin Journey"
  await page.getByRole("button", { name: "Journey", exact: true }).click();
  await page.getByRole("button", { name: /Begin Journey/ }).click();

  // sin Dream Reward → setup; al elegirlo, el Journey arranca y muestra el plan
  await expect(page.getByText(/What would make finishing/)).toBeVisible();
  await page.getByText("Painting class").click();
  await expect(page.getByText("The days ahead")).toBeVisible();
  await expect(page.getByText(/milestones completed/).first()).toBeVisible();

  // briefing del día actual: contenido rico + selector de variante ◌/◆/⟁
  await page.getByText("Day 1", { exact: true }).click();
  await expect(page.getByText(/Just shoes/)).toBeVisible(); // Trigger del día (sólo en el modal)
  await expect(page.getByRole("button", { name: /Real/ })).toBeVisible();
  await page.getByRole("button", { name: /Soft/ }).click(); // cambiar de variante
  await page.getByRole("button", { name: "✕" }).click();

  // abrir un milestone (Letter) y completarlo — arregla el "Start" muerto
  await page.getByText("You don't have a motivation problem").click();
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
