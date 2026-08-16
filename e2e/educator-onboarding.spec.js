import { test, expect } from "@playwright/test";

const API_BASE = "http://localhost:5000";

/**
 * Mock the whole backend API surface. The specific educator + auth endpoints
 * return deterministic payloads; everything else (dashboard widgets) gets a
 * benign empty response so pages still render.
 *
 * The Path A test asserts (via `captured`) that sensitive documents are sent
 * through the backend-issued signed URL and never carry an unsigned preset.
 */
async function mockApi(page, { role = "educator" } = {}) {
  const captured = { uploadUrlBodies: [], signedPutUrls: [], cloudinaryRequests: [] };

  await page.route("**/api/**", async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const path = url.pathname;
    const method = request.method();
    console.log("[mock]", method, path);

    if (path.includes("/api/auth/verify-email/")) {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          message: "Email verified",
          accessToken: "test-access-token",
          user: { id: "u1", name: "Test Educator", role },
        }),
      });
    }

    if (path.includes("/api/educator-applications/liveness")) {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true, token: "liveness_tok_123" }),
      });
    }

    if (path.includes("/api/educator-applications/upload-url")) {
      let body = {};
      try {
        body = request.postDataJSON() || {};
      } catch {
        body = {};
      }
      captured.uploadUrlBodies.push(body);
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          uploadUrl: `${API_BASE}/api/educator-applications/signed-upload-mock`,
          publicId: "doc_123",
          method: "PUT",
        }),
      });
    }

    if (path.includes("/api/educator-applications/signed-upload-mock") && method === "PUT") {
      captured.signedPutUrls.push(request.url());
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ secure_url: "https://private.example/doc_123" }),
      });
    }

    if (path.endsWith("/api/educator-applications/skip")) {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true, status: "not_started" }),
      });
    }

    if (path.endsWith("/api/educator-applications") && method === "POST") {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          application: { _id: "app1", status: "pending" },
        }),
      });
    }

    // Catch-all for the rest of the dashboard/widget API surface.
    return route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        success: true,
        data: [],
        books: [],
        recommended: [],
        meta: {},
        user: { id: "u1", name: "Test Educator", role },
      }),
    });
  });

  // Track any attempt to hit Cloudinary directly (must stay empty).
  page.on("request", (request) => {
    if (request.url().includes("api.cloudinary.com")) {
      captured.cloudinaryRequests.push(request.url());
    }
  });

  return captured;
}

// Warm up dev compilation of the heavy /dashboard route (and the verify
// wizard) so first-hit Turbopack latency doesn't exceed the per-assertion
// timeout during the actual flows. Runs once per worker.
test.beforeAll(async ({ browser }) => {
  const page = await browser.newPage();
  await page.goto("/dashboard");
  await page.goto("/onboarding/educator/verify");
  await page.close();
});

test("educator completes Path A from verify-email and reaches verification pending", async ({
  page,
}) => {
  const captured = await mockApi(page, { role: "educator" });

  // The flow must originate from a successful verify-email token.
  await page.goto("/verify-email?token=valid-token");
  await expect(page.getByTestId("post-verification-continue")).toBeVisible();
  await page.getByTestId("post-verification-continue").click();

  // Fork is wired into verify-email: educators land on the branch selector, not /dashboard.
  await expect(page).toHaveURL(/\/onboarding\/educator$/);
  await expect(page.getByTestId("verify-now")).toBeVisible();

  await page.getByTestId("verify-now").click();
  await expect(page).toHaveURL(/\/onboarding\/educator\/verify$/);

  // Step 0 — liveness
  await page.getByTestId("start-liveness").click();
  await expect(page.getByText("Liveness check passed")).toBeVisible();
  await page.getByTestId("wizard-next").click();

  // Step 1 — government ID (signed flow)
  await page.setInputFiles('[data-testid="government-id-input"]', {
    name: "id.png",
    mimeType: "image/png",
    buffer: Buffer.from("fake-government-id"),
  });
  await page.getByTestId("wizard-next").click();

  // Step 2 — LinkedIn + required fields
  await page.getByTestId("full-name-input").fill("Test Educator");
  await page.getByTestId("linkedin-input").fill("https://linkedin.com/in/test-educator");
  await page.getByTestId("wizard-next").click();

  // Step 3 — teaching certificate (signed flow)
  await page.setInputFiles('[data-testid="certificate-input"]', {
    name: "cert.pdf",
    mimeType: "application/pdf",
    buffer: Buffer.from("fake-certificate"),
  });

  await page.getByTestId("submit-application").click();
  await expect(page.getByText("Verification pending")).toBeVisible();

  // Acceptance: sensitive documents go through the signed flow, never the
  // unsigned Cloudinary preset and never a direct Cloudinary call.
  expect(captured.uploadUrlBodies.length).toBeGreaterThan(0);
  for (const body of captured.uploadUrlBodies) {
    expect(Object.keys(body).map((k) => k.toLowerCase())).not.toContain(
      "upload_preset"
    );
  }
  expect(captured.signedPutUrls.length).toBeGreaterThan(0);
  expect(captured.cloudinaryRequests).toEqual([]);
});

test("educator can skip and lands on /dashboard with verification incomplete", async ({
  page,
}) => {
  await mockApi(page, { role: "educator" });

  await page.goto("/verify-email?token=valid-token");
  await expect(page.getByTestId("post-verification-continue")).toBeVisible();
  await page.getByTestId("post-verification-continue").click();

  await expect(page.getByTestId("skip-for-now")).toBeVisible();
  await page.getByTestId("skip-for-now").click();

  await expect(page).toHaveURL(/\/dashboard$/, { timeout: 30_000 });
  await expect(page.getByTestId("verification-banner")).toBeVisible({
    timeout: 30_000,
  });
});

test("non-educator roles are unaffected and still route straight to the dashboard", async ({
  page,
}) => {
  await mockApi(page, { role: "student" });

  await page.goto("/verify-email?token=valid-token");
  await expect(page.getByTestId("post-verification-continue")).toBeVisible();
  await page.getByTestId("post-verification-continue").click();

  await expect(page).toHaveURL(/\/dashboard$/, { timeout: 30_000 });
  await expect(page.getByTestId("verification-banner")).toHaveCount(0);
});

test("a partially-filled wizard resumes from where it left off after reload", async ({
  page,
}) => {
  await mockApi(page, { role: "educator" });

  await page.goto("/verify-email?token=valid-token");
  await expect(page.getByTestId("post-verification-continue")).toBeVisible();
  await page.getByTestId("post-verification-continue").click();
  await page.getByTestId("verify-now").click();
  await expect(page).toHaveURL(/\/onboarding\/educator\/verify$/);

  // Complete the liveness step, which persists a draft via useDraftAutosave.
  await page.getByTestId("start-liveness").click();
  await expect(page.getByText("Liveness check passed")).toBeVisible();

  // Wait for the debounced autosave (500ms) before reloading.
  await page.waitForTimeout(1000);
  await page.reload();

  await expect(page.getByTestId("resume-draft")).toBeVisible();
  await page.getByTestId("resume-draft").click();
  await expect(page.getByText("Liveness check passed")).toBeVisible();
});
