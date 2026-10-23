import { describe, expect, it } from "vitest";
import {
  resolveSafeCallbackRedirect,
  resolveSafeRedirectTarget,
} from "@/lib/auth/safeRedirect";

describe("resolveSafeRedirectTarget (#568)", () => {
  it("permits safe relative internal paths with query and hash fragments", () => {
    expect(resolveSafeRedirectTarget("/dashboard")).toBe("/dashboard");
    expect(resolveSafeRedirectTarget("/courses/fiqh-101?tab=overview#lesson-2")).toBe(
      "/courses/fiqh-101?tab=overview#lesson-2"
    );
    expect(resolveSafeRedirectTarget("/a/b/../courses")).toBe("/a/courses");
  });

  it("rejects external origins, dangerous schemes, protocol-relative targets, and normalized // paths", () => {
    expect(resolveSafeRedirectTarget("https://evil.example/login")).toBe("/dashboard");
    expect(resolveSafeRedirectTarget("http://evil.example")).toBe("/dashboard");
    expect(resolveSafeRedirectTarget("javascript:alert(1)")).toBe("/dashboard");
    expect(resolveSafeRedirectTarget("data:text/html,<script>alert(1)</script>")).toBe("/dashboard");
    expect(resolveSafeRedirectTarget("//evil.example/phish")).toBe("/dashboard");
    expect(resolveSafeRedirectTarget("/a/..//evil.example")).toBe("/dashboard");
    expect(resolveSafeRedirectTarget("/a/b/../..//evil.example/path")).toBe("/dashboard");
  });

  it("rejects encoded separator tricks, backslashes, malformed encodings, and control characters", () => {
    expect(resolveSafeRedirectTarget("/%2f/evil.example")).toBe("/dashboard");
    expect(resolveSafeRedirectTarget("/%2F%2Fevil.example")).toBe("/dashboard");
    expect(resolveSafeRedirectTarget("/\\evil.example")).toBe("/dashboard");
    expect(resolveSafeRedirectTarget("/%5cevil.example")).toBe("/dashboard");
    expect(resolveSafeRedirectTarget("/%E0%A4%A")).toBe("/dashboard");
    expect(resolveSafeRedirectTarget("/dashboard\r\nSet-Cookie: bad=1")).toBe("/dashboard");
    expect(resolveSafeRedirectTarget(null, "/admin")).toBe("/admin");
  });

  it("validates returnTo and callbackUrl parameters in resolveSafeCallbackRedirect", () => {
    expect(resolveSafeCallbackRedirect("?returnTo=%2Fcourses%2F42", "/dashboard")).toBe("/courses/42");
    expect(resolveSafeCallbackRedirect("?returnTo=https%3A%2F%2Fevil.example", "/dashboard")).toBe(
      "/dashboard"
    );
    expect(resolveSafeCallbackRedirect("?callbackUrl=%2Fa%2F..%2F%2Fevil.example", "/admin")).toBe(
      "/admin"
    );
    expect(resolveSafeCallbackRedirect(undefined, "/admin")).toBe("/admin");
  });
});
