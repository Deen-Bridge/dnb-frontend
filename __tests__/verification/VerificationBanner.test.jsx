/**
 * VerificationBanner — component tests
 * ------------------------------------
 * Covers:
 *   - Renders nothing for non-educators (isBannerVisible=false)
 *   - Renders nothing for verified educators
 *   - Renders correct copy + colors for each active status
 *   - CTA routes to correct URL (resume step for incomplete, status center for rejected)
 *   - Snooze hides the banner without blocking the dashboard
 *   - Dismiss hides the banner
 *   - data-status attribute matches current status
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import VerificationBanner from "@/components/organisms/dashboard/VerificationBanner";
import { VERIFICATION_STATUS } from "@/lib/actions/educators/fetchVerificationStatus";

// ── Mocks ──────────────────────────────────────────────────────────────────

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: mockPush }) }));

vi.mock("react-ripples", () => ({
  default: ({ children, onClick, className }) => (
    <span className={className} onClick={onClick}>{children}</span>
  ),
}));

vi.mock("@/lib/config/env", () => ({
  config: { livenessProvider: "mock", livenessConsentVersion: "1.0.0", livenessTimeoutSeconds: 60 },
}));

// Controlled hook state
let _hookReturn = {};

vi.mock("@/hooks/useVerificationStatus", () => ({
  useVerificationStatus: () => _hookReturn,
}));

// ── Helpers ────────────────────────────────────────────────────────────────

function makeHookReturn(overrides = {}) {
  return {
    status: VERIFICATION_STATUS.INCOMPLETE,
    data: null,
    loading: false,
    isBannerVisible: true,
    resumeStep: 2,
    snooze: vi.fn(),
    dismiss: vi.fn(),
    refresh: vi.fn(),
    isVerified: false,
    isRejected: false,
    isPending: false,
    isIncomplete: true,
    ...overrides,
  };
}

beforeEach(() => {
  _hookReturn = makeHookReturn();
  mockPush.mockClear();
  try { try { try { localStorage.removeItem("dnb_verification_banner"); } catch (_e) { } } catch (_e) { } } catch (_e) { }
});

afterEach(() => vi.clearAllMocks());

// ── Tests ──────────────────────────────────────────────────────────────────

describe("VerificationBanner — not visible", () => {
  it("renders nothing when isBannerVisible=false (non-educator)", () => {
    _hookReturn = makeHookReturn({ isBannerVisible: false });
    const { container } = render(<VerificationBanner />);
    expect(container.firstChild).toBeNull();
  });

  it("renders nothing for verified educators", () => {
    _hookReturn = makeHookReturn({
      isBannerVisible: false,
      status: VERIFICATION_STATUS.VERIFIED,
      isVerified: true,
    });
    const { container } = render(<VerificationBanner />);
    expect(container.firstChild).toBeNull();
  });

  it("renders loading skeleton while loading=true", () => {
    _hookReturn = makeHookReturn({ loading: true, isBannerVisible: false });
    render(<VerificationBanner />);
    expect(document.querySelector(".animate-pulse")).toBeInTheDocument();
  });
});

describe("VerificationBanner — incomplete status", () => {
  beforeEach(() => {
    _hookReturn = makeHookReturn({ status: VERIFICATION_STATUS.INCOMPLETE, resumeStep: 2 });
  });

  it("renders banner with correct heading", () => {
    render(<VerificationBanner />);
    expect(screen.getByTestId("verification-banner")).toBeInTheDocument();
    expect(screen.getByText(/finish your verification/i)).toBeInTheDocument();
  });

  it("has data-status='incomplete'", () => {
    render(<VerificationBanner />);
    expect(screen.getByTestId("verification-banner")).toHaveAttribute("data-status", "incomplete");
  });

  it("CTA routes to educator-onboarding at resumeStep=2", () => {
    render(<VerificationBanner />);
    fireEvent.click(screen.getByTestId("banner-cta-btn"));
    expect(mockPush).toHaveBeenCalledWith("/educator-onboarding?step=2");
  });

  it("shows a snooze button", () => {
    render(<VerificationBanner />);
    expect(screen.getByTestId("banner-snooze-btn")).toBeInTheDocument();
  });

  it("snooze button calls snooze()", () => {
    render(<VerificationBanner />);
    fireEvent.click(screen.getByTestId("banner-snooze-btn"));
    expect(_hookReturn.snooze).toHaveBeenCalledOnce();
  });
});

describe("VerificationBanner — not_started status", () => {
  beforeEach(() => {
    _hookReturn = makeHookReturn({ status: VERIFICATION_STATUS.NOT_STARTED, resumeStep: 1 });
  });

  it("renders 'Start verification' CTA", () => {
    render(<VerificationBanner />);
    expect(screen.getByTestId("banner-cta-btn")).toHaveTextContent(/start verification/i);
  });

  it("CTA routes to step=1", () => {
    render(<VerificationBanner />);
    fireEvent.click(screen.getByTestId("banner-cta-btn"));
    expect(mockPush).toHaveBeenCalledWith("/educator-onboarding?step=1");
  });
});

describe("VerificationBanner — pending / under_review", () => {
  it("shows 'submitted' copy and no CTA for pending", () => {
    _hookReturn = makeHookReturn({ status: VERIFICATION_STATUS.PENDING, isPending: true });
    render(<VerificationBanner />);
    expect(screen.getByText(/verification submitted/i)).toBeInTheDocument();
    expect(screen.queryByTestId("banner-cta-btn")).not.toBeInTheDocument();
  });

  it("shows 'under review' copy for under_review", () => {
    _hookReturn = makeHookReturn({ status: VERIFICATION_STATUS.UNDER_REVIEW, isPending: true });
    render(<VerificationBanner />);
    expect(screen.getByText(/under review/i)).toBeInTheDocument();
  });
});

describe("VerificationBanner — rejected status", () => {
  beforeEach(() => {
    _hookReturn = makeHookReturn({
      status: VERIFICATION_STATUS.REJECTED,
      isRejected: true,
      data: { rejectionReason: "Photo was blurry. Please upload a clearer image." },
    });
  });

  it("shows rejection heading and inline reason", () => {
    render(<VerificationBanner />);
    expect(screen.getByText(/verification needs attention/i)).toBeInTheDocument();
    expect(screen.getByText(/photo was blurry/i)).toBeInTheDocument();
  });

  it("CTA routes to /account/verification for rejected", () => {
    render(<VerificationBanner />);
    fireEvent.click(screen.getByTestId("banner-cta-btn"));
    expect(mockPush).toHaveBeenCalledWith("/account/verification");
  });

  it("no snooze button for rejected", () => {
    render(<VerificationBanner />);
    expect(screen.queryByTestId("banner-snooze-btn")).not.toBeInTheDocument();
  });
});

describe("VerificationBanner — dismiss", () => {
  it("dismiss button calls dismiss()", () => {
    render(<VerificationBanner />);
    fireEvent.click(screen.getByTestId("banner-dismiss-btn"));
    expect(_hookReturn.dismiss).toHaveBeenCalledOnce();
  });

  it("dismiss button does not call CTA handler", () => {
    render(<VerificationBanner />);
    fireEvent.click(screen.getByTestId("banner-dismiss-btn"));
    expect(mockPush).not.toHaveBeenCalled();
  });
});

describe("VerificationBanner — copy matches each status", () => {
  const cases = [
    [VERIFICATION_STATUS.NOT_STARTED, /verify your educator identity/i],
    [VERIFICATION_STATUS.INCOMPLETE, /finish your verification/i],
    [VERIFICATION_STATUS.PENDING, /verification submitted/i],
    [VERIFICATION_STATUS.UNDER_REVIEW, /under review/i],
    [VERIFICATION_STATUS.REJECTED, /verification needs attention/i],
  ];

  it.each(cases)("status=%s renders correct heading", (status, re) => {
    _hookReturn = makeHookReturn({ status, isBannerVisible: true });
    render(<VerificationBanner />);
    expect(screen.getByTestId("verification-banner")).toBeInTheDocument();
    expect(screen.getByText(re)).toBeInTheDocument();
  });
});
