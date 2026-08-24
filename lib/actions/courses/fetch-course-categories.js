// Course-category data access.
//
// This is the single file that talks to the backend about categories. Today the
// backend has no categories endpoint, so we derive live course counts from the
// fetched course list and use lib/categories.js as the canonical
// label/slug/description/icon map.
//
// When GET /api/courses/categories ships (coordinated with the maintainers),
// only this file changes: fetchCourseCategories() can merge the taxonomy with
// the returned counts and fetchCoursesByCategory() can pass ?category= to the
// courses endpoint. Nothing that imports from here needs to move.

import axiosInstance from "@/lib/config/axios.config";
import {
  ISLAMIC_CATEGORIES,
  FALLBACK_SLUG,
  FALLBACK_CATEGORY,
  resolveCategorySlug,
  getCategoryCounts,
  sortCourses,
} from "@/lib/categories";
import { fetchCourses } from "./fetch-courses";

function mergeCounts(categories, counts) {
  return categories.map((category) => ({
    ...category,
    count: counts[category.slug] || 0,
  }));
}

/**
 * Returns every category enriched with a live course count, e.g.
 * [{ slug, label, group, description, icon, count }].
 * Falls back to client-side derivation when the backend endpoint is absent.
 */
export async function fetchCourseCategories() {
  try {
    const response = await axiosInstance.get("/api/courses/categories");
    const data = response?.data;
    const rows = Array.isArray(data) ? data : data?.categories;

    if (Array.isArray(rows)) {
      const countsBySlug = Object.fromEntries(
        rows
          .filter((row) => row && row.slug)
          .map((row) => [row.slug, Number(row.count) || 0])
      );
      const merged = ISLAMIC_CATEGORIES.map((category) => ({
        ...category,
        count: countsBySlug[category.slug] || 0,
        ...(rows.find((row) => row.slug === category.slug) || {}),
      }));
      merged.push({
        ...FALLBACK_CATEGORY,
        count: countsBySlug[FALLBACK_SLUG] || 0,
      });
      return merged;
    }
  } catch (error) {
    console.warn(
      "[categories] /api/courses/categories unavailable, deriving counts client-side.",
      error?.message || error
    );
  }

  const courses = await fetchCourses();
  const counts = getCategoryCounts(Array.isArray(courses) ? courses : []);
  return [...mergeCounts(ISLAMIC_CATEGORIES, counts), {
    ...FALLBACK_CATEGORY,
    count: counts[FALLBACK_SLUG] || 0,
  }];
}

/**
 * Returns courses belonging to a category slug (including the fallback
 * bucket), already sorted newest-first by default. Swapping in a backend
 * ?category= filter later is confined to this function.
 */
export async function fetchCoursesByCategory(slug, sortKey = "newest") {
  try {
    const response = await axiosInstance.get("/api/courses", {
      params: { category: slug },
    });
    const data = response?.data;
    const courses = Array.isArray(data)
      ? data
      : Array.isArray(data?.courses)
        ? data.courses
        : [];
    if (courses.length > 0) {
      return sortCourses(courses, sortKey);
    }
  } catch (error) {
    if (error?.response) {
      // A real 4xx/5xx from a backend that knows the category param: surface it.
      throw error;
    }
    console.warn(
      "[categories] category-scoped fetch failed, falling back to full list.",
      error?.message || error
    );
  }

  const all = await fetchCourses();
  const list = (Array.isArray(all) ? all : []).filter((course) => {
    if (slug === FALLBACK_SLUG) {
      const raw = String(course?.category ?? "").trim();
      if (!raw) return true;
      return resolveCategorySlug(course.category) === FALLBACK_SLUG;
    }
    return resolveCategorySlug(course?.category) === slug;
  });
  return sortCourses(list, sortKey);
}
