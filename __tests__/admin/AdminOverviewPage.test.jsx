/**
 * Admin overview page — empty-database bootstrap experience (#339).
 * -------------------------------------------------------------------
 * Fresh deployments must show guided hints and a setup checklist instead of
 * confusing zeroes, with a dismiss-forever escape hatch. These tests cover the
 * empty snapshot, the data-driven disappearance of hints once real data
 * arrives, checklist progress derivation, and the persisted dismissal.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

vi.mock("@/lib/config/font.config", () => ({
  poppins_400: { className: "" },
  poppins_500: { className: "" },
  poppins_600: { className: "" },
}));

vi.mock("next/link", () => ({
  default: ({ href, children, ...props }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

const serviceState = vi.hoisted(() => ({ current: null }));
vi.mock("@/lib/actions/admin-overview", () => ({
  fetchAdminOverview: () => serviceState.current(),
}));

function makeSnapshot({ counts = {}, settings = {}, empty = true } = {}) {
  return {
    generatedAt: "2026-08-25T00:00:00.000Z",
    empty,
    counts: {
      mentors: { label: "Mentors", value: 0 },
      categories: { label: "Categories", value: 0 },
      courses: { label: "Courses", value: 0 },
      books: { label: "Books", value: 0 },
      students: { label: "Students", value: 0 },
      transactions: { label: "Transactions", value: 0 },
      ...counts,
    },
    settings: {
      platformName: { label: "Platform name", configured: false },
      paymentSettings: { label: "Payment settings", configured: false },
      ...settings,
    },
  };
}

let AdminOverviewPage;
beforeEach(async () => {
  localStorage.clear();
  if (!AdminOverviewPage) {
    const mod = await import("@/app/[locale]/admin/page");
    AdminOverviewPage = mod.default;
  }
});

describe("AdminOverviewPage — empty database bootstrap", () => {
  it("renders skeleton placeholders while loading", () => {
    serviceState.current = () => new Promise(() => {});
    const { container } = render(<AdminOverviewPage />);

    expect(screen.getByText("Overview")).toBeInTheDocument();
    expect(container.querySelector('[data-slot="skeleton"]')).not.toBeNull();
  });

  it("shows guided hints instead of zeros on a fresh deployment", async () => {
    serviceState.current = () => Promise.resolve(makeSnapshot());
    render(<AdminOverviewPage />);

    expect(await screen.findByText("Welcome to your new platform")).toBeInTheDocument();
    expect(screen.getByText("Getting Started")).toBeInTheDocument();

    // Guided widget hints (also present as checklist rows)
    expect(screen.getAllByText("Invite your first mentor").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Create a category").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Publish your first course").length).toBeGreaterThanOrEqual(1);

    // No silent zeroes anywhere
    expect(screen.queryByText("0")).toBeNull();
  });

  it("renders the setup checklist with 0/6 progress on an empty database", async () => {
    serviceState.current = () => Promise.resolve(makeSnapshot());
    render(<AdminOverviewPage />);

    expect(await screen.findByText("Getting Started")).toBeInTheDocument();
    expect(screen.getByText("0/6 complete")).toBeInTheDocument();
  });

  it("hides guided hints and checklist progress ticks once real data arrives", async () => {
    serviceState.current = () =>
      Promise.resolve(
        makeSnapshot({
          empty: false,
          counts: {
            mentors: { label: "Mentors", value: 12 },
            categories: { label: "Categories", value: 3 },
            courses: { label: "Courses", value: 5 },
            books: { label: "Books", value: 8 },
            students: { label: "Students", value: 120 },
            transactions: { label: "Transactions", value: 40 },
          },
          settings: {
            platformName: { label: "Platform name", configured: true },
            paymentSettings: { label: "Payment settings", configured: true },
          },
        })
      );
    render(<AdminOverviewPage />);

    expect(await screen.findByText("12")).toBeInTheDocument();
    expect(screen.queryByText("Welcome to your new platform")).toBeNull();
    // Widget hint (with CTA) is replaced by the real count; the checklist row
    // keeps its label but is marked complete.
    expect(screen.queryByText("Invite mentors")).toBeNull();
    expect(screen.getByText("6/6 complete")).toBeInTheDocument();
  });

  it("derives partial checklist progress from settings values and counts", async () => {
    serviceState.current = () =>
      Promise.resolve(
        makeSnapshot({
          counts: {
            categories: { label: "Categories", value: 2 },
          },
        })
      );
    render(<AdminOverviewPage />);

    expect(await screen.findByText("Getting Started")).toBeInTheDocument();
    expect(screen.getByText("1/6 complete")).toBeInTheDocument();
  });

  it("dismisses the setup guide forever and persists the choice", async () => {
    const user = userEvent.setup();
    serviceState.current = () => Promise.resolve(makeSnapshot());
    const { unmount } = render(<AdminOverviewPage />);

    await screen.findByText("Getting Started");

    await user.click(screen.getByRole("button", { name: /dismiss setup guide forever/i }));

    expect(screen.queryByText("Getting Started")).toBeNull();
    expect(screen.queryByText("Welcome to your new platform")).toBeNull();
    expect(localStorage.getItem("dnb-bootstrap-dismissed")).toBe("true");

    // Remount — the dismissal must survive navigation / refresh.
    unmount();
    serviceState.current = () => Promise.resolve(makeSnapshot());
    render(<AdminOverviewPage />);
    await act(async () => {});

    expect(screen.queryByText("Getting Started")).toBeNull();
  });

  it("renders an error state when the overview service fails", async () => {
    serviceState.current = () => Promise.reject(new Error("Service unavailable"));
    render(<AdminOverviewPage />);

    expect(await screen.findByText(/failed to load overview/i)).toBeInTheDocument();
    expect(screen.getByText("Service unavailable")).toBeInTheDocument();
  });
});
