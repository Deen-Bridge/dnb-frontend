/**
 * ErrorBoundaryUI — shared error screen tests (#196).
 * ----------------------------------------------------
 * The reusable boundary shows a clear, type-appropriate message (never a stack
 * trace), a Try again button that calls `reset`, a Go home fallback link, and a
 * Report issue action carrying the captured Sentry report ID.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

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

const captureMock = vi.hoisted(() => vi.fn());
vi.mock("@/lib/sentry/captureClientError", () => ({
  captureClientError: () => captureMock(),
}));

import ErrorBoundaryUI from "@/components/molecules/errors/ErrorBoundaryUI";

beforeEach(() => {
  vi.clearAllMocks();
  captureMock.mockResolvedValue(null);
});

describe("ErrorBoundaryUI", () => {
  it("shows the network message for a network error", async () => {
    captureMock.mockResolvedValue("sentry-id-123");
    render(<ErrorBoundaryUI error={new Error("Failed to fetch")} reset={() => {}} />);
    expect(screen.getByText("Connection lost")).toBeInTheDocument();
    expect(screen.getByText(/check your internet connection/i)).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText(/report id: sentry-id-123/i)).toBeInTheDocument());
  });

  it("shows the server message for a server error", () => {
    render(
      <ErrorBoundaryUI error={{ response: { status: 500 }, message: "boom" }} reset={() => {}} />
    );
    expect(screen.getByText("Something went wrong on our end")).toBeInTheDocument();
  });

  it("shows the not-found message for a 404 error", () => {
    render(<ErrorBoundaryUI error={{ status: 404 }} reset={() => {}} />);
    expect(screen.getByText("Page not found")).toBeInTheDocument();
  });

  it("falls back to a generic message", () => {
    render(<ErrorBoundaryUI error={new Error("boom")} reset={() => {}} />);
    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
  });

  it("uses section-specific copy when provided", () => {
    render(
      <ErrorBoundaryUI
        error={new Error("boom")}
        reset={() => {}}
        title="Couldn't load AI chat"
        description="The AI chat failed to load."
      />
    );
    expect(screen.getByText("Couldn't load AI chat")).toBeInTheDocument();
    expect(screen.getByText("The AI chat failed to load.")).toBeInTheDocument();
  });

  it("calls reset when Try again is clicked", () => {
    const reset = vi.fn();
    render(<ErrorBoundaryUI error={new Error("boom")} reset={reset} />);
    fireEvent.click(screen.getByRole("button", { name: /try again/i }));
    expect(reset).toHaveBeenCalledTimes(1);
  });

  it("renders a Go home link to the configured destination", () => {
    render(<ErrorBoundaryUI error={new Error("boom")} reset={() => {}} homeHref="/dashboard/courses" />);
    expect(screen.getByRole("link", { name: /go home/i })).toHaveAttribute(
      "href",
      "/dashboard/courses"
    );
  });

  it("renders a Report issue link carrying the captured report ID", async () => {
    captureMock.mockResolvedValue("sentry-id-123");
    render(<ErrorBoundaryUI error={new Error("boom")} reset={() => {}} />);
    const reportLink = await screen.findByRole("link", { name: /report issue/i });
    expect(reportLink.getAttribute("href")).toContain("sentry-id-123");
  });
});
