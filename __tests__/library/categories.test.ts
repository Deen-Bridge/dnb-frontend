/**
 * lib/categories — unit tests
 * --------------------------
 * The course-category taxonomy is the single source of truth for every route,
 * card and picker that renders a category, so the resolution helpers have to
 * stay predictable:
 *   - resolveSlug / resolveCategorySlug resolve known values (slug, label,
 *     label with a parenthetical suffix) to their taxonomy slug;
 *   - unknown values never throw — they warn and fall back (or return null);
 *   - the counting / filtering / sorting helpers agree with the taxonomy.
 *
 * No network calls: this module is pure.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

import {
  CATEGORY_GROUPS,
  CATEGORY_MAP,
  CATEGORIES,
  FALLBACK_CATEGORY,
  FALLBACK_SLUG,
  ISLAMIC_CATEGORIES,
  filterCoursesByCategory,
  getCategoryBySlug,
  getCategoryCounts,
  getCategoryLabel,
  getGroupedCategories,
  resolveCategorySlug,
  resolveSlug,
  slugify,
  sortCourses,
  type CourseLike,
} from "@/lib/categories";

let warn: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  warn = vi.spyOn(console, "warn").mockImplementation(() => {});
});

afterEach(() => {
  warn.mockRestore();
});

describe("resolveSlug", () => {
  it("resolves an exact slug", () => {
    expect(resolveSlug("fiqh")).toBe("fiqh");
    expect(resolveSlug("salah")).toBe("salah");
    expect(resolveSlug("halal-haram")).toBe("halal-haram");
  });

  it("resolves an exact label regardless of case and padding", () => {
    expect(resolveSlug("Fiqh (Islamic Jurisprudence)")).toBe("fiqh");
    expect(resolveSlug("  Fiqh (Islamic Jurisprudence)  ")).toBe("fiqh");
    expect(resolveSlug("salah (prayer)")).toBe("salah");
    expect(resolveSlug("ZAKAH & CHARITY")).toBe("zakah-charity");
  });

  it("resolves an unambiguous partial label", () => {
    // "Halal" only appears inside "Halal & Haram".
    expect(resolveSlug("Halal")).toBe("halal-haram");
  });

  it("returns null for an unknown value and warns about it", () => {
    expect(resolveSlug("Underwater Basket Weaving")).toBeNull();
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0][0]).toContain("Underwater Basket Weaving");
  });

  it("returns null for an ambiguous partial label and warns about it", () => {
    // "islam" is contained in several labels, so no single slug can be chosen.
    expect(resolveSlug("islam")).toBeNull();
    expect(warn).toHaveBeenCalledTimes(1);
  });

  it("returns null for empty input without warning", () => {
    expect(resolveSlug(undefined)).toBeNull();
    expect(resolveSlug(null)).toBeNull();
    expect(resolveSlug("")).toBeNull();
    expect(resolveSlug("   ")).toBeNull();
    expect(warn).not.toHaveBeenCalled();
  });
});

describe("resolveCategorySlug", () => {
  it("resolves a known slug unchanged", () => {
    expect(resolveCategorySlug("fiqh")).toBe("fiqh");
  });

  it("resolves a label by stripping its parenthetical suffix", () => {
    expect(resolveCategorySlug("Fiqh (Islamic Jurisprudence)")).toBe("fiqh");
    expect(resolveCategorySlug("Salah (Prayer)")).toBe("salah");
  });

  it("falls back to the fallback bucket for an unknown value and warns", () => {
    expect(resolveCategorySlug("Underwater Basket Weaving")).toBe(FALLBACK_SLUG);
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0][0]).toContain("Underwater Basket Weaving");
  });

  it("falls back to the fallback bucket for empty input without warning", () => {
    expect(resolveCategorySlug(undefined)).toBe(FALLBACK_SLUG);
    expect(resolveCategorySlug(null)).toBe(FALLBACK_SLUG);
    expect(resolveCategorySlug("")).toBe(FALLBACK_SLUG);
    expect(warn).not.toHaveBeenCalled();
  });
});

describe("getCategoryBySlug / getCategoryLabel", () => {
  it("returns the taxonomy entry for a known slug", () => {
    const category = getCategoryBySlug("fiqh");
    expect(category?.slug).toBe("fiqh");
    expect(category?.label).toBe("Fiqh (Islamic Jurisprudence)");
  });

  it("returns the fallback entry for the fallback slug", () => {
    expect(getCategoryBySlug(FALLBACK_SLUG)).toEqual(FALLBACK_CATEGORY);
  });

  it("returns null for an unknown slug", () => {
    expect(getCategoryBySlug("not-a-category")).toBeNull();
    expect(getCategoryBySlug(undefined)).toBeNull();
    expect(getCategoryBySlug(null)).toBeNull();
  });

  it("labels unknown slugs as General", () => {
    expect(getCategoryLabel("fiqh")).toBe("Fiqh (Islamic Jurisprudence)");
    expect(getCategoryLabel(FALLBACK_SLUG)).toBe("Other");
    expect(getCategoryLabel("not-a-category")).toBe("General");
    expect(getCategoryLabel(undefined)).toBe("General");
  });
});

describe("getCategoryCounts", () => {
  it("counts courses per resolved slug", () => {
    const counts = getCategoryCounts([
      { category: "fiqh" },
      { category: "Fiqh (Islamic Jurisprudence)" },
      { category: "salah" },
    ]);

    expect(counts.fiqh).toBe(2);
    expect(counts.salah).toBe(1);
  });

  it("buckets unknown and missing categories under the fallback", () => {
    const counts = getCategoryCounts([
      { category: "Underwater Basket Weaving" },
      {},
    ]);

    expect(counts[FALLBACK_SLUG]).toBe(2);
  });

  it("returns zeroed counts for an empty course list", () => {
    const counts = getCategoryCounts([]);

    expect(counts.fiqh).toBe(0);
    expect(counts[FALLBACK_SLUG]).toBe(0);
    expect(Object.keys(counts)).toHaveLength(ISLAMIC_CATEGORIES.length + 1);
  });
});

describe("filterCoursesByCategory", () => {
  const courses: CourseLike[] = [
    { _id: "1", category: "fiqh" },
    { _id: "2", category: "Fiqh (Islamic Jurisprudence)" },
    { _id: "3", category: "salah" },
    { _id: "4" },
  ];

  it("keeps only the courses that resolve to the requested slug", () => {
    const filtered = filterCoursesByCategory(courses, "fiqh");

    expect(filtered.map((course) => course._id)).toEqual(["1", "2"]);
  });

  it("buckets uncategorised courses under the fallback slug", () => {
    const filtered = filterCoursesByCategory(courses, FALLBACK_SLUG);

    expect(filtered.map((course) => course._id)).toEqual(["4"]);
  });

  it("returns nothing for a slug that no course uses", () => {
    expect(filterCoursesByCategory(courses, "not-a-category")).toEqual([]);
  });
});

describe("sortCourses", () => {
  const courses: CourseLike[] = [
    { _id: "old", category: "fiqh", createdAt: "2024-01-01T00:00:00.000Z", price: 30 },
    { _id: "new", category: "fiqh", createdAt: "2025-01-01T00:00:00.000Z", price: 10 },
  ];

  it("sorts by newest first by default", () => {
    expect(sortCourses(courses, "newest").map((c) => c._id)).toEqual(["new", "old"]);
  });

  it("sorts by price ascending and descending", () => {
    expect(sortCourses(courses, "price-asc").map((c) => c._id)).toEqual(["new", "old"]);
    expect(sortCourses(courses, "price-desc").map((c) => c._id)).toEqual(["old", "new"]);
  });

  it("sorts by average rating", () => {
    const rated: CourseLike[] = [
      { _id: "low", category: "fiqh", reviews: [{ rating: 2 }] },
      { _id: "high", category: "fiqh", reviews: [{ rating: 5 }, { rating: 4 }] },
    ];

    expect(sortCourses(rated, "rating").map((c) => c._id)).toEqual(["high", "low"]);
  });

  it("does not mutate the input array", () => {
    const input: CourseLike[] = [...courses];
    sortCourses(input, "price-asc");

    expect(input.map((c) => c._id)).toEqual(["old", "new"]);
  });
});

describe("taxonomy integrity", () => {
  it("exposes every category exactly once", () => {
    const slugs = ISLAMIC_CATEGORIES.map((category) => category.slug);

    expect(new Set(slugs).size).toBe(slugs.length);
    expect(CATEGORIES).toEqual(ISLAMIC_CATEGORIES);
  });

  it("resolves every taxonomy slug back to itself", () => {
    for (const category of ISLAMIC_CATEGORIES) {
      expect(resolveSlug(category.slug)).toBe(category.slug);
      expect(resolveCategorySlug(category.label)).toBe(category.slug);
    }
  });

  it("groups every category under exactly one group", () => {
    const grouped = getGroupedCategories();

    expect(grouped).toHaveLength(CATEGORY_GROUPS.length);
    expect(grouped.flatMap((entry) => entry.categories)).toHaveLength(
      ISLAMIC_CATEGORIES.length
    );
    expect(CATEGORY_MAP.fiqh?.group).toBe("Core Islamic Sciences");
  });
});

describe("slugify", () => {
  it("produces a URL-safe slug", () => {
    expect(slugify("Fiqh (Islamic Jurisprudence)")).toBe("fiqh-islamic-jurisprudence");
    expect(slugify("  Zakah & Charity  ")).toBe("zakah-charity");
    expect(slugify("")).toBe("");
    expect(slugify(undefined)).toBe("");
  });
});
