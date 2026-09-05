import "@testing-library/jest-dom";
import { vi } from "vitest";

// next/font is a Next.js build-time feature that doesn't work in jsdom.
// Mock it so components that import fonts (Button, etc.) don't crash.
vi.mock("next/font/google", () => {
  return new Proxy(
    {},
    {
      get: (_target, prop) => () => ({
        className: `mock-${String(prop).toLowerCase()}`,
        style: {},
        variable: `--font-${String(prop).toLowerCase()}`,
      }),
    }
  );
});

vi.mock("next/font/local", () => ({
  default: () => ({ className: "mock-local-font", style: {} }),
}));

if (typeof window !== "undefined") {
  const store = new Map();
  const localStorageMock = {
    getItem: (k) => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => store.set(k, String(v)),
    removeItem: (k) => store.delete(k),
    clear: () => store.clear(),
  };
  Object.defineProperty(window, "localStorage", {
    value: localStorageMock,
    writable: true,
  });
}

// Radix Select expects pointer-capture / scrollIntoView APIs that jsdom lacks.
if (typeof Element !== "undefined") {
  if (!Element.prototype.hasPointerCapture) {
    Element.prototype.hasPointerCapture = () => false;
  }
  if (!Element.prototype.setPointerCapture) {
    Element.prototype.setPointerCapture = () => {};
  }
  if (!Element.prototype.releasePointerCapture) {
    Element.prototype.releasePointerCapture = () => {};
  }
  if (!Element.prototype.scrollIntoView) {
    Element.prototype.scrollIntoView = () => {};
  }
}
