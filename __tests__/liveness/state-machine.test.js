/**
 * EducatorOnboardingProvider — reducer / state machine tests
 * -----------------------------------------------------------
 * Exercises the public action creators through renderHook to cover the
 * full reducer logic without spinning up a real component tree.
 *
 * Covered
 * -------
 *   - Initial state shape
 *   - Consent gate: consentRecord null before consent, populated after
 *   - recordConsent → phase "capturing"
 *   - revokeConsent → consentRecord null, phase "consenting", token cleared
 *   - setVerificationToken → phase "success"
 *   - setError → correct phase + message, token cleared
 *   - retry → phase "capturing", errorMessage null, token null, retryCount++
 *   - clearVerificationToken → token null
 *   - Navigation (nextStep / prevStep / goToStep)
 *   - No biometric data written to localStorage, sessionStorage, or cookies
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import EducatorOnboardingProvider, {
  useEducatorOnboarding,
} from "@/components/providers/EducatorOnboardingProvider";

// ---------------------------------------------------------------------------
// Helper — renders the hook inside its required provider
// ---------------------------------------------------------------------------
function setup() {
  return renderHook(() => useEducatorOnboarding(), {
    wrapper: EducatorOnboardingProvider,
  });
}

// ---------------------------------------------------------------------------
// Initial state
// ---------------------------------------------------------------------------
describe("Initial state", () => {
  it("starts at step 1, phase idle, no consent, no token", () => {
    const { result } = setup();
    expect(result.current.step).toBe(1);
    expect(result.current.phase).toBe("idle");
    expect(result.current.consentRecord).toBeNull();
    expect(result.current.verificationToken).toBeNull();
    expect(result.current.retryCount).toBe(0);
    expect(result.current.errorMessage).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Consent gate
// ---------------------------------------------------------------------------
describe("Consent gate", () => {
  it("consentRecord is null before recordConsent is called", () => {
    const { result } = setup();
    expect(result.current.consentRecord).toBeNull();
  });

  it("recordConsent stores consentAt + consentVersion and transitions to capturing", () => {
    const { result } = setup();
    const ts = Date.now();

    act(() => {
      result.current.recordConsent({ consentAt: ts, consentVersion: "1.0.0" });
    });

    expect(result.current.consentRecord).not.toBeNull();
    expect(result.current.consentRecord.consentAt).toBe(ts);
    expect(result.current.consentRecord.consentVersion).toBe("1.0.0");
    expect(result.current.phase).toBe("capturing");
    expect(result.current.errorMessage).toBeNull();
  });

  it("revokeConsent clears consentRecord, clears token, returns to consenting", () => {
    const { result } = setup();
    act(() => result.current.recordConsent({ consentAt: Date.now(), consentVersion: "1.0.0" }));
    act(() => result.current.setVerificationToken("tok_will_be_cleared"));
    act(() => result.current.revokeConsent());

    expect(result.current.consentRecord).toBeNull();
    expect(result.current.phase).toBe("consenting");
    expect(result.current.verificationToken).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Verification token lifecycle
// ---------------------------------------------------------------------------
describe("Verification token lifecycle", () => {
  it("setVerificationToken stores the token and transitions to success", () => {
    const { result } = setup();
    act(() => result.current.setVerificationToken("tok_abc123"));

    expect(result.current.verificationToken).toBe("tok_abc123");
    expect(result.current.phase).toBe("success");
  });

  it("clearVerificationToken wipes the token without changing phase", () => {
    const { result } = setup();
    act(() => result.current.setVerificationToken("tok_abc123"));
    act(() => result.current.clearVerificationToken());

    expect(result.current.verificationToken).toBeNull();
  });

  it("setError clears any token that was already set", () => {
    const { result } = setup();
    act(() => result.current.setVerificationToken("tok_abc123"));
    act(() => result.current.setError({ phase: "failure", message: "oops" }));

    expect(result.current.verificationToken).toBeNull();
    expect(result.current.phase).toBe("failure");
  });
});

// ---------------------------------------------------------------------------
// Failure and timeout states
// ---------------------------------------------------------------------------
describe("Failure state", () => {
  it("setError with phase:'failure' transitions to failure with message", () => {
    const { result } = setup();
    act(() => result.current.setError({ phase: "failure", message: "Check failed." }));

    expect(result.current.phase).toBe("failure");
    expect(result.current.errorMessage).toBe("Check failed.");
    expect(result.current.verificationToken).toBeNull();
  });
});

describe("Timeout state", () => {
  it("setError with phase:'timeout' transitions to timeout with message", () => {
    const { result } = setup();
    act(() => result.current.setError({ phase: "timeout", message: "Timed out." }));

    expect(result.current.phase).toBe("timeout");
    expect(result.current.errorMessage).toBe("Timed out.");
  });
});

// ---------------------------------------------------------------------------
// Retry path
// ---------------------------------------------------------------------------
describe("Retry", () => {
  it("retry after failure resets to capturing, clears errorMessage + token, retryCount+1", () => {
    const { result } = setup();

    act(() => result.current.setError({ phase: "failure", message: "failed" }));
    act(() => result.current.retry());

    expect(result.current.phase).toBe("capturing");
    expect(result.current.errorMessage).toBeNull();
    expect(result.current.verificationToken).toBeNull();
    expect(result.current.retryCount).toBe(1);
  });

  it("retry after timeout resets to capturing and increments retryCount", () => {
    const { result } = setup();
    act(() => result.current.setError({ phase: "timeout", message: "timeout" }));
    act(() => result.current.retry());

    expect(result.current.phase).toBe("capturing");
    expect(result.current.retryCount).toBe(1);
  });

  it("multiple retries keep incrementing retryCount", () => {
    const { result } = setup();
    act(() => result.current.retry());
    act(() => result.current.retry());
    act(() => result.current.retry());
    expect(result.current.retryCount).toBe(3);
  });
});

// ---------------------------------------------------------------------------
// Navigation
// ---------------------------------------------------------------------------
describe("Navigation", () => {
  it("nextStep increments step and clears errorMessage", () => {
    const { result } = setup();
    act(() => result.current.nextStep());
    expect(result.current.step).toBe(2);
    expect(result.current.errorMessage).toBeNull();
  });

  it("prevStep decrements step but never goes below 1", () => {
    const { result } = setup();
    act(() => result.current.prevStep());
    expect(result.current.step).toBe(1);
  });

  it("goToStep navigates to an arbitrary step", () => {
    const { result } = setup();
    act(() => result.current.goToStep(3));
    expect(result.current.step).toBe(3);
  });
});

// ---------------------------------------------------------------------------
// No biometric data in persistent storage
// ---------------------------------------------------------------------------
describe("No biometric data written to persistent storage", () => {
  let lsSpy, ssSpy, cookieSpy;

  beforeEach(() => {
    lsSpy = vi.spyOn(Storage.prototype, "setItem");
    ssSpy = vi.spyOn(window.sessionStorage, "setItem");
    cookieSpy = vi.spyOn(document, "cookie", "set");
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("setVerificationToken never writes to localStorage, sessionStorage, or cookies", () => {
    const { result } = setup();
    act(() => result.current.setVerificationToken("tok_sensitive_biometric"));

    expect(lsSpy).not.toHaveBeenCalled();
    expect(ssSpy).not.toHaveBeenCalled();
    expect(cookieSpy).not.toHaveBeenCalled();
  });

  it("recordConsent never writes to localStorage, sessionStorage, or cookies", () => {
    const { result } = setup();
    act(() =>
      result.current.recordConsent({ consentAt: Date.now(), consentVersion: "1.0.0" })
    );

    expect(lsSpy).not.toHaveBeenCalled();
    expect(ssSpy).not.toHaveBeenCalled();
    expect(cookieSpy).not.toHaveBeenCalled();
  });

  it("a full success flow (consent → token → clear) never writes to storage", () => {
    const { result } = setup();
    act(() =>
      result.current.recordConsent({ consentAt: Date.now(), consentVersion: "1.0.0" })
    );
    act(() => result.current.setVerificationToken("tok_full_flow"));
    act(() => result.current.clearVerificationToken());

    expect(lsSpy).not.toHaveBeenCalled();
    expect(ssSpy).not.toHaveBeenCalled();
    expect(cookieSpy).not.toHaveBeenCalled();
  });
});
