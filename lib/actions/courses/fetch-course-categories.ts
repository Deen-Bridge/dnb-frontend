import axiosInstance from "@/lib/config/axios.config";
import {
  ISLAMIC_CATEGORIES,
  FALLBACK_SLUG,
  FALLBACK_CATEGORY,
  resolveCategorySlug,
  getCategoryCounts,
  sortCourses,
  CategoryItem,
} from "@/lib/categories";
import { fetchCourses } from "./fetch-courses";

export interface EnrichedCategoryItem extends CategoryItem {
  count: number;
}

function mergeCounts(categories: CategoryItem[], counts: Record<string, number>): EnrichedCategoryItem[] {
  return categories.map((category) => ({
    ...category,
    count: counts[category.slug] || 0,
  }));
}

export async function fetchCourseCategories(): Promise<EnrichedCategoryItem[]> {
  try {
    const response = await axiosInstance.get("/api/courses/categories");
    const data = response?.data;
    const rows = Array.isArray(data) ? data : data?.categories;

    if (Array.isArray(rows)) {
      const countsBySlug = Object.fromEntries(
        rows
          .filter((row: any) => row && row.slug) // TODO(types): Category row entry
          .map((row: any) => [row.slug, Number(row.count) || 0]) // TODO(types): Category row entry
      );
      const merged: EnrichedCategoryItem[] = ISLAMIC_CATEGORIES.map((category) => ({
        ...category,
        count: countsBySlug[category.slug] || 0,
        ...(rows.find((row: any) => row.slug === category.slug) || {}), // TODO(types): Category row entry
      }));
      merged.push({
        ...FALLBACK_CATEGORY,
        count: countsBySlug[FALLBACK_SLUG] || 0,
      });
      return merged;
    }
  } catch (error: any) { // TODO(types): Axios error on categories endpoint
    console.warn(
      "[categories] /api/courses/categories unavailable, deriving counts client-side.",
      error?.message || error
    );
  }

  const courses = await fetchCourses();
  const counts = getCategoryCounts(Array.isArray(courses) ? courses : []);
  return [
    ...mergeCounts(ISLAMIC_CATEGORIES, counts),
    {
      ...FALLBACK_CATEGORY,
      count: counts[FALLBACK_SLUG] || 0,
    },
  ];
}

export async function fetchCoursesByCategory(slug: string, sortKey: string = "newest"): Promise<any[]> { // TODO(types): Course domain model array
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
  } catch (error: any) { // TODO(types): Axios error on category course fetch
    if (error?.response) {
      throw error;
    }
    console.warn(
      "[categories] category-scoped fetch failed, falling back to full list.",
      error?.message || error
    );
  }

  const all = await fetchCourses();
  const list = (Array.isArray(all) ? all : []).filter((course: any) => { // TODO(types): Partial course entity
    if (slug === FALLBACK_SLUG) {
      const raw = String(course?.category ?? "").trim();
      if (!raw) return true;
      return resolveCategorySlug(course.category) === FALLBACK_SLUG;
    }
    return resolveCategorySlug(course?.category) === slug;
  });
  return sortCourses(list, sortKey);
}
