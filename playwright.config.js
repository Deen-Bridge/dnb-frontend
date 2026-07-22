// @ts-check
import { defineConfig, devices } from "@playwright/test";

const PORT = 3333;
const BASE_URL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ["html", { outputFolder: "playwright-report" }],
    ["list"],
  ],
  outputDir: "test-results",

  use: {
    baseURL: BASE_URL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },

  webServer: {
    command: "npm run build && npm run start",
    port: PORT,
    timeout: 120 * 1000,
    reuseExistingServer: !process.env.CI,
    cwd: ".",
    env: {
      NODE_ENV: "production",
      NEXT_PUBLIC_API_URL: "http://localhost:9999/api",
      NEXT_PUBLIC_STELLAR_NETWORK: "testnet",
      NEXT_PUBLIC_E2E_WALLET: "true",
      NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: "test",
      NEXT_PUBLIC_CLOUDINARY_API_KEY: "test",
      NEXT_PUBLIC_CLOUDINARY_API_SECRET: "test",
      NEXT_PUBLIC_CLOUDINARY_URL: "https://test.cloudinary.com",
      NEXT_PUBLIC_JITSI_DOMAIN: "https://meet.jit.si",
      DNB_API_URL: "http://localhost:9999/api",
      NEXT_PUBLIC_SOCKET_URL: "http://localhost:9999",
    },
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
