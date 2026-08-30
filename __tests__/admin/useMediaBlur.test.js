/**
 * useMediaBlur — tests for the media-blur gate (#268).
 * ---------------------------------------------------
 * Validates:
 *  - Default state (blur OFF)
 *  - overrideDefault initialises blur ON
 *  - localStorage persistence round-trip
 *  - prefers-reduced-motion forces blur OFF
 *  - toggleBlur and setBlur
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";

// ── Helpers ────────────────────────────────────────────────────────────

function setStoredBlur(value) {
  localStorage.setItem("dnb-media-blur", JSON.stringify({ blurEnabled: value }));
}

function clearStoredBlur() {
  localStorage.removeItem("dnb-media-blur");
}

function mockReducedMotion(matches) {
  const mql = {
    matches,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  };
  vi.spyOn(window, "matchMedia").mockImplementation((query) => {
    if (query === "(prefers-reduced-motion: reduce)") return mql;
    return { matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() };
  });
  return mql;
}

// ── Import the hook (dynamically so we can set up mocks first) ──────────

let useMediaBlur;

beforeEach(async () => {
  clearStoredBlur();
  vi.restoreAllMocks();
  // Default: no reduced motion
  mockReducedMotion(false);
  // Dynamically import to pick up the fresh module each time
  vi.resetModules();
  const mod = await import("@/hooks/useMediaBlur");
  useMediaBlur = mod.default;
});

afterEach(() => {
  clearStoredBlur();
});

// ── Tests ──────────────────────────────────────────────────────────────

describe("useMediaBlur", () => {
  it("starts with blur disabled by default", () => {
    const { result } = renderHook(() => useMediaBlur());
    expect(result.current.loaded).toBe(true);
    expect(result.current.blurEnabled).toBe(false);
  });

  it("uses overrideDefault when no stored value exists", async () => {
    clearStoredBlur();
    const { result } = renderHook(() => useMediaBlur({ overrideDefault: true }));

    // Wait for useEffect to run
    await act(async () => {
      await new Promise((r) => setTimeout(r, 0));
    });

    expect(result.current.blurEnabled).toBe(true);
    expect(result.current.loaded).toBe(true);
  });

  it("reads from localStorage when a stored value exists", async () => {
    setStoredBlur(true);

    const { result } = renderHook(() => useMediaBlur({ overrideDefault: false }));

    await act(async () => {
      await new Promise((r) => setTimeout(r, 0));
    });

    expect(result.current.blurEnabled).toBe(true);
  });

  it("persists to localStorage on toggle", async () => {
    const { result } = renderHook(() => useMediaBlur());

    await act(async () => {
      await new Promise((r) => setTimeout(r, 0));
    });

    expect(result.current.blurEnabled).toBe(false);

    act(() => {
      result.current.toggleBlur();
    });

    expect(result.current.blurEnabled).toBe(true);

    // Check localStorage
    const stored = JSON.parse(localStorage.getItem("dnb-media-blur"));
    expect(stored.blurEnabled).toBe(true);
  });

  it("setBlur forces a specific state", async () => {
    const { result } = renderHook(() => useMediaBlur());

    await act(async () => {
      await new Promise((r) => setTimeout(r, 0));
    });

    act(() => {
      result.current.setBlur(true);
    });

    expect(result.current.blurEnabled).toBe(true);

    act(() => {
      result.current.setBlur(false);
    });

    expect(result.current.blurEnabled).toBe(false);
  });

  it("disables blur when prefers-reduced-motion is active", async () => {
    mockReducedMotion(true);
    // Need to re-import so the module picks up the mock
    vi.resetModules();
    const mod = await import("@/hooks/useMediaBlur");
    const hook = mod.default;

    const { result } = renderHook(() => hook({ overrideDefault: true }));

    await act(async () => {
      await new Promise((r) => setTimeout(r, 0));
    });

    expect(result.current.reducedMotion).toBe(true);
    expect(result.current.blurEnabled).toBe(false);
  });

  it("toggleBlur is a no-op when reduced motion is active", async () => {
    mockReducedMotion(true);
    vi.resetModules();
    const mod = await import("@/hooks/useMediaBlur");
    const hook = mod.default;

    const { result } = renderHook(() => hook());

    await act(async () => {
      await new Promise((r) => setTimeout(r, 0));
    });

    act(() => {
      result.current.toggleBlur();
    });

    expect(result.current.blurEnabled).toBe(false);
  });

  it("setBlur is a no-op when reduced motion is active", async () => {
    mockReducedMotion(true);
    vi.resetModules();
    const mod = await import("@/hooks/useMediaBlur");
    const hook = mod.default;

    const { result } = renderHook(() => hook());

    await act(async () => {
      await new Promise((r) => setTimeout(r, 0));
    });

    act(() => {
      result.current.setBlur(true);
    });

    expect(result.current.blurEnabled).toBe(false);
  });

  it("registers a change listener on matchMedia", async () => {
    const mql = mockReducedMotion(false);

    const { result } = renderHook(() => useMediaBlur());

    await act(async () => {
      await new Promise((r) => setTimeout(r, 0));
    });

    expect(mql.addEventListener).toHaveBeenCalledWith("change", expect.any(Function));

    // Simulate the user toggling prefers-reduced-motion at runtime
    const changeHandler = mql.addEventListener.mock.calls.find(
      ([event]) => event === "change",
    )?.[1];

    expect(changeHandler).toBeDefined();

    act(() => {
      changeHandler({ matches: true });
    });

    expect(result.current.reducedMotion).toBe(true);
    expect(result.current.blurEnabled).toBe(false);
  });
});
