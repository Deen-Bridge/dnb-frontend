import { describe, it, expect } from "vitest";
import { buildContentSecurityPolicyHeader } from "@/lib/config/cspPolicyBuilder";

describe("buildContentSecurityPolicyHeader (#561)", () => {
  it("omits unsafe-eval and wildcard origins while supporting report-only and enforcing modes", () => {
    const reportOnly = buildContentSecurityPolicyHeader({
      environment: "preview",
      apiOrigin: "https://api.deenbridge.com",
      reportOnly: true,
      reportUri: "/api/csp-report",
    });
    expect(reportOnly.headerName).toBe("Content-Security-Policy-Report-Only");
    expect(reportOnly.headerValue).not.toContain("unsafe-eval");
    expect(reportOnly.headerValue).not.toContain("*");

    const prod = buildContentSecurityPolicyHeader({
      environment: "production",
      apiOrigin: "https://api.deenbridge.com",
      reportOnly: false,
    });
    expect(prod.headerName).toBe("Content-Security-Policy");
    expect(prod.headerValue).toContain("https://horizon.stellar.org");
  });
});
