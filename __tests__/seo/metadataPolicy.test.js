import { canonicalPath, localeAlternates } from "@/lib/seo/metadataPolicy";

describe("metadata URL policy", () => {
  it("normalizes locale-aware canonical paths and strips query state", () => {
    expect(canonicalPath("en", "/courses?search=private")).toBe("/courses");
    expect(canonicalPath("ar", "/courses#details")).toBe("/ar/courses");
    expect(localeAlternates("/courses")).toEqual({ en: "/courses", ar: "/ar/courses" });
  });
});
