import { readSafePage, readSafeParam } from "@/lib/navigation/urlState";

const params = (values: Record<string, string>) => ({ get: (key: string) => values[key] ?? null });

describe("bounded URL state", () => {
  it("rejects oversized and unknown enum values", () => {
    expect(readSafeParam(params({ search: "x".repeat(121) }), "search")).toBe("");
    expect(readSafeParam(params({ sort: "javascript:" }), "sort", {
      allowed: ["newest", "oldest"], fallback: "newest",
    })).toBe("newest");
  });

  it("bounds page numbers and ignores malformed values", () => {
    expect(readSafePage(params({ page: "999" }))).toBe(999);
    expect(readSafePage(params({ page: "1000" }))).toBe(1);
    expect(readSafePage(params({ page: "1%2F2" }))).toBe(1);
  });
});
