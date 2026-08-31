/**
 * VerificationPage - status center component tests
 */

import { describe, it, expect, vi, beforeAll, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { VERIFICATION_STATUS } from "@/lib/actions/educators/fetchVerificationStatus";

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

vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

// vi.hoisted ensures these are available before vi.mock factories run
const mockFetchSignedUrl = vi.hoisted(() => vi.fn());
vi.mock("@/lib/actions/educators/fetchVerificationStatus", async () => {
  const actual = await vi.importActual("@/lib/actions/educators/fetchVerificationStatus");
  return { ...actual, fetchDocumentSignedUrl: mockFetchSignedUrl };
});

const _hookState = vi.hoisted(() => ({ current: null }));
vi.mock("@/hooks/useVerificationStatus", () => ({
  useVerificationStatus: () => _hookState.current,
}));

// ── Fixtures ────────────────────────────────────────────────────────────────

const TIMELINE = [
  { status: "identity", label: "Identity verification", ts: "2024-01-01T00:00:00.000Z", done: true },
  { status: "documents", label: "Document upload", ts: null, done: false },
  { status: "review", label: "Under review", ts: null, done: false },
];

const DOCS = [
  { id: "doc_1", type: "national_id", filename: "passport.jpg", uploadedAt: "2024-01-01T00:00:00.000Z", signedUrlEndpoint: "/signed-url" },
];

function makeHook(overrides = {}) {
  return {
    status: VERIFICATION_STATUS.INCOMPLETE,
    data: { timeline: TIMELINE, documents: [], rejectionReason: null, submittedAt: null, reviewedAt: null },
    loading: false, error: null, resumeStep: 2,
    refresh: vi.fn().mockResolvedValue(undefined),
    isVerified: false, isRejected: false, isPending: false, isIncomplete: true,
    isBannerVisible: false, snooze: vi.fn(), dismiss: vi.fn(),
    ...overrides,
  };
}

// Lazy-import so mocks are registered before the component module loads

// Click a Button component (onClick lives on the inner Ripples span)
function clickBtn(testId) {
  const btn = document.querySelector('[data-testid="' + testId + '"]');
  const inner = btn && (btn.querySelector('span') || btn);
  if (inner) fireEvent.click(inner);
}
let _VerificationPage;
beforeAll(async () => {
  const mod = await import("@/app/[locale]/account/verification/page");
  _VerificationPage = mod.default;
}, 60000);

beforeEach(() => {
  _hookState.current = makeHook();
  mockPush.mockClear();
  mockFetchSignedUrl.mockClear();
});
afterEach(() => vi.clearAllMocks());

// ── Tests ───────────────────────────────────────────────────────────────────

describe("VerificationPage - header", () => {
  it("renders page title and status badge", () => {
    render(<_VerificationPage />);
    expect(screen.getByText("Verification")).toBeInTheDocument();
    expect(screen.getByTestId("status-badge")).toBeInTheDocument();
  });

  it("status badge shows Incomplete", () => {
    render(<_VerificationPage />);
    expect(screen.getByTestId("status-badge")).toHaveTextContent(/incomplete/i);
  });
});

describe("VerificationPage - status panels", () => {
  it("incomplete: Continue CTA routes to step 2", () => {
    render(<_VerificationPage />);
    const cta = screen.getByTestId("status-cta-btn");
    expect(cta).toHaveTextContent(/continue verification/i);
    clickBtn("status-cta-btn");
    expect(mockPush).toHaveBeenCalledWith("/educator-onboarding?step=2");
  });

  it("not_started: routes to step 1", () => {
    _hookState.current = makeHook({
      status: VERIFICATION_STATUS.NOT_STARTED,
      resumeStep: 1,
      data: { timeline: [], documents: [], rejectionReason: null },
    });
    render(<_VerificationPage />);
    clickBtn("empty-panel-cta-btn");
    expect(mockPush).toHaveBeenCalledWith("/educator-onboarding?step=1");
  });

  it("pending: no CTA, shows submitted copy", () => {
    _hookState.current = makeHook({
      status: VERIFICATION_STATUS.PENDING, isPending: true, isIncomplete: false,
      data: { timeline: TIMELINE, documents: [], rejectionReason: null },
    });
    render(<_VerificationPage />);
    expect(screen.queryByTestId("status-cta-btn")).not.toBeInTheDocument();
    expect(screen.getByText(/application submitted/i)).toBeInTheDocument();
  });

  it("under_review: no CTA, shows review heading", () => {
    _hookState.current = makeHook({
      status: VERIFICATION_STATUS.UNDER_REVIEW, isPending: true, isIncomplete: false,
      data: { timeline: TIMELINE, documents: [], rejectionReason: null },
    });
    render(<_VerificationPage />);
    expect(screen.queryByTestId("status-cta-btn")).not.toBeInTheDocument();
    expect(screen.getByText(/application under review/i)).toBeInTheDocument();
  });

  it("verified: checkmark text, no CTA", () => {
    _hookState.current = makeHook({
      status: VERIFICATION_STATUS.VERIFIED, isVerified: true, isIncomplete: false,
      data: { timeline: TIMELINE, documents: [], rejectionReason: null },
    });
    render(<_VerificationPage />);
    expect(screen.getByText(/verified educator/i)).toBeInTheDocument();
    expect(screen.queryByTestId("status-cta-btn")).not.toBeInTheDocument();
  });
});

describe("VerificationPage - rejected state", () => {
  beforeEach(() => {
    _hookState.current = makeHook({
      status: VERIFICATION_STATUS.REJECTED, isRejected: true, isIncomplete: false,
      data: { timeline: TIMELINE, documents: [], rejectionReason: "Photo was not legible.", reviewedAt: "2024-01-02T10:00:00.000Z" },
    });
  });

  it("shows rejection panel with reason", () => {
    render(<_VerificationPage />);
    expect(screen.getByText(/photo was not legible/i)).toBeInTheDocument();
  });

  it("resubmit CTA routes to step 1", () => {
    render(<_VerificationPage />);
    expect(screen.getByTestId("status-cta-btn")).toHaveTextContent(/resubmit/i);
    clickBtn("status-cta-btn");
    expect(mockPush).toHaveBeenCalledWith("/educator-onboarding?step=1");
  });

  it("no rejection panel for non-rejected status", () => {
    _hookState.current = makeHook();
    render(<_VerificationPage />);
    expect(screen.queryByTestId("rejection-panel")).not.toBeInTheDocument();
  });
});

describe("VerificationPage - timeline", () => {
  it("renders timeline panel with entries", () => {
    render(<_VerificationPage />);
    expect(screen.getByText("Identity verification")).toBeInTheDocument();
  });
});

describe("VerificationPage - documents (masked)", () => {
  beforeEach(() => {
    _hookState.current = makeHook({ data: { timeline: TIMELINE, documents: DOCS, rejectionReason: null } });
  });

  it("renders masked filename - no raw URL", () => {
    render(<_VerificationPage />);
    const fn = screen.getByText("passport.jpg");
    expect(fn).toBeInTheDocument();
    expect(fn.textContent).not.toMatch(/^https?:\/\//);
  });

  it("View button fetches signed URL and opens new tab with noopener", async () => {
    mockFetchSignedUrl.mockResolvedValue({ signedUrl: "https://cdn.example.com/signed?token=xyz", expiresAt: "2024-01-01T01:00:00Z" });
    const spy = vi.spyOn(window, "open").mockImplementation(() => null);
    render(<_VerificationPage />);
    clickBtn("doc-view-btn");
    await waitFor(() => expect(mockFetchSignedUrl).toHaveBeenCalledWith("doc_1"));
    await waitFor(() => expect(spy).toHaveBeenCalledWith(expect.stringContaining("signed?token="), "_blank", "noopener,noreferrer"));
    spy.mockRestore();
  });
});

describe("VerificationPage - error state", () => {
  it("renders error message", () => {
    _hookState.current = makeHook({ loading: false, error: "Network timeout", data: null });
    render(<_VerificationPage />);
    expect(screen.getByText(/could not load verification status/i)).toBeInTheDocument();
    expect(screen.getByText(/network timeout/i)).toBeInTheDocument();
  });
});

describe("VerificationPage - refresh button", () => {
  it("calls refresh() when clicked", async () => {
    render(<_VerificationPage />);
    clickBtn("refresh-btn");
    await waitFor(() => expect(_hookState.current.refresh).toHaveBeenCalledOnce());
  });
});
