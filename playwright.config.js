import { defineConfig, devices } from "@playwright/test";

// E2E smoke tests for the next-intl / RTL work. Not run in CI (CI is lint +
// build only) — this is the "working demo (test output)" proof for the PR and
// the source of the /ar screenshots. Run locally with `npm run test:e2e`
// after `npm run build`.
const PORT = process.env.E2E_PORT || 3123;

export default defineConfig({
  testDir: "./e2e",
  timeout: 45_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  reporter: [["list"]],
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "off",
  },
  webServer: {
    command: `npx next start -p ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: true,
    timeout: 120_000,
    env: {
      NEXT_PUBLIC_API_URL: "https://api.example.com",
      NEXT_PUBLIC_STELLAR_NETWORK: "testnet",
    },
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
  ],
});
