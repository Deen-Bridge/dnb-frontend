import { describe, expect, it } from "vitest";
import { scrubDiagnosticValue, scrubRoute } from "@/mobile/lib/diagnostics/privacy";
import { compareVersions } from "@/mobile/lib/update/versions";

describe("mobile privacy-safe diagnostics", () => {
  it("redacts credentials, identity, wallet, and nested content", () => {
    const result = scrubDiagnosticValue({ email: "person@example.com", token: "secret-token-value-1234567890", wallet: "GABCDEF", nested: "hello" });
    expect(result).toEqual({ email: "[redacted]", token: "[redacted]", wallet: "[redacted]", nested: "hello" });
  });

  it("keeps route context bounded and parameter-free", () => {
    expect(scrubRoute("/courses/1234567890123456?email=person@example.com")).toBe("/courses/:id");
  });
});

describe("mobile minimum-version policy", () => {
  it("compares semantic app versions", () => {
    expect(compareVersions("0.10.0", "0.9.9")).toBeGreaterThan(0);
    expect(compareVersions("1.0.0", "1.0.0")).toBe(0);
  });
});
