import { describe, expect, it } from "vitest";
import { assertPublicSitemapEntries } from "@/lib/seo/sitemap-guards";

describe("sitemap route policy", () => {
  it("allows public locale-aware entries", () => {
    const entries = [{ url: "https://deenbridge.com/en/educators/abc" }];
    expect(assertPublicSitemapEntries(entries)).toEqual(entries);
  });

  it.each(["/dashboard/courses/abc", "/admin/users/abc", "/account/settings", "/api/courses"]) (
    "rejects protected prefix %s",
    (path) => {
      expect(() => assertPublicSitemapEntries([{ url: `https://deenbridge.com/en${path}` }])).toThrow("Protected route");
    }
  );
});
