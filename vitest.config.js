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
    include: ["**/__tests__/**/*.{test,spec}.{js,jsx,ts,tsx}"],
    testTimeout: 30000,
    hookTimeout: 30000,
    server: {
      deps: {
        inline: ["date-fns"],
      },
    },
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "."),
      "date-fns": resolve(__dirname, "node_modules/date-fns/index.js"),
    },
  },
});
