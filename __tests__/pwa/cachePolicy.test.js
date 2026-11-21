import { describe, expect, it } from "vitest";
import {
  isPrivateNavigationPath,
  isPublicNavigationPath,
  PRIVATE_RUNTIME_CACHE_NAMES,
} from "@/lib/pwa/cache-policy";

describe("service-worker navigation cache policy", () => {
  it.each([
    "/dashboard",
    "/dashboard/settings",
    "/admin/users",
    "/payments/1",
    "/messages",
    "/educator-onboarding",
    "/en/dashboard",
    "/ar/account/settings",
  ])("never caches private route %s", (path) => {
    expect(isPrivateNavigationPath(path)).toBe(true);
    expect(isPublicNavigationPath(path)).toBe(false);
  });

  it.each(["/", "/about", "/courses", "/books/123", "/offline", "/en/about"]) (
    "allows only approved public route %s",
    (path) => expect(isPublicNavigationPath(path)).toBe(true)
  );

  it("keeps legacy private cache names in the deletion list", () => {
    expect(PRIVATE_RUNTIME_CACHE_NAMES).toEqual(
      expect.arrayContaining(["pages", "same-origin-others", "book-previews"])
    );
  });
});
