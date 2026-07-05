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
  // Today mínimo: SOLO el Dare como héroe. Sin carta, sin puerta/briefing,
  // sin arrancar Journey.
  await expect(page.getByText("YOUR DARE OF THE DAY")).toBeVisible();
}

test("Today: mínimo (solo Dare) + 'Just dare me' un toque, loop sin errores", async ({ page }) => {
  const errors = guardPageErrors(page);
  await enterApp(page);

  // Today es mínimo: NO hay card pull ni Today's Door; solo el Dare + Journeys.
  await expect(page.getByText("One action, chosen for you.")).toBeVisible();
  await expect(page.getByText("No Journey started yet.")).toBeVisible();
  await expect(page.getByText("DRAW YOUR CARD FOR TODAY")).toHaveCount(0);
  await expect(page.getByText("Today's Door")).toHaveCount(0);

  // "Just dare me": un toque genera y revela el Dare INLINE (check-in opcional)
  await page.getByRole("button", { name: "Just dare me" }).click();

  // Dare revelado inline
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

test("Dare page: What this is / Why this works, sin Treat Locked + Plan for later", async ({ page }) => {
  const errors = guardPageErrors(page);
  await enterApp(page);

  // check-in opcional ("Check in first") → Dare revelado → View details abre el Detail
  await page.getByRole("button", { name: "Check in first" }).click();
  await page.getByRole("button", { name: "3", exact: true }).nth(0).click(); // energy
  await page.getByRole("button", { name: "3", exact: true }).nth(1).click(); // focus
  await page.getByRole("button", { name: "Mind", exact: true }).click();
  await page.getByRole("button", { name: "Get my Dare" }).click();
  await page.getByRole("button", { name: "View details" }).click();

  // la primera sección es un resumen, no "Trigger"; y "Why this works" fusiona ciencia
  await expect(page.getByText("What this is")).toBeVisible();
  await expect(page.getByText("Expected Effect")).toBeVisible();
  await expect(page.getByText("Why this works")).toBeVisible();
  // ya NO hay "Treat Locked" ni sección "Trigger" en la pantalla del Dare
  await expect(page.getByText("Treat Locked")).toHaveCount(0);
  await expect(page.getByRole("button", { name: /Plan for later/ })).toBeVisible();

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

  // You: Identity + el card pull del día vive AQUÍ (movido desde Today)
  await page.getByRole("button", { name: /You/ }).click();
  await expect(page.getByText(/Identity:/)).toBeVisible();
  await expect(page.getByText("DRAW YOUR CARD FOR TODAY")).toBeVisible();

  expect(errors, errors.join("\n")).toEqual([]);
});
