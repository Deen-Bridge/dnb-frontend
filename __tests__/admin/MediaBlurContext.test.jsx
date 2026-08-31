/**
 * MediaBlurContext & MediaBlurToggle — tests (#268).
 * ---------------------------------------------------
 * Validates:
 *  - MediaBlurProvider wraps children and provides context
 *  - useMediaBlurContext throws outside provider
 *  - MediaBlurToggle renders the switch and toggles state
 *  - Toggle is disabled when reduced-motion is active
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

// ── Mock next/image ────────────────────────────────────────────────────
vi.mock("next/image", () => ({
  __esModule: true,
  default: (props) => <img {...props} />,
}));

// ── Mock matchMedia ────────────────────────────────────────────────────
beforeEach(() => {
  localStorage.removeItem("dnb-media-blur");
  vi.restoreAllMocks();
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  });
});

import { MediaBlurProvider, useMediaBlurContext } from "@/contexts/MediaBlurContext";
import MediaBlurToggle from "@/components/admin/MediaBlurToggle";

// ── Consumer helper ────────────────────────────────────────────────────
function ConsumerSpy() {
  const ctx = useMediaBlurContext();
  return (
    <div>
      <span data-testid="blur">{String(ctx.blurEnabled)}</span>
      <span data-testid="loaded">{String(ctx.loaded)}</span>
      <button data-testid="toggle" onClick={ctx.toggleBlur}>
        Toggle
      </button>
    </div>
  );
}

describe("MediaBlurProvider", () => {
  it("provides context to children", async () => {
    render(
      <MediaBlurProvider>
        <ConsumerSpy />
      </MediaBlurProvider>,
    );

    // After mount, loaded should be true
    await screen.findByTestId("loaded");
    expect(screen.getByTestId("loaded").textContent).toBe("true");
    expect(screen.getByTestId("blur").textContent).toBe("false");
  });

  it("toggleBlur flips the state", async () => {
    render(
      <MediaBlurProvider>
        <ConsumerSpy />
      </MediaBlurProvider>,
    );

    await screen.findByTestId("loaded");

    fireEvent.click(screen.getByTestId("toggle"));
    expect(screen.getByTestId("blur").textContent).toBe("true");

    fireEvent.click(screen.getByTestId("toggle"));
    expect(screen.getByTestId("blur").textContent).toBe("false");
  });

  it("useMediaBlurContext throws outside provider", () => {
    // Suppress React error boundary console noise
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});

    expect(() => render(<ConsumerSpy />)).toThrow(
      "useMediaBlurContext must be used within a <MediaBlurProvider>",
    );

    spy.mockRestore();
  });
});

describe("MediaBlurToggle", () => {
  it("renders the toggle switch", async () => {
    render(
      <MediaBlurProvider>
        <MediaBlurToggle />
      </MediaBlurProvider>,
    );

    await screen.findByRole("switch", { name: "Toggle media blur" });
    const toggle = screen.getByRole("switch", { name: "Toggle media blur" });
    expect(toggle).toBeInTheDocument();
    expect(toggle).not.toBeChecked();
  });

  it("toggles the switch on click", async () => {
    render(
      <MediaBlurProvider>
        <MediaBlurToggle />
      </MediaBlurProvider>,
    );

    await screen.findByRole("switch", { name: "Toggle media blur" });
    const toggle = screen.getByRole("switch", { name: "Toggle media blur" });

    fireEvent.click(toggle);
    expect(toggle).toBeChecked();

    fireEvent.click(toggle);
    expect(toggle).not.toBeChecked();
  });

  it("disables switch when reduced motion is active", async () => {
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: vi.fn().mockImplementation((query) => ({
        matches: query === "(prefers-reduced-motion: reduce)",
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })),
    });

    render(
      <MediaBlurProvider>
        <MediaBlurToggle />
      </MediaBlurProvider>,
    );

    await screen.findByRole("switch", { name: "Toggle media blur" });
    const toggle = screen.getByRole("switch", { name: "Toggle media blur" });
    expect(toggle).toBeDisabled();
  });

  it("shows custom label and description", async () => {
    render(
      <MediaBlurProvider>
        <MediaBlurToggle label="Custom Label" description="Custom description" />
      </MediaBlurProvider>,
    );

    expect(screen.getByText("Custom Label")).toBeInTheDocument();
    expect(screen.getByText("Custom description")).toBeInTheDocument();
  });
});
