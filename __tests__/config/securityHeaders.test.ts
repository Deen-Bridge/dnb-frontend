import { describe, expect, it } from "vitest";
import { buildContentSecurityPolicy, buildSecurityHeaders } from "@/lib/config/securityHeaders.mjs";

describe("production security headers (#702)", () => {
  it("allowlists required integrations without unsafe script execution", () => {
    const csp = buildContentSecurityPolicy({
      environment: "production",
      apiOrigin: "https://api.deenbridge.com",
      aiOrigin: "https://ai.deenbridge.com",
      jitsiOrigin: "https://meet.jit.si",
    });

    expect(csp).toContain("https://accounts.google.com");
    expect(csp).toContain("https://api.cloudinary.com");
    expect(csp).toContain("https://meet.jit.si");
    expect(csp).toContain("report-uri /api/csp-report");
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).not.toContain("'unsafe-eval'");
    expect(csp).not.toContain("connect-src *");
  });

  it("returns the required browser hardening headers", () => {
    const headers = Object.fromEntries(buildSecurityHeaders({ environment: "production" }).map(({ key, value }) => [key, value]));

    expect(headers["X-Content-Type-Options"]).toBe("nosniff");
    expect(headers["X-Frame-Options"]).toBe("DENY");
    expect(headers["Referrer-Policy"]).toBe("strict-origin-when-cross-origin");
    expect(headers["Permissions-Policy"]).toContain("camera=(self)");
    expect(headers["Strict-Transport-Security"]).toContain("max-age=31536000");
  });
});
