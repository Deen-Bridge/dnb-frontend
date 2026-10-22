import { describe, it, expect } from "vitest";
import { buildCardSkeletonGrid } from "@/lib/stellar/cardSkeletonLayout";

describe("Course and book card loading skeleton descriptors (#94)", () => {
  it("generates layout-stable course and book skeleton grids", () => {
    const courses = buildCardSkeletonGrid("course", 4);
    expect(courses).toHaveLength(4);
    expect(courses[0].aspectRatioClass).toBe("aspect-video");
    expect(courses[0].ariaBusy).toBe(true);

    const books = buildCardSkeletonGrid("book", 3);
    expect(books).toHaveLength(3);
    expect(books[0].aspectRatioClass).toBe("aspect-[3/4]");
  });
});
