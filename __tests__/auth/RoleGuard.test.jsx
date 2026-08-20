/**
 * RoleGuard — route-level authorization outcomes.
 * -----------------------------------------------
 *   - loading            → loader only, no children flash, no redirect
 *   - student            → redirect to /dashboard/unauthorized + Unauthorized screen
 *   - unverified educator→ VerificationRequired (recoverable), NO redirect
 *   - verified educator  → children
 *   - admin              → children
 *
 * Child screens are mocked to markers so we assert branch selection, not their
 * internals.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { CAPABILITIES } from "@/lib/auth/roles";

// Controlled auth + router
let _auth = { user: null, isAuthenticated: false, loading: true };
const replace = vi.fn();
const push = vi.fn();

vi.mock("@/hooks/useAuth", () => ({ useAuth: () => _auth }));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace, push }),
}));
// ProtectedRoute is authentication (tested separately). Compose over a
// pass-through so this suite isolates the capability/verification logic; the
// fail-closed-while-loading behaviour is asserted on the guard itself below.
vi.mock("@/hooks/protected-route", () => ({
  default: ({ children }) => children,
}));

vi.mock("@/components/molecules/loaders/rootLoader", () => ({
  default: () => <div data-testid="loader" />,
}));
vi.mock("@/components/molecules/errors/Unauthorized", () => ({
  default: () => <div data-testid="unauthorized" />,
}));
vi.mock("@/components/auth/VerificationRequired", () => ({
  default: () => <div data-testid="verify" />,
}));

import { RoleGuard } from "@/components/auth/RoleGuard";

function renderGuard() {
  return render(
    <RoleGuard capability={CAPABILITIES.COURSE_CREATE}>
      <div data-testid="content">secret create flow</div>
    </RoleGuard>
  );
}

beforeEach(() => {
  replace.mockClear();
  push.mockClear();
  _auth = { user: null, isAuthenticated: false, loading: true };
});

describe("RoleGuard", () => {
  it("shows only the loader while auth resolves — no children flash, no redirect", () => {
    _auth = { user: null, isAuthenticated: false, loading: true };
    renderGuard();
    expect(screen.getByTestId("loader")).toBeInTheDocument();
    expect(screen.queryByTestId("content")).not.toBeInTheDocument();
    expect(replace).not.toHaveBeenCalled();
  });

  it("redirects a student to the unauthorized screen", () => {
    _auth = { user: { role: "student" }, isAuthenticated: true, loading: false };
    renderGuard();
    expect(screen.queryByTestId("content")).not.toBeInTheDocument();
    expect(screen.getByTestId("unauthorized")).toBeInTheDocument();
    expect(replace).toHaveBeenCalledWith("/dashboard/unauthorized");
  });

  it("shows the verification prompt to an unverified educator — no redirect", () => {
    _auth = { user: { role: "educator" }, isAuthenticated: true, loading: false };
    renderGuard();
    expect(screen.queryByTestId("content")).not.toBeInTheDocument();
    expect(screen.getByTestId("verify")).toBeInTheDocument();
    expect(replace).not.toHaveBeenCalled();
  });

  it("renders children for a verified educator", () => {
    _auth = {
      user: { role: "educator", isVerified: true },
      isAuthenticated: true,
      loading: false,
    };
    renderGuard();
    expect(screen.getByTestId("content")).toBeInTheDocument();
    expect(replace).not.toHaveBeenCalled();
  });

  it("renders children for an admin", () => {
    _auth = { user: { role: "admin" }, isAuthenticated: true, loading: false };
    renderGuard();
    expect(screen.getByTestId("content")).toBeInTheDocument();
    expect(replace).not.toHaveBeenCalled();
  });
});
