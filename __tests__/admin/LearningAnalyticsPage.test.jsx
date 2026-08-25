/**
 * Learning analytics page — loading / data / error state tests (#322).
 * -------------------------------------------------------------------
 * The page renders a course-completion funnel, session-length, lessons and
 * reading-depth visualizations. Metrics the platform does not instrument yet
 * must render an explicit "Not tracked yet" placeholder instead of a silent
 * zero. These tests mock the analytics service and assert the presentational
 * branching only.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("@/lib/config/font.config", () => ({
  poppins_400: { className: "" },
  poppins_500: { className: "" },
  poppins_600: { className: "" },
}));

const serviceState = vi.hoisted(() => ({ current: null }));
vi.mock("@/lib/actions/admin-learning-analytics", () => ({
  fetchEngagementAnalytics: () => serviceState.current(),
}));

function makeEngagement(overrides = {}) {
  return {
    generatedAt: "2026-08-25T00:00:00.000Z",
    totals: {
      students: { label: "Total Students", value: 842, tracked: true },
      coursesEnrolled: { label: "Courses Enrolled", value: 1284, tracked: true },
      lessonsCompleted: { label: "Lessons Completed", value: 0, tracked: false },
      avgSessionLength: { label: "Avg. Session Length", value: 0, tracked: false },
    },
    funnel: [
      { stage: "enrolled", label: "Enrolled", value: 1284, tracked: true },
      { stage: "started", label: "Started", value: 0, tracked: false },
      { stage: "quarter", label: "25% Complete", value: 0, tracked: false },
      { stage: "completed", label: "Completed", value: 0, tracked: false },
    ],
    sessionLength: { tracked: false, avgMinutes: null },
    lessonsCompleted: { tracked: false, buckets: [{ range: "1–5", value: 0 }] },
    readingDepth: { tracked: false, buckets: [{ range: "0–25%", value: 0 }] },
    ...overrides,
  };
}

let LearningAnalyticsPage;
beforeEach(async () => {
  if (!LearningAnalyticsPage) {
    const mod = await import("@/app/[locale]/admin/analytics/learning/page");
    LearningAnalyticsPage = mod.default;
  }
});

describe("LearningAnalyticsPage — states", () => {
  it("renders skeleton placeholders while loading", () => {
    serviceState.current = () => new Promise(() => {});
    const { container } = render(<LearningAnalyticsPage />);
    expect(screen.getByText("Learning Analytics")).toBeInTheDocument();
    expect(container.querySelector('[data-slot="skeleton"]')).not.toBeNull();
  });

  it("renders the course completion funnel with all four stages", async () => {
    serviceState.current = () => Promise.resolve(makeEngagement());
    render(<LearningAnalyticsPage />);

    expect(await screen.findByText("Course Completion Funnel")).toBeInTheDocument();
    expect(screen.getByText("Enrolled")).toBeInTheDocument();
    expect(screen.getByText("Started")).toBeInTheDocument();
    expect(screen.getByText("25% Complete")).toBeInTheDocument();
    expect(screen.getByText("Completed")).toBeInTheDocument();
    expect(screen.getAllByText("1,284").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("842")).toBeInTheDocument();
  });

  it("shows 'Not tracked yet' placeholders instead of silent zeros", async () => {
    serviceState.current = () => Promise.resolve(makeEngagement());
    render(<LearningAnalyticsPage />);

    await screen.findByText("Course Completion Funnel");

    const placeholders = screen.getAllByText(/not tracked yet/i);
    // 3 funnel stages + session length + reading depth + lessons distribution
    expect(placeholders.length).toBeGreaterThanOrEqual(6);
    // Card titles and placeholder titles share the same heading text
    expect(screen.getAllByText("Library Reading Depth").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Lessons-Completed Distribution").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Average Session Length").length).toBeGreaterThanOrEqual(1);
  });

  it("renders an error state when the analytics service fails", async () => {
    serviceState.current = () => Promise.reject(new Error("Service unavailable"));
    render(<LearningAnalyticsPage />);

    expect(await screen.findByText(/failed to load analytics/i)).toBeInTheDocument();
    expect(screen.getByText("Service unavailable")).toBeInTheDocument();
  });
});
