import { test, expect } from "@playwright/test";
import { setupApiMocks, seedAuthCookies, mockRoute } from "./mocks";
import courseDetailFixture from "./fixtures/course-detail.json";
import paymentInitFixture from "./fixtures/payment-init.json";
import paymentSubmitFixture from "./fixtures/payment-submit.json";
import paymentErrorFixture from "./fixtures/payment-error.json";

test.describe("Stellar Payment", () => {
  test.beforeEach(async ({ page }) => {
    await setupApiMocks(page);
    await seedAuthCookies(page);
  });

  test("full payment happy path: preview → confirm → processing → success", async ({
    page,
  }) => {
    // Navigate to a paid course
    await mockRoute(page, "GET", "**/api/courses/course-001", courseDetailFixture);
    await page.goto("/dashboard/courses/course-001");
    await page.waitForLoadState("networkidle");

    // Open payment modal
    await page.getByRole("button", { name: /pay \$25 with stellar/i }).click();

    // Preview step — wallet is connected via fixture, so skip connect step
    await expect(page.getByText("Review your purchase details")).toBeVisible();
    await expect(page.getByText("Introduction to Islamic Finance")).toBeVisible();
    await expect(page.getByText("$25 USDC")).toBeVisible();

    // Click Continue to initiate payment
    await page.getByRole("button", { name: /continue/i }).click();

    // Confirm step
    await expect(page.getByText("Confirm payment in your wallet")).toBeVisible();
    await expect(page.getByText(/sending/i)).toBeVisible();
    await expect(page.getByText("$25 USDC")).toBeVisible();

    // Click Sign & Pay
    await page.getByRole("button", { name: /sign & pay/i }).click();

    // Processing step
    await expect(page.getByText("Processing your payment...")).toBeVisible();

    // Success step
    await expect(page.getByText("Payment Complete!")).toBeVisible({ timeout: 10000 });
    await expect(page.getByText("Payment Successful!")).toBeVisible();
    await expect(page.getByText("You now have access to")).toBeVisible();

    // Check explorer link exists
    await expect(page.getByText(/view on stellar explorer/i)).toBeVisible();

    // Close modal
    await page.getByRole("button", { name: /done/i }).click();
    await expect(page.getByText("Payment Complete!")).not.toBeVisible();
  });

  test("payment failure shows error step", async ({ page }) => {
    await mockRoute(page, "GET", "**/api/courses/course-001", courseDetailFixture);
    await mockRoute(
      page,
      "POST",
      "**/api/stellar/payment/initialize",
      paymentInitFixture
    );
    await mockRoute(
      page,
      "POST",
      "**/api/stellar/payment/submit",
      paymentErrorFixture,
      400
    );

    await page.goto("/dashboard/courses/course-001");
    await page.waitForLoadState("networkidle");

    // Open and start payment
    await page.getByRole("button", { name: /pay \$25 with stellar/i }).click();
    await page.getByRole("button", { name: /continue/i }).click();

    await expect(page.getByText("Confirm payment in your wallet")).toBeVisible();
    await page.getByRole("button", { name: /sign & pay/i }).click();

    // Error step
    await expect(page.getByText("Payment Failed")).toBeVisible({ timeout: 10000 });
    await expect(
      page.getByText(/trustline/i)
    ).toBeVisible();

    // Close modal
    await page.getByRole("button", { name: /close/i }).click();
  });

  test("initialize carries expected payload", async ({ page }) => {
    const initRequests = [];
    await page.route("**/api/stellar/payment/initialize", async (route, request) => {
      initRequests.push({
        method: request.method(),
        body: request.postDataJSON(),
        headers: request.headers(),
      });
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(paymentInitFixture),
      });
    });

    await mockRoute(page, "GET", "**/api/courses/course-001", courseDetailFixture);
    await page.goto("/dashboard/courses/course-001");
    await page.waitForLoadState("networkidle");

    await page.getByRole("button", { name: /pay \$25 with stellar/i }).click();
    await page.getByRole("button", { name: /continue/i }).click();

    // Wait for the init request
    await expect.poll(() => initRequests.length).toBe(1);

    const req = initRequests[0];
    expect(req.body).toMatchObject({
      itemType: "course",
      itemId: "course-001",
    });
    expect(req.body.buyerWallet).toBeTruthy();
  });

  test("submit carries expected payload", async ({ page }) => {
    const submitRequests = [];
    await page.route("**/api/stellar/payment/submit", async (route, request) => {
      submitRequests.push({
        method: request.method(),
        body: request.postDataJSON(),
      });
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(paymentSubmitFixture),
      });
    });

    await page.route("**/api/stellar/payment/initialize", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(paymentInitFixture),
      });
    });

    await mockRoute(page, "GET", "**/api/courses/course-001", courseDetailFixture);
    await page.goto("/dashboard/courses/course-001");
    await page.waitForLoadState("networkidle");

    await page.getByRole("button", { name: /pay \$25 with stellar/i }).click();
    await page.getByRole("button", { name: /continue/i }).click();
    await expect(page.getByText("Confirm payment in your wallet")).toBeVisible();
    await page.getByRole("button", { name: /sign & pay/i }).click();

    await expect(page.getByText("Payment Complete!")).toBeVisible({ timeout: 10000 });

    expect(submitRequests.length).toBe(1);
    const req = submitRequests[0];
    expect(req.body).toMatchObject({
      transactionId: "txn-e2e-001",
    });
    expect(req.body.signedXdr).toBeTruthy();
  });
});
