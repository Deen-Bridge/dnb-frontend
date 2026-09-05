/**
 * Admin Spaces Oversight page — loading / data / filter tests (#270).
 * -------------------------------------------------------------------
 * The page renders a table of community spaces with title, host, type,
 * scheduled time, status, participant count, and flags. Live rooms are
 * sorted to the top with a pulsing status dot. Filters by host and
 * status are available. Em-dash is rendered for unknown participant
 * counts instead of zeros.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, within } from "@testing-library/react";

vi.mock("@/lib/config/font.config", () => ({
  poppins_400: { className: "" },
  poppins_500: { className: "" },
  poppins_600: { className: "" },
}));

vi.mock("@/components/ui/empty-state", () => ({
  EmptyState: ({ title, description }) => (
    <div>
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  ),
}));

let AdminSpacesPage;
beforeEach(async () => {
  if (!AdminSpacesPage) {
    const mod = await import("@/app/[locale]/admin/spaces/page");
    AdminSpacesPage = mod.default;
  }
});

describe("AdminSpacesPage — states", () => {
  it("renders skeleton placeholders while loading", () => {
    const { container } = render(<AdminSpacesPage />);
    expect(screen.getByText("Spaces Oversight")).toBeInTheDocument();
    expect(
      container.querySelector('[data-slot="skeleton"]')
    ).not.toBeNull();
  });

  it("renders summary stat cards after data loads", async () => {
    render(<AdminSpacesPage />);

    await screen.findByText("Live Now");
    expect(screen.getByText("Scheduled")).toBeInTheDocument();
    expect(screen.getByText("Ended")).toBeInTheDocument();
  });

  it("renders the spaces table with data after loading", async () => {
    render(<AdminSpacesPage />);

    await screen.findByText("Quran Study Circle");
    expect(screen.getByText("Youth Halaqah")).toBeInTheDocument();
    expect(screen.getByText("Islamic History Discussion")).toBeInTheDocument();
  });

  it("renders pulsing status dot for live rooms", async () => {
    render(<AdminSpacesPage />);
    await screen.findByText("Quran Study Circle");

    expect(screen.getAllByLabelText("Live").length).toBeGreaterThanOrEqual(1);
  });

  it("renders em-dash for unknown participant counts", async () => {
    render(<AdminSpacesPage />);
    await screen.findByText("Quran Study Circle");

    const dashes = screen.getAllByText("—");
    expect(dashes.length).toBeGreaterThanOrEqual(1);
  });

  it("renders participant count for live rooms", async () => {
    render(<AdminSpacesPage />);
    await screen.findByText("Quran Study Circle");

    expect(screen.getByText("24")).toBeInTheDocument();
  });

  it("renders Jitsi badge for room type", async () => {
    render(<AdminSpacesPage />);
    await screen.findByText("Quran Study Circle");

    const jitsiBadges = screen.getAllByText("Jitsi");
    expect(jitsiBadges.length).toBeGreaterThanOrEqual(1);
  });

  it("renders filter controls", async () => {
    render(<AdminSpacesPage />);
    await screen.findByText("Quran Study Circle");

    expect(screen.getByLabelText("Status")).toBeInTheDocument();
    expect(screen.getByLabelText("Host")).toBeInTheDocument();
  });
});
