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

    const logoutButton = page.getByRole("button", { name: /log\s*out/i }).first();
    if (await logoutButton.isVisible()) {
      await logoutButton.click();
    }

    await page.waitForURL("/");
    const cookies = await page.context().cookies();
    const authToken = cookies.find((c) => c.name === "authToken");
    expect(authToken).toBeUndefined();
  });
});
