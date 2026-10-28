/**
 * LearningProgress — dashboard study-progress card
 * ------------------------------------------------
 * Until the monthly activity pipeline lands, the card shows an honest empty
 * state ("No activity yet", #504) instead of a "coming soon" placeholder or
 * an invisible chart. These tests pin:
 *   - the card chrome (title, description, footer copy),
 *   - the empty state and that no chart is mounted on the card,
 *   - the chart component itself (a "course" and a "book" series, no data
 *     points), which stays ready for when the activity feed is connected.
 *
 * `recharts` is mocked so the chart's series configuration can be asserted
 * without depending on SVG layout in jsdom.
 */
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("recharts", () => ({
  ResponsiveContainer: ({ children }) => <div data-testid="responsive-container">{children}</div>,
  BarChart: ({ children, data }) => (
    <div data-testid="bar-chart" data-points={String(Array.isArray(data) ? data.length : -1)}>
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
import LearningProgressChart from "@/components/organisms/dashboard/LearningProgressChart";

describe("LearningProgress", () => {
  it("renders the study progress card with its title and description", () => {
    render(<LearningProgress />);

    expect(screen.getByText("Study Progress")).toBeInTheDocument();
    expect(screen.getByText("Monthly study activity")).toBeInTheDocument();
  });

  it("shows an honest empty state while there is no monthly activity", () => {
    render(<LearningProgress />);

    expect(screen.getByText("No activity yet")).toBeInTheDocument();
    expect(
      screen.getByText("Your course and reading activity will appear here once you get started.")
    ).toBeInTheDocument();
    expect(screen.queryByText(/coming soon/i)).not.toBeInTheDocument();
  });

  it("explains what is being tracked in the footer", () => {
    render(<LearningProgress />);

    expect(screen.getByText("Tracking your memorization and study over time")).toBeInTheDocument();
  });

  it("does not mount a chart on the card until there is data to plot", () => {
    render(<LearningProgress />);

    expect(screen.queryByTestId("bar-chart")).not.toBeInTheDocument();
  });
});

describe("LearningProgressChart", () => {
  it("plots a course and a book series", () => {
    render(<LearningProgressChart />);

    const series = screen.getAllByTestId("bar").map((bar) => bar.getAttribute("data-key"));

    expect(series).toEqual(["course", "book"]);
  });

  it("plots no data points until the monthly activity feed is connected", () => {
    render(<LearningProgressChart />);

    expect(screen.getByTestId("bar-chart").getAttribute("data-points")).toBe("0");
  });
});
