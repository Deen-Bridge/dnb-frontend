/**
 * Admin team page — table loading / empty / error state tests (#340).
 * -------------------------------------------------------------------
 * The member table has no standalone `TableSkeleton` component; its
 * loading (skeleton rows), empty, and error states are rendered by the page
 * driven off `useAdminTeam`. These tests mock the hook to each state and assert
 * the correct branch renders. The guard, auth, and data hook are mocked so the
 * test targets the presentational branching only.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("@/lib/config/font.config", () => ({
  poppins_400: { className: "" },
  poppins_500: { className: "" },
  poppins_600: { className: "" },
  ibmPlexArabic: { className: "", variable: "" },
}));

vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

vi.mock("@/hooks/useAuth", () => ({
  default: () => ({ user: { id: "me", _id: "me" } }),
  useAuth: () => ({ user: { id: "me", _id: "me" } }),
}));

// Bypass the super-admin page guard — its behaviour is out of scope here.
vi.mock("@/components/auth/AdminTierGuard", () => ({
  default: ({ children }) => children,
}));

const hookState = vi.hoisted(() => ({ current: null }));
vi.mock("@/hooks/useAdminTeam", () => ({ default: () => hookState.current }));

// Radix touches these layout/pointer APIs jsdom omits.
beforeEach(() => {
  Element.prototype.scrollIntoView = vi.fn();
  Element.prototype.hasPointerCapture = vi.fn();
  Element.prototype.setPointerCapture = vi.fn();
  Element.prototype.releasePointerCapture = vi.fn();
  if (!window.ResizeObserver) {
    window.ResizeObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
    };
  }
});

function makeState(overrides = {}) {
  return {
    admins: [],
    isLoading: false,
    error: null,
    refresh: vi.fn(),
    inviteAdmin: vi.fn(),
    demoteMember: vi.fn(),
    revokeMember: vi.fn(),
    ...overrides,
  };
}

let AdminTeamPage;
beforeEach(async () => {
  if (!AdminTeamPage) {
    const mod = await import("@/app/[locale]/dashboard/admin/team/page");
    AdminTeamPage = mod.default;
  }
});

describe("AdminTeamPage — table states", () => {
  it("renders skeleton loading rows while loading", () => {
    hookState.current = makeState({ isLoading: true });
    const { container } = render(<AdminTeamPage />);
    // Table header renders and skeleton placeholders are present.
    expect(screen.getByText("Member")).toBeInTheDocument();
    expect(container.querySelector('[data-slot="skeleton"]')).not.toBeNull();
  });

  it("renders the empty state when there are no admins", () => {
    hookState.current = makeState({ admins: [] });
    render(<AdminTeamPage />);
    expect(screen.getByText(/no admins yet/i)).toBeInTheDocument();
  });

  it("renders the error state with the failure message", () => {
    hookState.current = makeState({ error: "Service unavailable" });
    render(<AdminTeamPage />);
    expect(screen.getByText(/failed to load/i)).toBeInTheDocument();
    expect(screen.getByText("Service unavailable")).toBeInTheDocument();
  });
});
