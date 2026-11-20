import { expect, test } from "@playwright/test";

const journeys = [
  { name: "signup", path: process.env.SMOKE_SIGNUP_PATH || "/en/signup", authRequired: false },
  { name: "login and Google login", path: process.env.SMOKE_LOGIN_PATH || "/en/login", authRequired: false },
  { name: "course browse and resume", path: process.env.SMOKE_COURSES_PATH || "/en/dashboard/courses", authRequired: true },
  { name: "scholarship state", path: process.env.SMOKE_SCHOLARSHIPS_PATH || "/en/dashboard/scholarships", authRequired: true },
  { name: "video-call authorization", path: process.env.SMOKE_CALL_PATH || "/en/dashboard/spaces", authRequired: true },
  { name: "safe payment preview", path: process.env.SMOKE_PAYMENT_PATH || "/en/dashboard/sadaqah", authRequired: true },
];

test.describe("production critical-journey smoke contract (#700)", () => {
  test.describe.configure({ mode: "serial" });

  test.beforeEach(async ({ page }, testInfo) => {
    page.on("response", (response) => {
      const requestId = response.headers()["x-request-id"] || response.headers()["x-correlation-id"];
      if (requestId) testInfo.annotations.push({ type: "request-id", description: requestId });
    });
  });

  for (const journey of journeys) {
    test(journey.name, async ({ page }, testInfo) => {
      if (journey.authRequired && !process.env.SMOKE_STORAGE_STATE) {
        test.skip(true, "Provide SMOKE_STORAGE_STATE with stable staging test data for authenticated journeys.");
      }

      const response = await page.goto(journey.path, { waitUntil: "domcontentloaded" });
      expect(response, `${journey.name} did not return a document`).not.toBeNull();
      expect(response.status(), `${journey.name} returned a server error`).toBeLessThan(500);

      await expect(page.locator("body")).not.toContainText(/application error|internal server error/i);

      await testInfo.attach("smoke-environment", {
        body: Buffer.from(JSON.stringify({
          journey: journey.name,
          targetOrigin: new URL(testInfo.project.use.baseURL).origin,
          nodeEnvironment: process.env.NODE_ENV || "test",
          authenticated: Boolean(process.env.SMOKE_STORAGE_STATE),
          path: journey.path,
        }, null, 2)),
        contentType: "application/json",
      });
    });
  }
});
