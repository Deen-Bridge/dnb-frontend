import { describe, expect, it } from "vitest";
import {
  adminRedirectUrl,
  getAdminRouteDecision,
} from "@/lib/auth/admin-route";

const session = (user: object) => JSON.stringify(user);

describe("admin route boundary", () => {
  it.each([
    [undefined, undefined],
    ["session-token", undefined],
    ["session-token", "not-json"],
    ["eyJhbGciOiJub25lIn0.eyJleHAiOjF9.signature", JSON.stringify({ role: "admin" })],
  ])("requires login when the session is absent or incomplete", (token, userInfo) => {
    expect(getAdminRouteDecision(token, userInfo)).toBe("login");
  });

  it.each(["student", "educator", "mentor", "unknown", undefined])(
    "denies non-admin role %s",
    (role) => {
      expect(getAdminRouteDecision("session-token", session({ role }))).toBe("forbidden");
    },
  );

  it("allows only an admin session", () => {
    expect(getAdminRouteDecision("session-token", session({ role: "ADMIN" }))).toBe("allow");
  });
});

describe("admin route redirects", () => {
  it("preserves the Arabic locale and uses a safe internal return target", () => {
    expect(adminRedirectUrl("ar", "login")).toBe(
      "/ar/login?returnTo=%2Far%2Fadmin",
    );
    expect(adminRedirectUrl("ar", "forbidden")).toBe("/ar/dashboard/unauthorized");
  });

  it("keeps the default English locale unprefixed", () => {
    expect(adminRedirectUrl("en", "login")).toBe("/login?returnTo=%2Fadmin");
    expect(adminRedirectUrl("en", "forbidden")).toBe("/dashboard/unauthorized");
  });
});
