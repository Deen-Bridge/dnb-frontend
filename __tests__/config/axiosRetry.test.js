/**
 * Axios retry-policy tests (issue #75)
 * ------------------------------------
 * The response interceptor used to replay ANY request that failed with a 5xx,
 * regardless of method. A 500 does not mean the server declined the request —
 * it may have processed it and then died. Replaying a mutation therefore risks
 * resubmitting an already-accepted Stellar payment (double charge) or creating
 * duplicate purchases, enrollments and reviews.
 *
 * These tests drive the REAL axiosInstance and its REAL interceptor; only the
 * network adapter is swapped so requests can be counted. Counting requests at
 * the adapter is the same place a mock server would see them, which is what the
 * issue asks to observe.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import axiosInstance from "@/lib/config/axios.config";

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");

// ── Adapter that always fails with a given status and counts calls ─────────

let sent = [];

function makeAxiosError(config, status) {
  const error = new Error(`Request failed with status code ${status}`);
  error.isAxiosError = true;
  error.config = config;
  error.response = {
    data: { message: "Internal Server Error" },
    status,
    statusText: "Internal Server Error",
    headers: {},
    config,
  };
  return error;
}

/** Fails every call with `status`. */
function alwaysFailing(status) {
  return (config) => {
    sent.push(config);
    return Promise.reject(makeAxiosError(config, status));
  };
}

/** Fails the first call with `status`, then succeeds. */
function failThenSucceed(status) {
  return (config) => {
    sent.push(config);
    if (sent.length === 1) {
      return Promise.reject(makeAxiosError(config, status));
    }
    return Promise.resolve({
      data: { recovered: true },
      status: 200,
      statusText: "OK",
      headers: {},
      config,
    });
  };
}

let originalAdapter;

beforeEach(() => {
  sent = [];
  originalAdapter = axiosInstance.defaults.adapter;
});

afterEach(() => {
  axiosInstance.defaults.adapter = originalAdapter;
  document.cookie =
    "authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
  vi.restoreAllMocks();
});

// ---------------------------------------------------------------------------

describe("issue #75 — mutations are never auto-retried on 5xx", () => {
  it("does not retry POST /api/stellar/payment/submit", async () => {
    axiosInstance.defaults.adapter = alwaysFailing(500);

    await expect(
      axiosInstance.post("/api/stellar/payment/submit", {
        transactionId: "tx_1",
        signedXdr: "AAAAA...signed",
      })
    ).rejects.toMatchObject({ response: { status: 500 } });

    // Exactly one request reached the wire — the signed XDR was submitted once.
    expect(sent).toHaveLength(1);
  });

  it("does not retry POST /api/stellar/payment/initialize", async () => {
    axiosInstance.defaults.adapter = alwaysFailing(500);

    await expect(
      axiosInstance.post("/api/stellar/payment/initialize", { itemId: "c1" })
    ).rejects.toBeTruthy();

    expect(sent).toHaveLength(1);
  });

  it.each([
    ["post", "/api/purchase/book"],
    ["put", "/api/users/update/u1"],
    ["patch", "/api/courses/c1/reviews/r1"],
    ["delete", "/api/spaces/s1"],
  ])("does not retry %s %s", async (method, url) => {
    axiosInstance.defaults.adapter = alwaysFailing(500);

    await expect(axiosInstance({ method, url })).rejects.toBeTruthy();

    expect(sent).toHaveLength(1);
  });

  it("surfaces the original server error to the caller on the first failure", async () => {
    axiosInstance.defaults.adapter = alwaysFailing(503);

    const error = await axiosInstance
      .post("/api/stellar/payment/submit", {})
      .catch((e) => e);

    expect(error.response.status).toBe(503);
    expect(error.response.data.message).toBe("Internal Server Error");
    expect(sent).toHaveLength(1);
  });
});

describe("issue #75 — idempotent requests still retry once", () => {
  it("retries a GET exactly once, after roughly a second", async () => {
    axiosInstance.defaults.adapter = alwaysFailing(500);

    const startedAt = Date.now();
    await expect(axiosInstance.get("/api/courses")).rejects.toBeTruthy();
    const elapsed = Date.now() - startedAt;

    // Original + one retry, and no more.
    expect(sent).toHaveLength(2);
    expect(elapsed).toBeGreaterThanOrEqual(900);
  });

  it("recovers when the retried GET succeeds", async () => {
    axiosInstance.defaults.adapter = failThenSucceed(500);

    const res = await axiosInstance.get("/api/courses");

    expect(res.data).toEqual({ recovered: true });
    expect(sent).toHaveLength(2);
  });

  it("retries HEAD and OPTIONS too", async () => {
    axiosInstance.defaults.adapter = alwaysFailing(500);
    await expect(axiosInstance.head("/api/courses")).rejects.toBeTruthy();
    expect(sent).toHaveLength(2);

    sent = [];
    await expect(
      axiosInstance({ method: "options", url: "/api/courses" })
    ).rejects.toBeTruthy();
    expect(sent).toHaveLength(2);
  });

  it("does not retry a GET that fails with 4xx", async () => {
    axiosInstance.defaults.adapter = alwaysFailing(404);

    await expect(axiosInstance.get("/api/courses/missing")).rejects.toBeTruthy();

    expect(sent).toHaveLength(1);
  });
});

describe("issue #75 — explicit per-request opt-in", () => {
  it("retries a POST that sets retryOnServerError: true", async () => {
    axiosInstance.defaults.adapter = alwaysFailing(500);

    await expect(
      axiosInstance.post(
        "/api/idempotent-thing",
        { idempotencyKey: "key_1" },
        { retryOnServerError: true }
      )
    ).rejects.toBeTruthy();

    expect(sent).toHaveLength(2);
  });

  it("replays the identical idempotency key rather than a fresh request", async () => {
    axiosInstance.defaults.adapter = alwaysFailing(500);

    await axiosInstance
      .post(
        "/api/idempotent-thing",
        { idempotencyKey: "key_1" },
        { retryOnServerError: true }
      )
      .catch(() => {});

    expect(sent).toHaveLength(2);
    expect(JSON.parse(sent[0].data)).toEqual({ idempotencyKey: "key_1" });
    expect(JSON.parse(sent[1].data)).toEqual({ idempotencyKey: "key_1" });
  });

  it("lets a GET opt OUT with retryOnServerError: false", async () => {
    axiosInstance.defaults.adapter = alwaysFailing(500);

    await expect(
      axiosInstance.get("/api/courses", { retryOnServerError: false })
    ).rejects.toBeTruthy();

    expect(sent).toHaveLength(1);
  });
});

describe("issue #75 — console noise", () => {
  /** Capture everything written to the console while `fn` runs. */
  async function captureConsole(fn) {
    const spies = ["log", "info", "warn", "error", "debug"].map((level) =>
      vi.spyOn(console, level).mockImplementation(() => {})
    );
    try {
      await fn();
      return spies
        .flatMap((spy) => spy.mock.calls)
        .flat()
        .map((arg) => (typeof arg === "string" ? arg : String(arg)))
        .join(" ");
    } finally {
      spies.forEach((spy) => spy.mockRestore());
    }
  }

  it("writes nothing to the console at import time in a production build", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.resetModules();

    const output = await captureConsole(async () => {
      await import("@/lib/config/axios.config");
    });

    // The only import-time output in this graph is the missing-env warning in
    // lib/config/env.js, which is already gated on NODE_ENV. In a production
    // build the module graph must be silent.
    expect(output).toBe("");

    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("no source file logs the API base URL", () => {
    // The base-URL banner the issue describes must not come back.
    const sources = [
      "lib/config/axios.config.js",
      "lib/config/env.js",
    ].map((relative) => readFileSync(resolve(REPO_ROOT, relative), "utf8"));

    for (const source of sources) {
      expect(source).not.toContain("API Base URL");
      expect(source).not.toMatch(/console\.log\([^)]*baseURL/);
      expect(source).not.toMatch(/console\.log\([^)]*apiUrl/);
    }
  });
});
