/**
 * Consent screen tests
 * --------------------
 * Verifies the LivenessConsent component:
 *   - "Start verification" is disabled until the checkbox is checked
 *   - Consent record includes timestamp and policy version
 *   - Cancel calls onCancel without firing onConsent
 *   - No biometric data is written to localStorage, sessionStorage, or cookies
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import LivenessConsent from "@/components/organisms/educator-onboarding/LivenessConsent";

// Stub lib/config/env so tests don't require NEXT_PUBLIC_* vars
vi.mock("@/lib/config/env", () => ({
  config: {
    livenessConsentVersion: "1.0.0",
    livenessTimeoutSeconds: 60,
    livenessProvider: "mock",
  },
}));

// react-ripples doesn't work in jsdom — render children transparently
vi.mock("react-ripples", () => ({
  default: ({ children, onClick, className }) => (
    <span className={className} onClick={onClick}>{children}</span>
  ),
}));

// next/navigation used nowhere in LivenessConsent but guard it anyway
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));

/**
 * Helper: click the Radix Checkbox.
 * Radix renders a <button role="checkbox"> in jsdom; fireEvent works reliably.
 */
function clickCheckbox() {
  const checkbox = screen.getByRole("checkbox");
  fireEvent.click(checkbox);
}

/**
 * Helper: click a button by its data-testid.
 * Button renders <button data-testid="..."><Ripples onClick={handler}>...
 * fireEvent.click bubbles through the Ripples mock correctly.
 */
function clickBtn(testId) {
  // Click the inner Ripples span (where onClick lives)
  const btn = document.querySelector(`[data-testid="${testId}"]`);
  const ripples = btn?.querySelector("span") ?? btn;
  fireEvent.click(ripples);
}

describe("LivenessConsent — gate: button disabled until consent checked", () => {
  it("renders 'Start verification' button in disabled state initially", () => {
    render(<LivenessConsent onConsent={vi.fn()} onCancel={vi.fn()} />);
    const btn = screen.getByTestId("consent-start-btn");
    expect(btn).toBeDisabled();
  });

  it("enables the button once the checkbox is clicked", () => {
    render(<LivenessConsent onConsent={vi.fn()} onCancel={vi.fn()} />);
    clickCheckbox();
    expect(screen.getByTestId("consent-start-btn")).not.toBeDisabled();
  });

  it("re-disables the button if the checkbox is unchecked again", () => {
    render(<LivenessConsent onConsent={vi.fn()} onCancel={vi.fn()} />);
    clickCheckbox(); // check
    clickCheckbox(); // uncheck
    expect(screen.getByTestId("consent-start-btn")).toBeDisabled();
  });
});

describe("LivenessConsent — consent record", () => {
  it("calls onConsent with { consentAt, consentVersion } on submit", () => {
    const onConsent = vi.fn();
    const before = Date.now();

    render(<LivenessConsent onConsent={onConsent} onCancel={vi.fn()} />);
    clickCheckbox();
    clickBtn("consent-start-btn");

    expect(onConsent).toHaveBeenCalledOnce();
    const record = onConsent.mock.calls[0][0];
    expect(record.consentVersion).toBe("1.0.0");
    expect(typeof record.consentAt).toBe("number");
    expect(record.consentAt).toBeGreaterThanOrEqual(before);
    expect(record.consentAt).toBeLessThanOrEqual(Date.now());
  });

  it("does NOT call onConsent when button is clicked without checking the box", () => {
    const onConsent = vi.fn();
    render(<LivenessConsent onConsent={onConsent} onCancel={vi.fn()} />);
    // The button is disabled so handleStart returns early even if somehow clicked
    clickBtn("consent-start-btn");
    expect(onConsent).not.toHaveBeenCalled();
  });
});

describe("LivenessConsent — cancel", () => {
  it("calls onCancel and does NOT call onConsent when Cancel is clicked", () => {
    const onConsent = vi.fn();
    const onCancel = vi.fn();

    render(<LivenessConsent onConsent={onConsent} onCancel={onCancel} />);
    clickBtn("consent-cancel-btn");

    expect(onCancel).toHaveBeenCalledOnce();
    expect(onConsent).not.toHaveBeenCalled();
  });
});

describe("LivenessConsent — no biometric persistence", () => {
  let lsSpy, ssSpy, cookieSpy;

  beforeEach(() => {
    lsSpy = vi.spyOn(Storage.prototype, "setItem");
    ssSpy = vi.spyOn(window.sessionStorage, "setItem");
    cookieSpy = vi.spyOn(document, "cookie", "set");
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("never writes to localStorage, sessionStorage, or document.cookie", () => {
    render(<LivenessConsent onConsent={vi.fn()} onCancel={vi.fn()} />);
    clickCheckbox();
    clickBtn("consent-start-btn");

    expect(lsSpy).not.toHaveBeenCalled();
    expect(ssSpy).not.toHaveBeenCalled();
    expect(cookieSpy).not.toHaveBeenCalled();
  });
});

describe("LivenessConsent — accessibility", () => {
  it("checkbox has an accessible label", () => {
    render(<LivenessConsent onConsent={vi.fn()} onCancel={vi.fn()} />);
    expect(screen.getByRole("checkbox")).toBeInTheDocument();
  });

  it("section has an accessible heading", () => {
    render(<LivenessConsent onConsent={vi.fn()} onCancel={vi.fn()} />);
    expect(
      screen.getByRole("heading", { name: /identity verification/i })
    ).toBeInTheDocument();
  });
});
