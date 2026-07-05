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

test("Today: Door→Briefing + Your Dare tras check-in rápido, loop sin errores", async ({ page }) => {
  const errors = guardPageErrors(page);
  await enterApp(page);

  // Today's Door + Dare cerrado (pide check-in) + sin Journeys todavía
  await expect(page.getByText("Tap to open today's briefing")).toBeVisible();
  await expect(page.getByText("One dare, matched to today.")).toBeVisible();
  await expect(page.getByText("No Journey started yet.")).toBeVisible();

  // abrir la puerta revela Today's Briefing detrás (consejo inspirado)
  await page.getByRole("button", { name: "Open today's briefing" }).click();
  await expect(page.getByText("Today's briefing")).toBeVisible();
  await expect(page.getByText("Today:", { exact: false })).toBeVisible();
  await page.getByRole("button", { name: "Close" }).click();

  // ritual de la carta del día vive fuera de Today, tras el icono del header
  await page.getByRole("button", { name: "Today's card" }).click();
  await expect(page.getByText("Draw your card.")).toBeVisible();
  await page.locator('button[aria-label="Face-down daily card"]').first().click();
  await expect(page.getByText("Tap to continue")).toBeVisible();
  await page.getByText("Tap to continue").click();
  await expect(page.getByText("Today's Door")).toBeVisible();

  // "Your Dare" EXIGE un check-in rápido (energía · foco · qué evitas)
  await page.getByRole("button", { name: "Check in for my dare" }).click();
  await expect(page.getByText("Quick check-in")).toBeVisible();
  await page.getByRole("button", { name: "4", exact: true }).nth(0).click(); // energy
  await page.getByRole("button", { name: "4", exact: true }).nth(1).click(); // focus
  await page.getByRole("button", { name: "Admin", exact: true }).click();
  await page.getByRole("button", { name: "Get my Dare" }).click();

  // Dare revelado inline
  await expect(page.getByRole("button", { name: "Start now" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Another dare" })).toBeVisible();

  // start → timer → finish → completion
  await page.getByRole("button", { name: "Start now" }).click();
  await page.getByRole("button", { name: "Finish dare" }).click();
  await expect(page.getByText("Dare completed.")).toBeVisible();
  await expect(page.getByText("Treat unlocked.")).toBeVisible();

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

  // check-in rápido → Dare revelado → View details abre el Detail
  await page.getByRole("button", { name: "Check in for my dare" }).click();
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
