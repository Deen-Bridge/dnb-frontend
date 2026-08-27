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
  IBM_Plex_Sans_Arabic: () => ({ className: "mock-ibm-plex-arabic", style: {} }),
}));

vi.mock("next/font/local", () => ({
  default: () => ({ className: "mock-local-font", style: {} }),
}));
