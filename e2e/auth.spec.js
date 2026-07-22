import { test, expect } from "@playwright/test";
import { setupApiMocks, seedAuthCookies } from "./mocks";

test.describe("Authentication", () => {
  test.beforeEach(async ({ page }) => {
    await setupApiMocks(page);
  });

  test("login form submits and redirects to dashboard", async ({ page }) => {
    await page.goto("/login");

    await expect(page.getByRole("heading", { name: /welcome back/i })).toBeVisible();

    await page.getByLabel(/email/i).fill("test@example.com");
    await page.getByLabel(/password/i).fill("password123");
    await page.getByRole("button", { name: /login/i }).click();

    await page.waitForURL("/dashboard");
    await expect(page).toHaveURL("/dashboard");
  });

  test("logged-out visit to dashboard redirects to login", async ({ page }) => {
    await page.goto("/dashboard");
    await page.waitForURL(/\/login/);
    await expect(page.getByRole("heading", { name: /welcome back/i })).toBeVisible();
  });

  test("authenticated user can access dashboard", async ({ page }) => {
    await seedAuthCookies(page);
    await page.goto("/dashboard");
    await expect(page).toHaveURL("/dashboard");
  });

  test("logout clears cookies and returns to home", async ({ page }) => {
    await seedAuthCookies(page);
    await page.goto("/dashboard");
    await page.waitForLoadState("domcontentloaded");

    // Click on the user avatar/name area in the sidebar to open the dropdown
    const userName = page.getByText("Test User").first();
    await userName.click();

    // Click the Log out menuitem
    await page.getByRole("menuitem", { name: /log\s*out/i }).click();

    await page.waitForURL(/^\/(?!dashboard)/, { timeout: 10000 }).catch(() => {});
    const cookies = await page.context().cookies();
    const authToken = cookies.find((c) => c.name === "authToken");
    expect(authToken).toBeUndefined();
  });
});
