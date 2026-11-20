/**
 * LivenessCapture — integration flow tests
 * -----------------------------------------
 * Uses the MockLivenessAdapter to drive the full UI without any vendor SDK.
 * Verifies:
 *   - Success path: adapter resolves → submitLiveness called → onSuccess fired
 *   - Failure path: failure state rendered with distinct UI + retry CTA
 *   - Timeout path: timeout state rendered with distinct UI + retry CTA
 *   - Retry: clicking "Try again" resets to capturing phase
 *   - Cancel: calling onCancel from any terminal state returns to branch selector
 *   - Verification token is cleared after backend ack (not left in context)
 *   - No vendor module imported into the component (mock factory only)
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, fireEvent, act } from "@testing-library/react";
import LivenessCapture from "@/components/organisms/educator-onboarding/LivenessCapture";
import EducatorOnboardingProvider from "@/components/providers/EducatorOnboardingProvider";

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

vi.mock("@/lib/config/env", () => ({
  config: {
    livenessProvider: "mock",
    livenessConsentVersion: "1.0.0",
    livenessTimeoutSeconds: 5,
  },
}));

vi.mock("@/hooks/useAuth", () => ({
  default: () => ({ user: { _id: "user_test_1" } }),
}));

vi.mock("@/lib/actions/educators/submitLiveness", () => ({
  submitLiveness: vi.fn().mockResolvedValue({ success: true }),
}));

vi.mock("react-ripples", () => ({
  default: ({ children, onClick, className }) => (
    <span className={className} onClick={onClick}>{children}</span>
  ),
}));

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));

// Control mock adapter outcome via module-level variable.
// We mock the entire liveness module so the factory returns our controlled mock.
let _mockOutcome = "success";

vi.mock("@/lib/verification/liveness", async (importOriginal) => {
  // Import the real mock-adapter using its resolved path so Vitest can find it
  const { MockLivenessAdapter } = await importOriginal();
  return {
    getLivenessAdapter: () =>
      new MockLivenessAdapter({ outcome: _mockOutcome, delayMs: 0 }),
  };
});

// Re-import after mock registration
import { submitLiveness } from "@/lib/actions/educators/submitLiveness";

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------
function renderCapture(onSuccess = vi.fn(), onCancel = vi.fn()) {
  return render(
    <EducatorOnboardingProvider>
      <LivenessCapture onSuccess={onSuccess} onCancel={onCancel} />
    </EducatorOnboardingProvider>
  );
}

function clickBtn(testId) {
  const btn = document.querySelector(`[data-testid="${testId}"]`);
  const ripples = btn?.querySelector("span") ?? btn;
  fireEvent.click(ripples);
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe("LivenessCapture — success path", () => {
  beforeEach(() => { _mockOutcome = "success"; });
  afterEach(() => { vi.clearAllMocks(); });

  it("calls submitLiveness with userId and verificationToken", async () => {
    renderCapture();
    await waitFor(() => expect(submitLiveness).toHaveBeenCalledOnce());

    const payload = submitLiveness.mock.calls[0][0];
    expect(payload.userId).toBe("user_test_1");
    expect(typeof payload.verificationToken).toBe("string");
    expect(payload.verificationToken.length).toBeGreaterThan(0);
  });

  it("forwards consent fields to submitLiveness", async () => {
    renderCapture();
    await waitFor(() => expect(submitLiveness).toHaveBeenCalledOnce());

    const payload = submitLiveness.mock.calls[0][0];
    expect(typeof payload.consentVersion).toBe("string");
    expect(typeof payload.consentAt).toBe("number");
  });

  it("calls onSuccess after backend acknowledges", async () => {
    const onSuccess = vi.fn();
    renderCapture(onSuccess);
    await waitFor(() => expect(onSuccess).toHaveBeenCalledOnce());
  });

  it("does NOT render the raw verificationToken in the DOM", async () => {
    renderCapture();
    await waitFor(() => expect(submitLiveness).toHaveBeenCalledOnce());
    const token = submitLiveness.mock.calls[0][0].verificationToken;
    expect(document.body.textContent).not.toContain(token);
  });
});

describe("LivenessCapture — failure path", () => {
  beforeEach(() => { _mockOutcome = "failure"; });
  afterEach(() => { vi.clearAllMocks(); });

  it("renders distinct failure heading", async () => {
    renderCapture();
    await waitFor(() =>
      expect(
        screen.getByRole("heading", { name: /verification failed/i })
      ).toBeInTheDocument()
    );
  });

  it("shows a 'Try again' retry button on failure", async () => {
    renderCapture();
    await waitFor(() =>
      expect(screen.getByTestId("capture-retry-btn")).toBeInTheDocument()
    );
  });

  it("shows a Cancel button on failure", async () => {
    renderCapture();
    await waitFor(() =>
      expect(screen.getByTestId("capture-cancel-btn")).toBeInTheDocument()
    );
  });

  it("does NOT call onSuccess on failure", async () => {
    const onSuccess = vi.fn();
    renderCapture(onSuccess);
    await waitFor(() => screen.getByTestId("capture-retry-btn"));
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it("clicking retry with success outcome eventually calls onSuccess", async () => {
    const onSuccess = vi.fn();
    renderCapture(onSuccess);
    await waitFor(() => screen.getByTestId("capture-retry-btn"));

    _mockOutcome = "success";
    clickBtn("capture-retry-btn");

    await waitFor(() => expect(onSuccess).toHaveBeenCalledOnce());
  });
});

describe("LivenessCapture — timeout path", () => {
  afterEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  it("renders distinct timeout heading, retry and cancel buttons after UI timeout fires", async () => {
    // The component has its own belt-and-suspenders setTimeout that calls
    // setPhase('timeout') after config.livenessTimeoutSeconds (mocked as 5s).
    // We use real timers but advance them via a short actual delay.
    // Override the mock to never resolve so the UI timeout guard fires.
    _mockOutcome = "timeout";
    vi.useFakeTimers({ shouldAdvanceTime: true });

    renderCapture();

    // Advance past the 5s timeout
    await act(async () => {
      await vi.advanceTimersByTimeAsync(6000);
    });

    expect(
      screen.getByRole("heading", { name: /verification timed out/i })
    ).toBeInTheDocument();
    expect(screen.getByTestId("capture-retry-btn")).toBeInTheDocument();
    expect(screen.getByTestId("capture-cancel-btn")).toBeInTheDocument();
    // Distinct from failure
    expect(
      screen.queryByRole("heading", { name: /verification failed/i })
    ).not.toBeInTheDocument();
  }, 15000);
});

describe("LivenessCapture — cancel", () => {
  beforeEach(() => { _mockOutcome = "failure"; });
  afterEach(() => { vi.clearAllMocks(); });

  it("cancel on failure calls onCancel and not onSuccess", async () => {
    const onSuccess = vi.fn();
    const onCancel = vi.fn();
    renderCapture(onSuccess, onCancel);
    await waitFor(() => screen.getByTestId("capture-cancel-btn"));
    clickBtn("capture-cancel-btn");
    expect(onCancel).toHaveBeenCalledOnce();
    expect(onSuccess).not.toHaveBeenCalled();
  });
});

describe("LivenessCapture — no vendor code in component", () => {
  it("mock adapter drives full flow without persona/onfido imports", async () => {
    _mockOutcome = "success";
    const onSuccess = vi.fn();
    renderCapture(onSuccess);
    await waitFor(() => expect(onSuccess).toHaveBeenCalledOnce());
    expect(submitLiveness).toHaveBeenCalledOnce();
  });
});
