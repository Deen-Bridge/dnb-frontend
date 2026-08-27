import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  plugins: [react()],
  css: {
    // Bypass the project's postcss.config.mjs (Tailwind 4 string-plugin format
    // is not compatible with Vite's internal PostCSS loader used by Vitest).
    // Tests don't need CSS processing.
    postcss: {
      plugins: [],
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.js"],
    include: ["**/__tests__/**/*.{test,spec}.{js,jsx}"],
  },
  resolve: {
    alias: {
      "@/app/account": resolve(__dirname, "app/[locale]/account"),
      "@/app/dashboard": resolve(__dirname, "app/[locale]/dashboard"),
      "@": resolve(__dirname, "."),
    },
  },
});
