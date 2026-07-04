import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// base must match the repository name exactly — GitHub Pages serves the project
// site at https://joxemari.github.io/Dare/ (case-sensitive path), and without a
// matching base the built assets 404. The repo is "Dare" (a case-only rename to
// "dare" isn't possible: GitHub treats the names as identical).
export default defineConfig({
  base: "/Dare/",
  plugins: [react(), tailwindcss()],
});
