import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// base '/dare/' is critical: without it the built assets 404 on GitHub Pages
// (the site is served from https://joxemari.github.io/dare/).
export default defineConfig({
  base: "/dare/",
  plugins: [react(), tailwindcss()],
});
