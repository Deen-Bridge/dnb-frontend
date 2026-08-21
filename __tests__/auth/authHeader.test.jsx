/**
 * Auth header regression tests (issue #74)
 * ----------------------------------------
 * lib/config/req.header.config.js used to capture the auth cookie ONCE, at
 * module-evaluation time, and export a frozen `{ headers: { Authorization } }`
 * object that call sites passed as axios per-request config.
 *
 * Measured behaviour of that arrangement (axios v1 merges per-request config
 * BEFORE the request interceptor runs, so the interceptor wins whenever a
 * cookie is present): the stale header only surfaced when the interceptor had
 * nothing to set — i.e. whenever no authToken cookie existed at request time.
 * That covers two real cases:
 *
 *   • Logged out — requests carried a literal `Bearer undefined`.
 *   • After logout — the module still held the pre-logout JWT, so requests
 *     kept sending a real, still-valid credential after the cookie was
 *     cleared.
 *
 * The module also console.logged the raw JWT on every page load.
 *
 * These tests exercise the REAL request path: the actual axiosInstance (with
 * its real request interceptor) and the actual consumer functions, with only
 * the network adapter swapped out so outgoing headers can be inspected.
 *
 * Covers:
 *   1. A token set AFTER the module graph is imported is still attached
 *      (the "log in, act immediately, no page refresh" case).
 *   2. A refreshed/rotated token replaces the previous one on the next call.
 *   3. usePurchaseBook / usePurchaseCourse send a valid Authorization header.
 *   4. AuthProvider.refreshUser sends a valid Authorization header.
 *   5. No raw JWT is ever written to the console.
 *   6. req.header.config.js is gone and nothing imports it.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { readdirSync, readFileSync, existsSync, statSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

// ---------------------------------------------------------------------------
// IMPORTANT: these imports happen while NO auth cookie exists.
// That is precisely the scenario that used to poison the old module —
// the login page transitively imports this graph before the user logs in.
// ---------------------------------------------------------------------------
const mockPush = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: mockPush }) }));

import axiosInstance from "@/lib/config/axios.config";
import { usePurchaseBook, usePurchaseCourse } from "@/hooks/usePurchase";

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");

// ── Adapter that records outgoing requests instead of hitting the network ──

let sentRequests = [];
let respondWith = null;

function recordingAdapter(config) {
  sentRequests.push(config);
  const res = respondWith?.(config) ?? { status: 200, data: { success: true } };
  return Promise.resolve({
    data: res.data,
    status: res.status,
    statusText: "OK",
    headers: {},
    config,
  });
}

/** Authorization header of the Nth recorded request (axios normalises casing). */
function authHeaderOf(index = 0) {
  const headers = sentRequests[index]?.headers;
  return headers?.Authorization ?? headers?.authorization;
}

function setAuthCookie(token) {
  document.cookie = `authToken=${token}; path=/`;
}

function clearAuthCookie() {
  document.cookie = "authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
}

let originalAdapter;

beforeEach(() => {
  sentRequests = [];
  respondWith = null;
  originalAdapter = axiosInstance.defaults.adapter;
  axiosInstance.defaults.adapter = recordingAdapter;
  clearAuthCookie();
});

afterEach(() => {
  axiosInstance.defaults.adapter = originalAdapter;
  clearAuthCookie();
  vi.restoreAllMocks();
});

// ---------------------------------------------------------------------------

describe("issue #74 — the stale-token regression", () => {
  it("attaches a token that was set AFTER the module graph was imported", async () => {
    // The module graph above was imported with no cookie present.
    // Simulate the user logging in now.
    setAuthCookie("token-issued-at-login");

    await usePurchaseBook("book_123");

    expect(sentRequests).toHaveLength(1);
    expect(authHeaderOf(0)).toBe("Bearer token-issued-at-login");
  });

  it("never sends the literal 'Bearer undefined' the old module produced", async () => {
    setAuthCookie("token-issued-at-login");

    await usePurchaseBook("book_123");

    expect(authHeaderOf(0)).not.toBe("Bearer undefined");
    expect(authHeaderOf(0)).not.toContain("undefined");
  });

  it("picks up a rotated token on the very next request", async () => {
    setAuthCookie("first-token");
    await usePurchaseBook("book_123");

    setAuthCookie("rotated-token");
    await usePurchaseCourse("course_456");

    expect(authHeaderOf(0)).toBe("Bearer first-token");
    expect(authHeaderOf(1)).toBe("Bearer rotated-token");
  });

  it("sends no Authorization header at all when logged out", async () => {
    await usePurchaseBook("book_123");

    expect(authHeaderOf(0)).toBeUndefined();
  });

  it("stops sending the old token once the user logs out", async () => {
    // The worst consequence of the module-level capture: the header object
    // held a copy of the JWT that outlived the cookie, so every request after
    // logout still carried the old, still-valid credential.
    setAuthCookie("token-before-logout");
    await usePurchaseBook("book_123");
    expect(authHeaderOf(0)).toBe("Bearer token-before-logout");

    clearAuthCookie(); // user logs out
    await usePurchaseBook("book_456");

    expect(authHeaderOf(1)).toBeUndefined();
    expect(JSON.stringify(sentRequests[1].headers)).not.toContain(
      "token-before-logout"
    );
  });
});

describe("issue #74 — authenticated consumers still work", () => {
  it("usePurchaseBook posts to /api/purchase/book with a valid bearer token", async () => {
    setAuthCookie("purchase-token");

    const data = await usePurchaseBook("book_123");

    expect(sentRequests[0].url).toBe("/api/purchase/book");
    expect(sentRequests[0].method).toBe("post");
    expect(authHeaderOf(0)).toBe("Bearer purchase-token");
    expect(data).toEqual({ success: true });
  });

  it("usePurchaseCourse posts to the enroll endpoint with a valid bearer token", async () => {
    setAuthCookie("enroll-token");

    await usePurchaseCourse("course_456");

    expect(sentRequests[0].url).toBe("/api/courses/course_456/enroll");
    expect(sentRequests[0].method).toBe("post");
    expect(authHeaderOf(0)).toBe("Bearer enroll-token");
  });

  it("AuthProvider.refreshUser sends a valid bearer token", async () => {
    setAuthCookie("refresh-token");
    respondWith = () => ({
      status: 200,
      data: { user: { id: "u1", name: "Aisha", role: "educator" } },
    });

    // Rendered through the real provider so refreshUser runs its real path.
    const { render, screen, act } = await import("@testing-library/react");
    const React = await import("react");
    const { default: AuthProvider, useAuthContext } = await import(
      "@/components/providers/AuthProvider"
    );

    let ctx;
    function Probe() {
      ctx = useAuthContext();
      return React.createElement("span", null, "ready");
    }

    render(
      React.createElement(AuthProvider, null, React.createElement(Probe))
    );
    await screen.findByText("ready");

    await act(async () => {
      await ctx.refreshUser("u1");
    });

    const call = sentRequests.find((r) => r.url === "/api/users/u1");
    expect(call).toBeDefined();
    expect(
      call.headers?.Authorization ?? call.headers?.authorization
    ).toBe("Bearer refresh-token");
  });
});

describe("issue #74 — no credential leaks to the console", () => {
  it("writes no raw JWT to any console channel during an authenticated request", async () => {
    const JWT =
      "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1MSJ9.s3cr3t-signature-value";

    const spies = ["log", "info", "warn", "error", "debug"].map((level) =>
      vi.spyOn(console, level).mockImplementation(() => {})
    );

    setAuthCookie(JWT);
    await usePurchaseBook("book_123");

    const everythingLogged = spies
      .flatMap((spy) => spy.mock.calls)
      .flat()
      .map((arg) => (typeof arg === "string" ? arg : JSON.stringify(arg) ?? ""))
      .join(" ");

    expect(everythingLogged).not.toContain(JWT);
    expect(everythingLogged).not.toContain("s3cr3t-signature-value");
  });
});

// ---------------------------------------------------------------------------
// Static assertions — the module is really gone, not just unused.
// ---------------------------------------------------------------------------

/** Recursively collect .js/.jsx source files, skipping build + vendor dirs. */
function collectSourceFiles(dir, acc = []) {
  const SKIP = new Set([
    "node_modules",
    ".next",
    ".git",
    "coverage",
    "public",
    "mobile",
  ]);
  for (const entry of readdirSync(dir)) {
    if (SKIP.has(entry)) continue;
    const full = join(dir, entry);
    let stats;
    try {
      stats = statSync(full);
    } catch {
      continue;
    }
    if (stats.isDirectory()) collectSourceFiles(full, acc);
    else if (/\.(js|jsx|mjs|ts|tsx)$/.test(entry)) acc.push(full);
  }
  return acc;
}

describe("issue #74 — req.header.config is deleted", () => {
  it("the module file no longer exists", () => {
    expect(existsSync(join(REPO_ROOT, "lib/config/req.header.config.js"))).toBe(
      false
    );
  });

  it("no source file imports req.header.config", () => {
    // Matches real module references rather than any mention of the name, so
    // this file's own prose is not a false positive. Four reference shapes,
    // each with or without an explicit .js extension:
    //
    //   import config from "..."      → the `from` branch
    //   require("...")                → the `require(` branch
    //   await import("...")           → the `import(` branch
    //   import "..."   (side effect)  → the `import ` branch
    //
    // The dynamic form is not hypothetical: axios.config.js already uses
    // `await import("js-cookie")`, so a lingering dynamic import of the
    // deleted module would otherwise fail only when that path executed.
    // The quote is captured and back-referenced so template-literal
    // specifiers — require(`...`) and import(`...`), both valid — are matched
    // alongside "..." and '...'.
    const IMPORT_RE =
      /(?:from\s*|require\(\s*|import\(\s*|import\s+)(["'`])[^"'`]*req\.header\.config(?:\.js)?\1/;

    const offenders = collectSourceFiles(REPO_ROOT).filter((file) =>
      IMPORT_RE.test(readFileSync(file, "utf8"))
    );

    expect(offenders.map((f) => f.replace(`${REPO_ROOT}/`, ""))).toEqual([]);
  });
});
