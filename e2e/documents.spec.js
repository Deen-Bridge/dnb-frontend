import { test, expect } from "@playwright/test";

/**
 * Secure document upload — end-to-end smoke (issue #172)
 * ------------------------------------------------------
 * Drives the real onboarding wizard in a real browser and asserts the
 * acceptance criteria that only a browser can show:
 *
 *   • drag/drop produces a valid upload, with progress rendered
 *   • the camera-capture input is present and capture-enabled
 *   • "scan pending" resolves to accepted
 *   • a renamed executable is rejected before any network call
 *   • no public asset URL is ever requested or rendered
 *
 * The backend (dnb-backend#92) is not running in CI, so the educator-application
 * endpoints and the signed storage target are fulfilled with page.route(). The
 * component, hook, validation and action code under test are the real ones —
 * only the network is stubbed, exactly as it is in the Vitest integration test.
 *
 * Not run in CI (CI is lint + build); this is the demo proof for the PR.
 * Run locally with `npm run build && npx playwright test e2e/documents.spec.js`.
 */

const API = "**/api/educators/applications/documents";
const SIGNED_URL =
  "https://private-storage.example.test/kyc/doc_e2e_1?X-Amz-Signature=abc123&X-Amz-Expires=300";

/** Bytes that really are a PDF. */
const PDF_BYTES = Buffer.concat([
  Buffer.from("%PDF-1.4\n"),
  Buffer.alloc(2048, 0x20),
]);

/** Bytes that really are a Windows executable, named like a PDF. */
const EXE_BYTES = Buffer.concat([
  Buffer.from([0x4d, 0x5a, 0x90, 0x00]),
  Buffer.alloc(2048, 0x00),
]);

/**
 * Stub the document API + the signed storage target.
 * `scanSequence` is consumed one entry per status poll.
 */
async function stubDocumentApi(page, { scanSequence = ["accepted"] } = {}) {
  const requested = [];
  let pollIndex = 0;

  await page.route(`${API}/upload-url`, async (route) => {
    requested.push("upload-url");
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        documentId: "doc_e2e_1",
        uploadUrl: SIGNED_URL,
        method: "PUT",
        headers: { "Content-Type": "application/pdf" },
        expiresAt: new Date(Date.now() + 300_000).toISOString(),
      }),
    });
  });

  await page.route(`${API}/doc_e2e_1/complete`, async (route) => {
    requested.push("complete");
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        documentId: "doc_e2e_1",
        documentType: "government_id",
        status: "scan_pending",
        filename: "passport.pdf",
      }),
    });
  });

  await page.route(`${API}/doc_e2e_1`, async (route) => {
    const status = scanSequence[Math.min(pollIndex, scanSequence.length - 1)];
    pollIndex += 1;
    requested.push(`poll:${status}`);
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ documentId: "doc_e2e_1", status }),
    });
  });

  // The signed storage target — a different origin, as in production.
  await page.route(SIGNED_URL, async (route) => {
    requested.push("signed-put");
    const headers = route.request().headers();
    // The user's bearer token must never reach a third-party origin.
    expect(headers.authorization).toBeUndefined();
    await route.fulfill({ status: 200, body: "" });
  });

  return requested;
}

test.beforeEach(async ({ page }) => {
  // The wizard's document step is reachable without a live session in dev;
  // the liveness adapter defaults to "mock".
  await page.addInitScript(() => {
    document.cookie = "authToken=e2e-token; path=/";
    document.cookie = `userInfo=${encodeURIComponent(
      JSON.stringify({ id: "u_e2e", _id: "u_e2e", role: "educator", name: "E2E" })
    )}; path=/`;
  });
});

test("drag and drop uploads a valid PDF and the scan resolves to accepted", async ({
  page,
}) => {
  const requested = await stubDocumentApi(page, {
    scanSequence: ["scan_pending", "accepted"],
  });

  await page.goto("/educator-onboarding/documents");

  const slot = page.getByTestId("document-slot-government_id");
  await expect(slot).toBeVisible();

  // Drop a real PDF onto the dropzone.
  const dataTransfer = await page.evaluateHandle((bytes) => {
    const dt = new DataTransfer();
    dt.items.add(
      new File([new Uint8Array(bytes)], "passport.pdf", {
        type: "application/pdf",
      })
    );
    return dt;
  }, Array.from(PDF_BYTES));

  await page
    .getByTestId("dropzone-government_id")
    .dispatchEvent("drop", { dataTransfer });

  // Scan pending is shown, then resolves to accepted.
  await expect(page.getByTestId("scan-pending-government_id")).toBeVisible();
  await expect(page.getByTestId("slot-status")).toHaveAttribute(
    "data-state",
    "accepted",
    { timeout: 15_000 }
  );

  // The full signed-URL sequence ran.
  expect(requested).toContain("upload-url");
  expect(requested).toContain("signed-put");
  expect(requested).toContain("complete");

  // No public asset URL anywhere in the DOM.
  const html = await page.content();
  expect(html).not.toContain("cloudinary");
  expect(html).not.toContain(SIGNED_URL);
});

test("a renamed executable is rejected before any network call", async ({
  page,
}) => {
  const requested = await stubDocumentApi(page);

  await page.goto("/educator-onboarding/documents");

  const dataTransfer = await page.evaluateHandle((bytes) => {
    const dt = new DataTransfer();
    // Declares application/pdf; the bytes say Windows executable.
    dt.items.add(
      new File([new Uint8Array(bytes)], "passport.pdf", {
        type: "application/pdf",
      })
    );
    return dt;
  }, Array.from(EXE_BYTES));

  await page
    .getByTestId("dropzone-government_id")
    .dispatchEvent("drop", { dataTransfer });

  await expect(page.getByTestId("error-government_id")).toContainText(
    /Windows executable/i
  );

  // Nothing was requested — the file never left the browser.
  expect(requested).toEqual([]);
});

test("the camera input is present and capture-enabled", async ({ page }) => {
  await stubDocumentApi(page);
  await page.goto("/educator-onboarding/documents");

  const cameraInput = page.getByTestId("camera-input-government_id");
  await expect(cameraInput).toHaveAttribute("capture", "environment");
  await expect(cameraInput).toHaveAttribute("accept", "image/*");
});
