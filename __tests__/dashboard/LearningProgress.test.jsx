/**
 * LearningProgress — dashboard study-progress card
 * ------------------------------------------------
 * The card ships a chart region plus the "coming soon" placeholder that
 * #504 tracks. Both have to keep rendering until the monthly activity
 * pipeline lands:
 *   - the card chrome (title, description, footer copy),
 *   - the "coming soon" placeholder for the empty state,
 *   - the chart itself, wired up with a "course" and a "book" series.
 *
 * `recharts` is mocked so the chart's series configuration can be asserted
 * without depending on SVG layout in jsdom, and `next/dynamic` is mocked so
 * the lazily imported chart actually mounts outside of the Next.js runtime.
 */
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("next/dynamic", async () => {
  const React = await import("react");
  return {
    default: (loader) => {
      const Lazy = React.lazy(loader);
      const DynamicComponent = (props) =>
        React.createElement(
          React.Suspense,
          { fallback: null },
          React.createElement(Lazy, props)
        );
      DynamicComponent.displayName = "DynamicComponent";
      return DynamicComponent;
    },
  };
});

vi.mock("recharts", () => ({
  ResponsiveContainer: ({ children }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  BarChart: ({ children, data }) => (
    <div
      data-testid="bar-chart"
      data-points={String(Array.isArray(data) ? data.length : -1)}
    >
      {children}
    </div>
  ),
  Bar: ({ dataKey }) => <div data-testid="bar" data-key={dataKey} />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  XAxis: () => <div data-testid="x-axis" />,
  Tooltip: () => <div data-testid="chart-tooltip" />,
  Legend: () => <div data-testid="chart-legend" />,
}));

import LearningProgress from "@/components/organisms/dashboard/LearningProgress";

describe("LearningProgress", () => {
  it("renders the study progress card with its title and description", () => {
    render(<LearningProgress />);

    expect(screen.getByText("Study Progress")).toBeInTheDocument();
    expect(screen.getByText("Monthly activity breakdown")).toBeInTheDocument();
  });

  it("shows the coming soon placeholder while there is no monthly activity", () => {
    render(<LearningProgress />);

    expect(
      screen.getByText("Monthly activity data coming soon")
    ).toBeInTheDocument();
  });

  it("explains what is being tracked in the footer", () => {
    render(<LearningProgress />);

    expect(
      screen.getByText("Tracking your memorization and study over time")
    ).toBeInTheDocument();
  });

  it("mounts the chart alongside the placeholder", async () => {
    render(<LearningProgress />);

    expect(await screen.findByTestId("bar-chart")).toBeInTheDocument();
    expect(screen.getByText("Monthly activity data coming soon")).toBeInTheDocument();
  });

  it("plots a course and a book series", async () => {
    render(<LearningProgress />);

    await screen.findByTestId("bar-chart");

    const series = screen
      .getAllByTestId("bar")
      .map((bar) => bar.getAttribute("data-key"));

    expect(series).toEqual(["course", "book"]);
  });

  it("plots no data points until the monthly activity feed is connected", async () => {
    render(<LearningProgress />);

    const chart = await screen.findByTestId("bar-chart");

    expect(chart.getAttribute("data-points")).toBe("0");
  });
});
