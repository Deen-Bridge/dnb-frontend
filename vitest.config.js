import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.js"],
    // Only scan test files — keeps coverage fast
    include: ["**/__tests__/**/*.{test,spec}.{js,jsx}"],
  },
  resolve: {
    alias: {
      // Mirror the Next.js @/ path alias
      "@": resolve(__dirname, "."),
    },
  },
});
