/**
 * VerifiedBadge — renders only when the subject is verified.
 */
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { VerifiedBadge } from "@/components/atoms/VerifiedBadge";

describe("VerifiedBadge", () => {
  it("renders for a verified user (via user object)", () => {
    render(<VerifiedBadge user={{ role: "educator", isVerified: true }} />);
    expect(screen.getByText("Verified")).toBeInTheDocument();
  });

  it("renders for verificationStatus === 'verified'", () => {
    render(<VerifiedBadge user={{ verificationStatus: "verified" }} />);
    expect(screen.getByText("Verified")).toBeInTheDocument();
  });

  it("renders nothing for an unverified user", () => {
    const { container } = render(
      <VerifiedBadge user={{ role: "educator" }} />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("renders nothing for a null subject", () => {
    const { container } = render(<VerifiedBadge user={null} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("honours an explicit `verified` boolean over the user object", () => {
    const { container, rerender } = render(
      <VerifiedBadge verified={false} user={{ isVerified: true }} />
    );
    expect(container).toBeEmptyDOMElement();

    rerender(<VerifiedBadge verified={true} user={null} />);
    expect(screen.getByText("Verified")).toBeInTheDocument();
  });

  it("can hide its label (icon-only) while still rendering", () => {
    render(<VerifiedBadge user={{ isVerified: true }} showLabel={false} />);
    expect(screen.queryByText("Verified")).not.toBeInTheDocument();
    // The badge element itself is still present (icon-only)
    expect(document.querySelector('[data-slot="badge"]')).toBeInTheDocument();
  });
});
