/**
 * BlurImage — tests for the privacy-blur media wrapper (#268).
 * ------------------------------------------------------------
 * Validates:
 *  - No blur applied when global blur is OFF
 *  - Blur applied when global blur is ON
 *  - Hover reveals blurred content
 *  - forceBlur overrides global state
 *  - Keyboard (Enter/Space) reveals and hides
 *  - prefers-reduced-motion disables blur regardless
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

// ── Mock next/image so it renders a plain <img> ────────────────────────
vi.mock("next/image", () => ({
  __esModule: true,
  default: (props) => {
    // eslint-disable-next-line no-unused-vars
    const { priority, fill, ...imgProps } = props;
    return <img {...imgProps} />;
  },
}));

// ── Mock MediaBlurContext ──────────────────────────────────────────────
let blurState = { blurEnabled: false, reducedMotion: false };

vi.mock("@/contexts/MediaBlurContext", () => ({
  useMediaBlurContext: () => blurState,
}));

import BlurImage from "@/components/ui/blur-image";

beforeEach(() => {
  blurState = { blurEnabled: false, reducedMotion: false };
});

// ── Tests ──────────────────────────────────────────────────────────────

describe("BlurImage", () => {
  it("renders without blur when blur is disabled", () => {
    blurState = { blurEnabled: false, reducedMotion: false };
    render(<BlurImage src="/test.jpg" alt="Test" width={100} height={100} />);

    const img = screen.getByRole("img", { name: "Test" });
    expect(img).toBeInTheDocument();
    expect(img.className).not.toContain("blur");
  });

  it("applies blur-lg when blur is enabled", () => {
    blurState = { blurEnabled: true, reducedMotion: false };
    render(<BlurImage src="/test.jpg" alt="Test" width={100} height={100} />);

    const img = screen.getByRole("img", { name: "Test" });
    expect(img.className).toContain("blur-lg");
  });

  it("shows overlay text when blurred", () => {
    blurState = { blurEnabled: true, reducedMotion: false };
    render(<BlurImage src="/test.jpg" alt="Test" width={100} height={100} />);

    expect(screen.getByText("Hover or click to reveal")).toBeInTheDocument();
  });

  it("reveals on mouseEnter and re-hides on mouseLeave", () => {
    blurState = { blurEnabled: true, reducedMotion: false };
    const { container } = render(
      <BlurImage src="/test.jpg" alt="Test" width={100} height={100} />,
    );

    const wrapper = container.querySelector(".group\\/media-blur");

    // Initially blurred
    expect(screen.getByText("Hover or click to reveal")).toBeInTheDocument();

    // Hover → reveal
    fireEvent.mouseEnter(wrapper);
    const imgAfterHover = screen.getByRole("img", { name: "Test" });
    expect(imgAfterHover.className).not.toContain("blur-lg");
    expect(screen.queryByText("Hover or click to reveal")).not.toBeInTheDocument();

    // Mouse leave → re-blur
    fireEvent.mouseLeave(wrapper);
    expect(screen.getByText("Hover or click to reveal")).toBeInTheDocument();
  });

  it("forceBlur always applies blur regardless of global state", () => {
    blurState = { blurEnabled: false, reducedMotion: false };
    render(
      <BlurImage src="/test.jpg" alt="Test" width={100} height={100} forceBlur />,
    );

    const img = screen.getByRole("img", { name: "Test" });
    expect(img.className).toContain("blur-lg");
  });

  it("does not apply blur when reducedMotion is true", () => {
    blurState = { blurEnabled: true, reducedMotion: true };
    render(
      <BlurImage src="/test.jpg" alt="Test" width={100} height={100} forceBlur />,
    );

    const img = screen.getByRole("img", { name: "Test" });
    expect(img.className).not.toContain("blur");
  });

  it("supports keyboard reveal with Enter", () => {
    blurState = { blurEnabled: true, reducedMotion: false };
    const { container } = render(
      <BlurImage src="/test.jpg" alt="Test" width={100} height={100} />,
    );

    const wrapper = container.querySelector(".group\\/media-blur");
    expect(wrapper).toHaveAttribute("tabIndex", "0");
    expect(wrapper).toHaveAttribute("role", "button");

    fireEvent.keyDown(wrapper, { key: "Enter" });
    expect(screen.queryByText("Hover or click to reveal")).not.toBeInTheDocument();

    // Toggle back
    fireEvent.keyDown(wrapper, { key: "Enter" });
    expect(screen.getByText("Hover or click to reveal")).toBeInTheDocument();
  });

  it("supports keyboard reveal with Space", () => {
    blurState = { blurEnabled: true, reducedMotion: false };
    const { container } = render(
      <BlurImage src="/test.jpg" alt="Test" width={100} height={100} />,
    );

    const wrapper = container.querySelector(".group\\/media-blur");

    fireEvent.keyDown(wrapper, { key: " " });
    expect(screen.queryByText("Hover or click to reveal")).not.toBeInTheDocument();
  });

  it("renders arbitrary children when provided", () => {
    blurState = { blurEnabled: true, reducedMotion: false };
    render(
      <BlurImage>
        <div data-testid="custom-child">Custom content</div>
      </BlurImage>,
    );

    expect(screen.getByTestId("custom-child")).toBeInTheDocument();
    expect(screen.getByText("Hover or click to reveal")).toBeInTheDocument();
  });

  it("sets aria-label when blurred", () => {
    blurState = { blurEnabled: true, reducedMotion: false };
    const { container } = render(
      <BlurImage src="/test.jpg" alt="Test" width={100} height={100} />,
    );

    const wrapper = container.querySelector(".group\\/media-blur");
    expect(wrapper).toHaveAttribute("aria-label", "Click or hover to reveal media");
  });

  it("removes aria-label when revealed", () => {
    blurState = { blurEnabled: true, reducedMotion: false };
    const { container } = render(
      <BlurImage src="/test.jpg" alt="Test" width={100} height={100} />,
    );

    const wrapper = container.querySelector(".group\\/media-blur");
    fireEvent.mouseEnter(wrapper);
    expect(wrapper).not.toHaveAttribute("aria-label");
  });
});
