/**
 * Adapter contract tests
 * ----------------------
 * Verifies the MockLivenessAdapter honours the LivenessAdapter interface
 * contract for all four outcomes.  Also asserts that the adapter is fully
 * swappable: the factory (getLivenessAdapter) returns a mock when no vendor
 * is configured, and no vendor module is ever imported into the test.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { MockLivenessAdapter } from "@/lib/verification/liveness/mock-adapter";
import { LivenessAdapter } from "@/lib/verification/liveness/adapter";

// ── Minimal session fixture ───────────────────────────────────────────────
const SESSION = {
  userId: "user_test_123",
  consentVersion: "1.0.0",
  consentAt: Date.now(),
  timeoutMs: 5000,
};

describe("MockLivenessAdapter — contract", () => {
  it("extends LivenessAdapter base class", () => {
    const adapter = new MockLivenessAdapter();
    expect(adapter).toBeInstanceOf(LivenessAdapter);
  });

  it("exposes start(), onResult(), cancel()", () => {
    const adapter = new MockLivenessAdapter();
    expect(typeof adapter.start).toBe("function");
    expect(typeof adapter.onResult).toBe("function");
    expect(typeof adapter.cancel).toBe("function");
  });

  it("onResult() throws TypeError for non-function argument", () => {
    const adapter = new MockLivenessAdapter();
    expect(() => adapter.onResult("not-a-function")).toThrow(TypeError);
    expect(() => adapter.onResult(null)).toThrow(TypeError);
  });
});

describe("MockLivenessAdapter — outcome: success", () => {
  it("resolves with { ok: true, token } and fires onResult callback", async () => {
    const adapter = new MockLivenessAdapter({ outcome: "success", delayMs: 0 });
    const cb = vi.fn();
    adapter.onResult(cb);

    const result = await adapter.start(SESSION);

    expect(result.ok).toBe(true);
    expect(typeof result.token).toBe("string");
    expect(result.token.length).toBeGreaterThan(0);
    // Callback fired with same result
    expect(cb).toHaveBeenCalledOnce();
    expect(cb.mock.calls[0][0]).toEqual(result);
  });

  it("token does NOT contain raw biometric data (no base64 blobs)", async () => {
    const adapter = new MockLivenessAdapter({ outcome: "success", delayMs: 0 });
    const { token } = await adapter.start(SESSION);
    // Mock tokens start with a known prefix; they are short opaque strings.
    expect(token).toMatch(/^mock_liveness_token_/);
    // No base64 image data (very long strings that include '/' or '+')
    expect(token.length).toBeLessThan(200);
  });
});

describe("MockLivenessAdapter — outcome: failure", () => {
  it("rejects with { ok: false, reason: 'failure' }", async () => {
    const adapter = new MockLivenessAdapter({ outcome: "failure", delayMs: 0 });
    const cb = vi.fn();
    adapter.onResult(cb);

    await expect(adapter.start(SESSION)).rejects.toMatchObject({
      ok: false,
      reason: "failure",
    });

    expect(cb).toHaveBeenCalledOnce();
    expect(cb.mock.calls[0][0].ok).toBe(false);
    expect(cb.mock.calls[0][0].reason).toBe("failure");
  });
});

describe("MockLivenessAdapter — outcome: timeout", () => {
  beforeEach(() => { vi.useFakeTimers(); });
  afterEach(() => { vi.useRealTimers(); });

  it("does not resolve until cancel() is called, then emits { ok:false, reason:'timeout' }", async () => {
    const adapter = new MockLivenessAdapter({ outcome: "timeout" });
    const cb = vi.fn();
    adapter.onResult(cb);

    const promise = adapter.start(SESSION);
    // Not yet resolved
    expect(cb).not.toHaveBeenCalled();

    adapter.cancel();
    await expect(promise).rejects.toMatchObject({
      ok: false,
      reason: "timeout",
    });
    expect(cb.mock.calls[0][0].reason).toBe("timeout");
  });
});

describe("MockLivenessAdapter — outcome: cancelled", () => {
  it("rejects immediately with { ok: false, reason: 'cancelled' }", async () => {
    const adapter = new MockLivenessAdapter({ outcome: "cancelled" });
    await expect(adapter.start(SESSION)).rejects.toMatchObject({
      ok: false,
      reason: "cancelled",
    });
  });
});

describe("MockLivenessAdapter — cancel() idempotency", () => {
  it("can be called multiple times without throwing", () => {
    const adapter = new MockLivenessAdapter({ outcome: "success", delayMs: 100 });
    expect(() => {
      adapter.cancel();
      adapter.cancel();
      adapter.cancel();
    }).not.toThrow();
  });
});

describe("Adapter factory — swappability", () => {
  it("returns a MockLivenessAdapter when no vendor env var is set", async () => {
    // Dynamic import so the mock of config works correctly in this module scope
    const { getLivenessAdapter } = await import(
      "@/lib/verification/liveness/index"
    );
    const adapter = getLivenessAdapter();
    expect(adapter).toBeInstanceOf(MockLivenessAdapter);
  });

  it("returned adapter satisfies the LivenessAdapter interface", async () => {
    const { getLivenessAdapter } = await import(
      "@/lib/verification/liveness/index"
    );
    const adapter = getLivenessAdapter();
    expect(typeof adapter.start).toBe("function");
    expect(typeof adapter.onResult).toBe("function");
    expect(typeof adapter.cancel).toBe("function");
  });
});
