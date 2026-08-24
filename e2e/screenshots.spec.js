import { test } from "@playwright/test";
import path from "path";

// Generates the /ar screenshots referenced by the PR (hero, a card section, the
// dashboard shell, and an LTR-wrapped financial value). Run with:
//   npx playwright test e2e/screenshots.spec.js
const OUT = path.resolve(process.cwd(), "docs/i18n-rtl");

test.use({ viewport: { width: 1280, height: 900 } });

test("capture /ar hero (RTL, mirrored)", async ({ page }) => {
  await page.goto("/ar");
  await page.waitForSelector("h1");
  await page.screenshot({ path: path.join(OUT, "ar-hero.png") });
});

test("capture /ar featured card section (mirrored cards)", async ({ page }) => {
  await page.goto("/ar");
  const explore = page.locator("#explore");
  await explore.scrollIntoViewIfNeeded();
  await page.waitForTimeout(600);
  await explore.screenshot({ path: path.join(OUT, "ar-featured-cards.png") });
});

test("capture /ar Stellar section (LTR-wrapped financial figures)", async ({
  page,
}) => {
  await page.goto("/ar");
  const ltr = page.locator('[dir="ltr"]').first();
  await ltr.scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(OUT, "ar-ltr-financial.png") });
});

test("capture /ar dashboard shell (sidebar on the right)", async ({
  browser,
}) => {
  // The SSR-rendered dashboard shell (sidebar + header) is what we want to show.
  // Disabling JS renders the server HTML without hydration — so the client-side
  // auth guard doesn't redirect and the data widgets (which hit a stub API in
  // this env) don't run. The mirrored shell is exactly the SSR output.
  const ctx = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 1280, height: 900 },
  });
  const page = await ctx.newPage();
  await page.goto("http://localhost:3123/ar/dashboard");
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(OUT, "ar-dashboard-shell.png") });
  await ctx.close();
});
