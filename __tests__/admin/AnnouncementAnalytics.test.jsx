/**
 * Announcement analytics panel — reach & engagement (#305).
 * -------------------------------------------------------------------
 * The panel renders per-announcement metrics, an honest "not tracked yet" gap
 * for un-instrumented events, a reach bar chart, the shared range filter, and
 * a per-announcement table. These tests mock the service and assert the
 * presentational branching only.
 */
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// recharts' ResponsiveContainer reads element size via ResizeObserver, which
// jsdom does not provide. A no-op stub lets the chart render (empty) without
// crashing so the surrounding content can be asserted.
class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
globalThis.ResizeObserver = globalThis.ResizeObserver || ResizeObserverStub;

vi.setConfig({ testTimeout: 60000, hookTimeout: 60000 });

vi.mock("@/lib/config/font.config", () => ({
  poppins_400: { className: "" },
  poppins_500: { className: "" },
  poppins_600: { className: "" },
}));

const serviceState = vi.hoisted(() => ({ current: null }));
vi.mock("@/lib/actions/admin-announcements", () => ({
  fetchAnnouncementAnalytics: (...args) => serviceState.current(...args),
}));

function makeAnalytics(overrides = {}) {
  return {
    generatedAt: "2026-08-25T00:00:00.000Z",
    range: { from: null, to: null },
    totals: {
      impressions: { label: "Impressions", value: 11405, tracked: true },
      uniqueViewers: { label: "Unique Viewers", value: 6671, tracked: true },
      dismissRate: { label: "Dismiss Rate", value: 20.6, tracked: true, unit: "percent" },
      ctr: { label: "Click-through Rate", value: 0, tracked: false, unit: "percent" },
    },
    announcements: [
      {
        id: "ann_001",
        title: "New course: Seerah of the Prophet",
        sentAt: "2026-08-21T09:00:00.000Z",
        impressions: { value: 3421, tracked: true },
        uniqueViewers: { value: 1987, tracked: true },
        dismissRate: { value: 20.99, tracked: true, unit: "percent" },
        ctr: { value: 0, tracked: false, unit: "percent" },
      },
    ],
    ...overrides,
  };
}

import { AnnouncementAnalytics } from "@/components/admin/announcement-analytics";

describe("AnnouncementAnalytics", () => {
  it("renders skeleton placeholders while loading", () => {
    serviceState.current = () => new Promise(() => {});
    const { container } = render(<AnnouncementAnalytics />);

    expect(container.querySelector('[data-slot="skeleton"]')).not.toBeNull();
  });

  it("renders summary metrics for tracked events", async () => {
    serviceState.current = () => Promise.resolve(makeAnalytics());
    render(<AnnouncementAnalytics />);

    expect(await screen.findByText("11,405")).toBeInTheDocument();
    expect(screen.getByText("6,671")).toBeInTheDocument();
    expect(screen.getByText("20.6%")).toBeInTheDocument();
    expect(screen.getAllByText("Impressions").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Unique Viewers").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Dismiss Rate").length).toBeGreaterThanOrEqual(1);
  });

  it("shows an honest gap for events that are not instrumented yet", async () => {
    serviceState.current = () => Promise.resolve(makeAnalytics());
    render(<AnnouncementAnalytics />);

    await screen.findByText("11,405");
    expect(screen.getAllByText("Click-through Rate").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/not tracked yet/i).length).toBeGreaterThanOrEqual(1);
  });

  it("renders the reach comparison bar chart", async () => {
    serviceState.current = () => Promise.resolve(makeAnalytics());
    render(<AnnouncementAnalytics />);

    expect(await screen.findByText("Reach Comparison")).toBeInTheDocument();
    expect(screen.getByText("Impressions vs unique viewers across recent announcements")).toBeInTheDocument();
  });

  it("renders the per-announcement stats table", async () => {
    serviceState.current = () => Promise.resolve(makeAnalytics());
    render(<AnnouncementAnalytics />);

    expect(await screen.findByText("Per-Announcement Stats")).toBeInTheDocument();
    expect(screen.getByText("New course: Seerah of the Prophet")).toBeInTheDocument();
    expect(screen.getByText("3,421")).toBeInTheDocument();
    expect(screen.getByText("1,987")).toBeInTheDocument();
    expect(screen.getByText("21.0%")).toBeInTheDocument();
  });

  it("integrates the shared range filter", async () => {
    const user = userEvent.setup();
    serviceState.current = () => Promise.resolve(makeAnalytics());
    render(<AnnouncementAnalytics />);

    await screen.findByText("11,405");

    const trigger = screen.getByRole("button", { name: /select date range/i });
    expect(trigger).toBeInTheDocument();

    await user.click(trigger);
    expect(screen.getByRole("button", { name: /clear/i })).toBeInTheDocument();
  });

  it("renders an error state when the service fails", async () => {
    serviceState.current = () => Promise.reject(new Error("Service unavailable"));
    render(<AnnouncementAnalytics />);

    expect(await screen.findByText(/failed to load announcement analytics/i)).toBeInTheDocument();
    expect(screen.getByText("Service unavailable")).toBeInTheDocument();
  });
});
