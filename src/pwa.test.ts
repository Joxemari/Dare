import { describe, it, expect } from "vitest";
import manifestRaw from "../public/manifest.webmanifest?raw";
import htmlRaw from "../index.html?raw";

/*
 * Integridad de los assets PWA (mismo espíritu que tarot.test.ts): no es lógica
 * de negocio, pero un manifest roto o un icono que falta pasa el typecheck y el
 * build y solo se descubre al intentar instalar la app. Este test lo caza en CI.
 *
 * Se apoya en features de Vite (`?raw` e `import.meta.glob`) en vez de `node:fs`,
 * para no arrastrar @types/node al tsconfig de la app (que es browser). El glob
 * enumera los ficheros REALES en disco; sus claves son rutas relativas a este
 * fichero, así que comparamos por nombre de fichero.
 */
const manifest = JSON.parse(manifestRaw);
const publicIcons = new Set(Object.keys(import.meta.glob("../public/icons/*")).map((p) => p.split("/").pop()));
const publicRoot = new Set(Object.keys(import.meta.glob("../public/*")).map((p) => p.split("/").pop()));
const basename = (src: string) => src.split("/").pop();

describe("PWA — manifest e iconos", () => {
  it("el manifest declara los campos mínimos de instalación", () => {
    expect(manifest.name).toBeTruthy();
    expect(manifest.short_name).toBeTruthy();
    expect(manifest.display).toBe("standalone");
    // Rutas relativas → base-agnósticas (resuelven contra /Dare/).
    expect(manifest.start_url).toBe(".");
    expect(manifest.scope).toBe(".");
  });

  it("cada icono del manifest existe en disco y su ruta es relativa", () => {
    expect(Array.isArray(manifest.icons)).toBe(true);
    expect(manifest.icons.length).toBeGreaterThan(0);
    for (const icon of manifest.icons) {
      expect(icon.src.startsWith("/")).toBe(false); // relativa, no absoluta
      expect(publicIcons.has(basename(icon.src))).toBe(true);
    }
  });

  it("declara al menos un icono 512 'any' y uno 'maskable'", () => {
    const purposes = manifest.icons.flatMap((i: { purpose?: string }) => (i.purpose || "any").split(" "));
    expect(purposes).toContain("any");
    expect(purposes).toContain("maskable");
    const has512 = manifest.icons.some((i: { sizes: string }) => i.sizes.includes("512x512"));
    expect(has512).toBe(true);
  });

  it("existen el apple-touch-icon y el service worker", () => {
    expect(publicIcons.has("apple-touch-icon-180.png")).toBe(true);
    expect(publicRoot.has("sw.js")).toBe(true);
  });

  it("index.html enlaza el manifest y el apple-touch-icon", () => {
    expect(htmlRaw).toMatch(/rel="manifest"/);
    expect(htmlRaw).toMatch(/rel="apple-touch-icon"/);
    expect(htmlRaw).toMatch(/apple-mobile-web-app-capable/);
  });
});
