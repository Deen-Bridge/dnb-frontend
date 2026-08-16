import { describe, it, expect } from "vitest";
import {
  resolvePostVerificationRoute,
  isEducator,
  EDUCATOR_ONBOARDING_ROUTE,
  DASHBOARD_ROUTE,
} from "./educator-routing";

describe("resolvePostVerificationRoute", () => {
  it("sends educators to the branch selector", () => {
    expect(resolvePostVerificationRoute({ role: "educator" })).toBe(
      EDUCATOR_ONBOARDING_ROUTE
    );
  });

  it("is case-insensitive about the role", () => {
    expect(resolvePostVerificationRoute({ role: "Educator" })).toBe(
      EDUCATOR_ONBOARDING_ROUTE
    );
    expect(resolvePostVerificationRoute({ role: "EDUCATOR" })).toBe(
      EDUCATOR_ONBOARDING_ROUTE
    );
  });

  it("sends non-educator roles straight to the dashboard", () => {
    expect(resolvePostVerificationRoute({ role: "student" })).toBe(
      DASHBOARD_ROUTE
    );
    expect(resolvePostVerificationRoute({ role: "mentor" })).toBe(
      DASHBOARD_ROUTE
    );
  });

  it("falls back to the educator-intent flag when role is missing", () => {
    expect(resolvePostVerificationRoute(null, true)).toBe(
      EDUCATOR_ONBOARDING_ROUTE
    );
    expect(resolvePostVerificationRoute({}, true)).toBe(EDUCATOR_ONBOARDING_ROUTE);
  });

  it("defaults to the dashboard for unknown/absent roles", () => {
    expect(resolvePostVerificationRoute(null)).toBe(DASHBOARD_ROUTE);
    expect(resolvePostVerificationRoute({ role: "admin" })).toBe(DASHBOARD_ROUTE);
  });
});

describe("isEducator", () => {
  it("detects the educator role case-insensitively", () => {
    expect(isEducator({ role: "educator" })).toBe(true);
    expect(isEducator({ role: "Educator" })).toBe(true);
  });

  it("rejects other roles and missing users", () => {
    expect(isEducator({ role: "student" })).toBe(false);
    expect(isEducator(null)).toBe(false);
    expect(isEducator(undefined)).toBe(false);
    expect(isEducator({})).toBe(false);
  });
});
