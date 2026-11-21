import { describe, expect, it } from "vitest";
import {
  authRecoveryMessage,
  sessionEndReason,
  transitionAuthState,
} from "@/lib/auth/lifecycle";

describe("auth lifecycle contract", () => {
  it("only reaches verified after backend confirmation", () => {
    expect(transitionAuthState("pending_verification", "verification_pending")).toBe(
      "pending_verification"
    );
    expect(transitionAuthState("pending_verification", "verification_confirmed")).toBe(
      "verified"
    );
    expect(transitionAuthState("pending_verification", "verification_rejected")).toBe(
      "verification_failed"
    );
  });

  it("keeps reset failures recoverable", () => {
    expect(transitionAuthState("reset_requested", "reset_expired")).toBe("reset_expired");
    expect(transitionAuthState("reset_expired", "reset_requested")).toBe("reset_requested");
    expect(transitionAuthState("reset_requested", "reset_confirmed")).toBe("reset_completed");
  });

  it("classifies backend session revocation without exposing server details", () => {
    expect(sessionEndReason({ response: { status: 401, data: { code: "TOKEN_REVOKED" } } })).toBe(
      "revoked"
    );
    expect(sessionEndReason({ response: { status: 401, data: { code: "TOKEN_EXPIRED" } } })).toBe(
      "expired"
    );
    expect(authRecoveryMessage({ response: { data: { code: "OTP_EXPIRED" } } }, "fallback")).toMatch(
      /expired|already used/i
    );
  });
});
