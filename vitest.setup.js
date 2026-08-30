import "@testing-library/jest-dom";
import { vi } from "vitest";

// next/font is a Next.js build-time feature that doesn't work in jsdom.
// Mock it so components that import fonts (Button, etc.) don't crash.
vi.mock("next/font/google", () => ({
  Poppins: () => ({ className: "mock-poppins", style: {} }),
  Inter: () => ({ className: "mock-inter", style: {} }),
  Roboto: () => ({ className: "mock-roboto", style: {} }),
  Lato: () => ({ className: "mock-lato", style: {} }),
  Nunito: () => ({ className: "mock-nunito", style: {} }),
  IBM_Plex_Sans_Arabic: () => ({ className: "mock-ibm-plex-sans-arabic", style: {} }),
}));

vi.mock("next/font/local", () => ({
  default: () => ({ className: "mock-local-font", style: {} }),
}));

import React from "react";

vi.mock("next/link", () => ({
  default: ({ children, href, ...rest }) =>
    React.createElement("a", { href, ...rest }, children),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
  }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
  useParams: () => ({ locale: "en" }),
}));

if (typeof window !== "undefined") {
  if (!window.matchMedia) {
    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
  }
  if (!window.open) {
    window.open = vi.fn();
  }
}

if (typeof Element !== "undefined") {
  if (!Element.prototype.scrollIntoView) {
    Element.prototype.scrollIntoView = vi.fn();
  }
  if (!Element.prototype.hasPointerCapture) {
    Element.prototype.hasPointerCapture = vi.fn();
  }
  if (!Element.prototype.setPointerCapture) {
    Element.prototype.setPointerCapture = vi.fn();
  }
  if (!Element.prototype.releasePointerCapture) {
    Element.prototype.releasePointerCapture = vi.fn();
  }
}
