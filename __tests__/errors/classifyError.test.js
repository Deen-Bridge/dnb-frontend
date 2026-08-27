/**
 * classifyError — error-type classification (#196).
 * --------------------------------------------------
 * The shared error boundary UI picks a user-friendly message per error type:
 * network, server, not found, or generic. These tests pin the classifier.
 */
import { describe, it, expect, vi } from "vitest";

vi.mock("@/lib/config/font.config", () => ({
  poppins_400: { className: "" },
  poppins_600: { className: "" },
}));

import { classifyError } from "@/components/molecules/errors/ErrorBoundaryUI";

describe("classifyError", () => {
  it("classifies network errors", () => {
    expect(classifyError(new Error("Failed to fetch"))).toBe("network");
    expect(classifyError(new Error("NetworkError when attempting to fetch resource"))).toBe("network");
    expect(classifyError(new Error("load failed"))).toBe("network");
    expect(classifyError(new Error("socket hang up"))).toBe("network");
  });

  it("classifies server errors by status", () => {
    expect(classifyError({ response: { status: 500 }, message: "Internal Server Error" })).toBe("server");
    expect(classifyError({ status: 502 })).toBe("server");
    expect(classifyError({ statusCode: 503 })).toBe("server");
  });

  it("classifies not-found errors", () => {
    expect(classifyError({ status: 404 })).toBe("notFound");
    expect(classifyError(new Error("Not found"))).toBe("notFound");
  });

  it("classifies anything else as generic", () => {
    expect(classifyError(new Error("boom"))).toBe("generic");
    expect(classifyError(null)).toBe("generic");
    expect(classifyError(undefined)).toBe("generic");
    expect(classifyError({})).toBe("generic");
  });
});
