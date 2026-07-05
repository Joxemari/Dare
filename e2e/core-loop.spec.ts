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
  // Tras el onboarding aparece el ritual de la carta del día (una vez al día);
  // lo saltamos para llegar a Today.
  await page.getByRole("button", { name: "Skip for now" }).click();
  // Today mínimo: masthead (logo DARE + fecha + headline rotatorio) + el Dare
  // como héroe. El headline rota por día, así que anclamos en algo estable:
  // el logo DARE del masthead y la card del Dare.
  await expect(page.getByRole("img", { name: "DARE" })).toBeVisible();
  await expect(page.getByText("YOUR DARE OF THE DAY")).toBeVisible();
}

test("Today: mínimo (solo Dare) + 'Just dare me' un toque, loop sin errores", async ({ page }) => {
  const errors = guardPageErrors(page);
  await enterApp(page);

  // Today es mínimo: NO hay card pull ni Today's Door; solo el Dare + Journeys.
  // La card cerrada ofrece Start check-in + Just dare me (en la propia card).
  await expect(page.getByText("Skips the questions. Uses what we know.")).toBeVisible();
  await expect(page.getByText("No Journey started yet.")).toBeVisible();
  await expect(page.getByText("DRAW YOUR CARD FOR TODAY")).toHaveCount(0);
  await expect(page.getByText("Today's Door")).toHaveCount(0);

  // "Just dare me": un toque genera y revela el Dare INLINE, sin entrar en el Dare
  await page.getByRole("button", { name: "Just dare me" }).click();

  // Dare revelado inline
  await expect(page.getByRole("button", { name: "Start now" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Another dare" })).toBeVisible();
  // "View details" se retiró (los detalles se ven siempre en Your Dare)
  await expect(page.getByRole("button", { name: "View details" })).toHaveCount(0);

  // "Start now" abre SIEMPRE Your Dare (Detail) para explicar el Dare
  await page.getByRole("button", { name: "Start now" }).click();
  await expect(page.getByText("What this is")).toBeVisible();
  // desde Your Dare se empieza → timer → finish → completion
  await page.getByRole("button", { name: "Start dare" }).click();
  await page.getByRole("button", { name: "Finish dare" }).click();
  await expect(page.getByText("Dare completed.")).toBeVisible();
  await expect(page.getByText("Treat unlocked.")).toBeVisible();

  // el Treat es el héroe: se revela de un toque (celebración + texto del treat).
  // La tarjeta tiene animación `pulse` (nunca "stable"): forzamos el click.
  await page.getByText("Tap to reveal").click({ force: true });

  // no debe aparecer XP en ninguna parte visible de la completion
  const body = (await page.locator("body").innerText()).toLowerCase();
  expect(body).not.toMatch(/\bxp\b/);

  // volver a Today (Dare de hoy ya hecho) — la pregunta de energía se retiró
  await page.getByRole("button", { name: "Back home" }).click();
  await expect(page.getByText("Done for today.", { exact: true })).toBeVisible();

  expect(errors, errors.join("\n")).toEqual([]);
});

test("Dare page: What this is / Why this works, sin Treat Locked + Plan for later", async ({ page }) => {
  const errors = guardPageErrors(page);
  await enterApp(page);

  // "Start check-in" abre el ÚNICO check-in: la pantalla completa "How are you today?"
  await page.getByRole("button", { name: "Start check-in" }).click();
  await expect(page.getByText("How are you today?")).toBeVisible();
  // Ya NO hay escala de Energy: la deriva el Mood. Tres preguntas.
  await page.getByRole("button", { name: "10 min", exact: true }).click(); // time
  await page.getByRole("button", { name: "Home", exact: true }).click(); // location
  await page.getByRole("button", { name: "Normal", exact: true }).click(); // mental state
  // "Get my dare" navega directo al Detail
  await page.getByRole("button", { name: "Get my dare" }).click();

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

test("Daily Card: ritual de apertura una vez al día, saltable, gate persistente", async ({ page }) => {
  const errors = guardPageErrors(page);
  // Siembra un store YA onboarded, solo si no existe: así el reload conserva lo
  // que la app persista (no lo re-siembra), a diferencia de un clear() en cada
  // navegación. Sin `version` → load() lo pasa por migrate (merge sobre defaults).
  await page.addInitScript(() => {
    if (!localStorage.getItem("dare:v7"))
      localStorage.setItem("dare:v7", JSON.stringify({ onboarded: true }));
  });
  await page.goto("/Dare/");

  // al abrir la app aparece el ritual de las 3 cartas (una vez al día)
  await expect(page.getByText("Draw your card.")).toBeVisible();
  await expect(page.getByRole("button", { name: "Skip for now" })).toBeVisible();

  // saltar → Today
  await page.getByRole("button", { name: "Skip for now" }).click();
  await expect(page.getByText("YOUR DARE OF THE DAY")).toBeVisible();

  // gate "una vez al día": tras saltar NO reaparece al recargar la app
  await page.reload();
  await expect(page.getByText("YOUR DARE OF THE DAY")).toBeVisible();
  await expect(page.getByText("Draw your card.")).toHaveCount(0);

  // la carta se saca desde You: elegir una la revela a pantalla completa
  await page.getByRole("button", { name: /You/ }).click();
  await expect(page.getByText("DRAW YOUR CARD FOR TODAY")).toBeVisible();
  await page.locator('button[aria-label="Face-down daily card"]').first().click();
  await expect(page.getByText("Tap to continue")).toBeVisible();
  await page.getByText("Tap to continue").click();

  expect(errors, errors.join("\n")).toEqual([]);
});

test("Journey day sin dareId: Start lanza un Dare del Journey, no el check-in", async ({ page }) => {
  const errors = guardPageErrors(page);
  // Siembra Still Water ACTIVO (su día 1 = recovery, SIN dareId) y salta el
  // ritual de la carta (cardIntroDate = hoy) para abrir directo en Today.
  await page.addInitScript(() => {
    const d = new Date();
    const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    if (!localStorage.getItem("dare:v7"))
      localStorage.setItem(
        "dare:v7",
        JSON.stringify({ onboarded: true, journeyId: "water", activeJourneyIds: ["water"], cardIntroDate: today }),
      );
  });
  await page.goto("/Dare/");

  // Today abre directo (sin ritual) y el Journey activo ofrece un "Continue"
  await expect(page.getByRole("img", { name: "DARE" })).toBeVisible();
  await page.getByRole("button", { name: "Continue", exact: true }).click();

  // Debe caer en el Dare (Detail), NUNCA en el check-in "How are you today?"
  await expect(page.getByText("What this is")).toBeVisible();
  await expect(page.getByText("How are you today?")).toHaveCount(0);

  expect(errors, errors.join("\n")).toEqual([]);
});
