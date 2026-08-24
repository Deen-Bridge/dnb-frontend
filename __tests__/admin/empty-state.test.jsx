/**
 * EmptyState — shared admin primitive render tests (#340).
 * --------------------------------------------------------
 * Covers the reusable empty/placeholder card used across the admin surfaces
 * (member list "no admins yet", failed-load fallback, etc). Asserts only the
 * component's stable public contract: title/heading, description, icon, and the
 * action/children slot.
 */
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

// font.config pulls next/font at module load; stub it so rendering never
// depends on Next's build-time font pipeline.
vi.mock("@/lib/config/font.config", () => ({
  poppins_400: { className: "" },
  poppins_500: { className: "" },
  poppins_600: { className: "" },
  ibmPlexArabic: { className: "", variable: "" },
}));

import { EmptyState } from "@/components/ui/empty-state";

function StarIcon(props) {
  return <svg data-testid="empty-icon" {...props} />;
}

describe("EmptyState", () => {
  it("renders the title and description", () => {
    render(<EmptyState title="No admins yet" description="Invite your first teammate." />);
    expect(screen.getByText("No admins yet")).toBeInTheDocument();
    expect(screen.getByText("Invite your first teammate.")).toBeInTheDocument();
  });

  it("falls back to the `heading` prop when `title` is absent", () => {
    render(<EmptyState heading="Nothing here" />);
    expect(screen.getByText("Nothing here")).toBeInTheDocument();
  });

  it("renders a provided icon component", () => {
    render(<EmptyState icon={StarIcon} title="Empty" />);
    expect(screen.getByTestId("empty-icon")).toBeInTheDocument();
  });

  it("renders an action element in the action slot", () => {
    render(
      <EmptyState title="Failed to load" action={<button type="button">Try again</button>} />
    );
    expect(screen.getByRole("button", { name: /try again/i })).toBeInTheDocument();
  });

  it("renders children as the action when no `action` is given", () => {
    render(
      <EmptyState title="Empty">
        <button type="button">Invite admin</button>
      </EmptyState>
    );
    expect(screen.getByRole("button", { name: /invite admin/i })).toBeInTheDocument();
  });

  it("does not render an icon container when no icon is provided", () => {
    const { container } = render(<EmptyState title="Empty" />);
    expect(container.querySelector("svg")).toBeNull();
  });
});
