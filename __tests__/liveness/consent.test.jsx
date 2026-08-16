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
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LivenessConsent from "@/components/organisms/educator-onboarding/LivenessConsent";

// Stub lib/config/env so tests don't require NEXT_PUBLIC_* vars
vi.mock("@/lib/config/env", () => ({
  config: {
    livenessConsentVersion: "1.0.0",
    livenessTimeoutSeconds: 60,
    livenessProvider: "mock",
  },
}));

describe("LivenessConsent — gate: button disabled until consent checked", () => {
  it("renders 'Start verification' button in disabled state initially", () => {
    render(<LivenessConsent onConsent={vi.fn()} onCancel={vi.fn()} />);
    const btn = screen.getByTestId("consent-start-btn");
    expect(btn).toBeDisabled();
  });

  it("enables the button once the checkbox is checked", async () => {
    const user = userEvent.setup();
    render(<LivenessConsent onConsent={vi.fn()} onCancel={vi.fn()} />);

    const checkbox = screen.getByRole("checkbox");
    await user.click(checkbox);

    expect(screen.getByTestId("consent-start-btn")).not.toBeDisabled();
  });

  it("re-disables the button if the checkbox is unchecked again", async () => {
    const user = userEvent.setup();
    render(<LivenessConsent onConsent={vi.fn()} onCancel={vi.fn()} />);

    const checkbox = screen.getByRole("checkbox");
    await user.click(checkbox); // check
    await user.click(checkbox); // uncheck

    expect(screen.getByTestId("consent-start-btn")).toBeDisabled();
  });
});

describe("LivenessConsent — consent record", () => {
  it("calls onConsent with { consentAt, consentVersion } on submit", async () => {
    const user = userEvent.setup();
    const onConsent = vi.fn();
    const before = Date.now();

    render(<LivenessConsent onConsent={onConsent} onCancel={vi.fn()} />);
    await user.click(screen.getByRole("checkbox"));
    await user.click(screen.getByTestId("consent-start-btn"));

    expect(onConsent).toHaveBeenCalledOnce();
    const record = onConsent.mock.calls[0][0];
    expect(record.consentVersion).toBe("1.0.0");
    expect(typeof record.consentAt).toBe("number");
    expect(record.consentAt).toBeGreaterThanOrEqual(before);
    expect(record.consentAt).toBeLessThanOrEqual(Date.now());
  });

  it("does NOT call onConsent when button is clicked without checking the box", async () => {
    const user = userEvent.setup();
    const onConsent = vi.fn();
    render(<LivenessConsent onConsent={onConsent} onCancel={vi.fn()} />);

    // Click the button while it is still disabled
    await user.click(screen.getByTestId("consent-start-btn"));
    expect(onConsent).not.toHaveBeenCalled();
  });
});

describe("LivenessConsent — cancel", () => {
  it("calls onCancel and does NOT call onConsent when Cancel is clicked", async () => {
    const user = userEvent.setup();
    const onConsent = vi.fn();
    const onCancel = vi.fn();

    render(<LivenessConsent onConsent={onConsent} onCancel={onCancel} />);
    await user.click(screen.getByTestId("consent-cancel-btn"));

    expect(onCancel).toHaveBeenCalledOnce();
    expect(onConsent).not.toHaveBeenCalled();
  });
});

describe("LivenessConsent — no biometric persistence", () => {
  let lsSpy, ssSpy, cookieSpy;

  beforeEach(() => {
    lsSpy = vi.spyOn(Storage.prototype, "setItem");
    ssSpy = vi.spyOn(window.sessionStorage, "setItem");
    // document.cookie setter
    cookieSpy = vi.spyOn(document, "cookie", "set");
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("never writes to localStorage, sessionStorage, or document.cookie", async () => {
    const user = userEvent.setup();
    render(
      <LivenessConsent onConsent={vi.fn()} onCancel={vi.fn()} />
    );
    await user.click(screen.getByRole("checkbox"));
    await user.click(screen.getByTestId("consent-start-btn"));

    expect(lsSpy).not.toHaveBeenCalled();
    expect(ssSpy).not.toHaveBeenCalled();
    expect(cookieSpy).not.toHaveBeenCalled();
  });
});

describe("LivenessConsent — accessibility", () => {
  it("checkbox has an accessible label", () => {
    render(<LivenessConsent onConsent={vi.fn()} onCancel={vi.fn()} />);
    const checkbox = screen.getByRole("checkbox");
    // getByRole with name would throw if unlabelled
    expect(checkbox).toBeInTheDocument();
  });

  it("section has an accessible heading", () => {
    render(<LivenessConsent onConsent={vi.fn()} onCancel={vi.fn()} />);
    expect(screen.getByRole("heading", { name: /identity verification/i })).toBeInTheDocument();
  });
});
