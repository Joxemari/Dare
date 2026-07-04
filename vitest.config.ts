import { defineConfig } from "vitest/config";

// Config de test separada de vite.config.ts a propósito: el deploy a Pages
// (vite build) no debe depender de nada de test. Vitest usa este fichero;
// vite build sigue usando vite.config.ts.
export default defineConfig({
  test: {
    // La lógica de negocio de src/lib y src/data es pura y no toca el DOM,
    // así que el entorno 'node' basta y arranca más rápido. Si algún día se
    // testea storage.ts (localStorage) o componentes, cambiar a 'jsdom' e
    // instalar el paquete correspondiente.
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
