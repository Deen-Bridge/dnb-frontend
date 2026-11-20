import { describe, expect, it, vi } from "vitest";
import {
  OPERATION_POLICIES,
  classifyOperation,
  getRetryDelayMs,
  waitForRetry,
} from "@/lib/config/request-policy";

describe("bounded request policies", () => {
  it("assigns explicit budgets to the audited operations", () => {
    expect(OPERATION_POLICIES.auth.maxAttempts).toBe(1);
    expect(OPERATION_POLICIES.upload.maxAttempts).toBe(1);
    expect(OPERATION_POLICIES.payment.maxAttempts).toBe(1);
    expect(OPERATION_POLICIES.search.timeoutMs).toBe(10_000);
    expect(OPERATION_POLICIES.call.timeoutMs).toBe(20_000);
  });

  it("classifies operations from endpoint intent", () => {
    expect(classifyOperation("/api/auth/refresh")).toBe("auth");
    expect(classifyOperation("/api/search?q=books")).toBe("search");
    expect(classifyOperation("/api/payment/submit")).toBe("payment");
    expect(classifyOperation("/api/jitsi/token")).toBe("call");
  });

  it("caps Retry-After and uses bounded exponential delays", () => {
    expect(getRetryDelayMs(1, "30")).toBe(8_000);
    vi.spyOn(Math, "random").mockReturnValue(0.5);
    expect(getRetryDelayMs(1)).toBe(250);
    expect(getRetryDelayMs(10)).toBe(1_000);
    vi.restoreAllMocks();
  });

  it("stops a backoff when the request is cancelled", async () => {
    const controller = new AbortController();
    const pending = waitForRetry(10_000, controller.signal);
    controller.abort();
    await expect(pending).rejects.toMatchObject({ name: "AbortError" });
  });
});
