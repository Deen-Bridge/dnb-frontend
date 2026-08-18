/**
 * Token hand-off tests — submitLiveness action
 * ---------------------------------------------
 * Verifies that:
 *   1. submitLiveness POSTs ONLY { userId, verificationToken, consent } —
 *      no raw biometric data, no cookies written, no localStorage written.
 *   2. A successful response resolves with the backend data.
 *   3. A failing response throws with the backend message.
 *   4. Missing required fields throw before any network call is made.
 *   5. The verification token is never written to localStorage/sessionStorage/
 *      cookies at any point in the submission path.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { submitLiveness } from "@/lib/actions/educators/submitLiveness";

// ---------------------------------------------------------------------------
// Mock axiosInstance
// ---------------------------------------------------------------------------
vi.mock("@/lib/config/axios.config", () => ({
  default: {
    post: vi.fn(),
  },
}));

import axiosInstance from "@/lib/config/axios.config";

const VALID_PAYLOAD = {
  userId: "user_123",
  verificationToken: "tok_provider_xyz",
  consentAt: 1_700_000_000_000,
  consentVersion: "1.0.0",
};

describe("submitLiveness — validation guards", () => {
  it("throws if userId is missing", async () => {
    await expect(
      submitLiveness({ ...VALID_PAYLOAD, userId: "" })
    ).rejects.toThrow("userId is required");
  });

  it("throws if verificationToken is missing", async () => {
    await expect(
      submitLiveness({ ...VALID_PAYLOAD, verificationToken: "" })
    ).rejects.toThrow("verificationToken is required");
  });

  it("throws if consentAt is missing", async () => {
    await expect(
      submitLiveness({ ...VALID_PAYLOAD, consentAt: 0 })
    ).rejects.toThrow("consentAt is required");
  });

  it("throws if consentVersion is missing", async () => {
    await expect(
      submitLiveness({ ...VALID_PAYLOAD, consentVersion: "" })
    ).rejects.toThrow("consentVersion is required");
  });

  it("does NOT call axiosInstance when validation fails", async () => {
    try {
      await submitLiveness({ ...VALID_PAYLOAD, userId: "" });
    } catch {
      // expected
    }
    expect(axiosInstance.post).not.toHaveBeenCalled();
  });
});

describe("submitLiveness — successful submission", () => {
  beforeEach(() => {
    axiosInstance.post.mockResolvedValue({ data: { success: true, applicationId: "app_001" } });
  });

  afterEach(() => vi.clearAllMocks());

  it("POSTs to the correct endpoint", async () => {
    await submitLiveness(VALID_PAYLOAD);
    expect(axiosInstance.post).toHaveBeenCalledWith(
      "/api/educators/applications/liveness",
      expect.any(Object)
    );
  });

  it("sends userId and verificationToken in the body", async () => {
    await submitLiveness(VALID_PAYLOAD);
    const body = axiosInstance.post.mock.calls[0][1];
    expect(body.userId).toBe("user_123");
    expect(body.verificationToken).toBe("tok_provider_xyz");
  });

  it("sends consent.recordedAt and consent.policyVersion in the body", async () => {
    await submitLiveness(VALID_PAYLOAD);
    const body = axiosInstance.post.mock.calls[0][1];
    expect(body.consent.recordedAt).toBe(1_700_000_000_000);
    expect(body.consent.policyVersion).toBe("1.0.0");
  });

  it("does NOT include any raw biometric keys in the POST body", async () => {
    await submitLiveness(VALID_PAYLOAD);
    const body = axiosInstance.post.mock.calls[0][1];
    const bodyStr = JSON.stringify(body);
    // None of these keys should appear
    expect(bodyStr).not.toMatch(/frame/i);
    expect(bodyStr).not.toMatch(/vector/i);
    expect(bodyStr).not.toMatch(/blob/i);
    expect(bodyStr).not.toMatch(/biometric/i);
    expect(bodyStr).not.toMatch(/image/i);
    expect(bodyStr).not.toMatch(/base64/i);
  });

  it("resolves with the backend response data", async () => {
    const result = await submitLiveness(VALID_PAYLOAD);
    expect(result).toEqual({ success: true, applicationId: "app_001" });
  });
});

describe("submitLiveness — failed submission", () => {
  afterEach(() => vi.clearAllMocks());

  it("throws with backend error message on 4xx/5xx", async () => {
    axiosInstance.post.mockRejectedValue({
      response: { data: { message: "Token already used." } },
    });

    await expect(submitLiveness(VALID_PAYLOAD)).rejects.toThrow("Token already used.");
  });

  it("throws with generic message when no response body", async () => {
    axiosInstance.post.mockRejectedValue({ message: "Network Error" });

    await expect(submitLiveness(VALID_PAYLOAD)).rejects.toThrow("Network Error");
  });
});

describe("submitLiveness — no biometric data written to storage", () => {
  let lsSpy, ssSpy, cookieSpy;

  beforeEach(() => {
    axiosInstance.post.mockResolvedValue({ data: { success: true } });
    lsSpy = vi.spyOn(Storage.prototype, "setItem");
    ssSpy = vi.spyOn(window.sessionStorage, "setItem");
    cookieSpy = vi.spyOn(document, "cookie", "set");
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("never writes to localStorage, sessionStorage, or cookies during submission", async () => {
    await submitLiveness(VALID_PAYLOAD);
    expect(lsSpy).not.toHaveBeenCalled();
    expect(ssSpy).not.toHaveBeenCalled();
    expect(cookieSpy).not.toHaveBeenCalled();
  });
});
