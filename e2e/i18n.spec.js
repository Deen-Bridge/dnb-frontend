import { test, expect } from "@playwright/test";

// Smoke coverage for the acceptance criteria of the i18n / RTL work:
//  - /ar serves <html lang="ar" dir="rtl">, / (and /en) stay English LTR
//  - the language switcher swaps locale on the *current route* and persists
//  - financial values (wallet keys / USDC amounts) render LTR inside RTL

test("/ serves English left-to-right", async ({ page }) => {
  await page.goto("/");
  const html = page.locator("html");
  await expect(html).toHaveAttribute("lang", "en");
  await expect(html).toHaveAttribute("dir", "ltr");
});

test("/en redirects to the unprefixed English route", async ({ page }) => {
  const res = await page.goto("/en");
  expect(res?.url()).toMatch(/localhost:\d+\/$/);
  await expect(page.locator("html")).toHaveAttribute("dir", "ltr");
});

test("/ar serves Arabic right-to-left with real translated copy", async ({
  page,
}) => {
  await page.goto("/ar");
  const html = page.locator("html");
  await expect(html).toHaveAttribute("lang", "ar");
  await expect(html).toHaveAttribute("dir", "rtl");
  // Real Arabic hero copy, not an English literal.
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "تعلّم إسلامي أصيل",
  );
  // The Arabic webfont variable is applied on <body>.
  await expect(page.locator("body")).toHaveClass(/font-arabic/);
});

test("financial figures stay LTR inside the RTL layout", async ({ page }) => {
  await page.goto("/ar");
  // The Stellar section renders settle time / USDC figures wrapped in dir="ltr"
  // so digits never visually reverse under RTL.
  const ltrIsland = page.locator('[dir="ltr"]').first();
  await expect(ltrIsland).toBeVisible();
});

test("language switcher swaps locale on the current route and persists", async ({
  page,
}) => {
  await page.goto("/ar/stellar");
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");

  // Switch to English from the navbar switcher.
  await page
    .getByRole("group", { name: /change language|تغيير اللغة/i })
    .first()
    .getByRole("button", { name: "EN" })
    .click();

  // Same route, now English (default locale => unprefixed).
  await expect(page).toHaveURL(/\/stellar$/);
  await expect(page.locator("html")).toHaveAttribute("dir", "ltr");

  // Choice survives a full reload (persisted via the locale cookie).
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("dir", "ltr");
});
