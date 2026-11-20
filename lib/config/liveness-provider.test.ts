import { describe, expect, it } from "vitest";
import { resolveLivenessProvider } from "./env";

describe("resolveLivenessProvider", () => {
  it("allows mock only in development and test", () => {
    expect(resolveLivenessProvider(undefined, "development")).toBe("mock");
    expect(resolveLivenessProvider("mock", "test")).toBe("mock");
  });

  it("rejects missing and mock providers in production", () => {
    expect(() => resolveLivenessProvider(undefined, "production")).toThrow("production requires");
    expect(() => resolveLivenessProvider("mock", "production")).toThrow("production requires");
  });

  it("rejects unsupported providers", () => {
    expect(() => resolveLivenessProvider("unknown", "development")).toThrow("Unsupported");
  });
});
