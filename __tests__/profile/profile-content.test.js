import { describe, expect, it } from "vitest";
import {
  normalizeProfileCollection,
  profileEmptyMessage,
} from "@/lib/profile/profile-content";

describe("profile content state helpers", () => {
  it("accepts direct arrays and common API collection envelopes", () => {
    expect(normalizeProfileCollection([{ id: "course-1" }])).toEqual([{ id: "course-1" }]);
    expect(normalizeProfileCollection({ books: [{ id: "book-1" }] }, ["books"])).toEqual([
      { id: "book-1" },
    ]);
    expect(normalizeProfileCollection({ items: [{ id: "item-1" }] }, ["books", "items"])).toEqual([
      { id: "item-1" },
    ]);
  });

  it("returns an empty collection for empty or malformed responses", () => {
    expect(normalizeProfileCollection(null, ["items"])).toEqual([]);
    expect(normalizeProfileCollection({ books: null }, ["books"])).toEqual([]);
  });

  it("keeps empty-state copy consistent across profile tabs", () => {
    expect(profileEmptyMessage("followers")).toBe("No followers yet. Stay tuned!");
  });
});
