import { siteUrl, publicRoutes } from "@/lib/config/site.config";
import { fetchCourses } from "@/lib/actions/courses/fetch-courses";
import { fetchBooks } from "@/lib/actions/library/fetch-books";
import { fetchEducators } from "@/lib/actions/educators/fetch-educators";

const API_TIMEOUT_MS = 5000;

/**
 * Guards the build (and first render) against a slow or unreachable backend.
 * CI builds against https://api.example.com, so detail routes must fall back
 * to the static list rather than failing the build.
 */
function withTimeout(promise, ms = API_TIMEOUT_MS) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("API request timed out")), ms)
    ),
  ]);
}

function safeDate(value, fallback) {
  if (!value) return fallback;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? fallback : date;
}

function normalizeCourses(response) {
  if (Array.isArray(response)) return response;
  if (response?.courses) return response.courses;
  return [];
}

function normalizeBooks(response) {
  if (Array.isArray(response)) return response;
  if (response?.books) return response.books;
  return [];
}

function normalizeEducators(response) {
  if (Array.isArray(response)) return response;
  if (response?.educators) return response.educators;
  return [];
}

export default async function sitemap() {
  const lastModified = new Date();

  const staticEntries = publicRoutes.map(({ path, priority, changeFrequency }) => ({
    url: `${siteUrl}${path === "/" ? "" : path}`,
    lastModified,
    changeFrequency,
    priority,
  }));

  let courseEntries = [];
  let bookEntries = [];
  let educatorEntries = [];

  try {
    const courses = await withTimeout(fetchCourses());
    courseEntries = normalizeCourses(courses).map((course) => ({
      url: `${siteUrl}/dashboard/courses/${course._id || course.id}`,
      lastModified: safeDate(course.updatedAt, lastModified),
      changeFrequency: "weekly",
      priority: 0.6,
    }));
  } catch (error) {
    console.warn(
      "sitemap: course detail fetch failed, returning static routes only.",
      error?.message ?? error
    );
  }

  try {
    const books = await withTimeout(fetchBooks());
    bookEntries = normalizeBooks(books).map((book) => ({
      url: `${siteUrl}/dashboard/library/${book._id || book.id}`,
      lastModified: safeDate(book.updatedAt, lastModified),
      changeFrequency: "monthly",
      priority: 0.5,
    }));
  } catch (error) {
    console.warn(
      "sitemap: book detail fetch failed, returning static routes only.",
      error?.message ?? error
    );
  }

  try {
    const educators = await withTimeout(fetchEducators());
    educatorEntries = normalizeEducators(educators).map((educator) => ({
      url: `${siteUrl}/educators/${educator._id || educator.id}`,
      lastModified: safeDate(educator.updatedAt, lastModified),
      changeFrequency: "weekly",
      priority: 0.7,
    }));
  } catch (error) {
    console.warn(
      "sitemap: educator profile fetch failed, returning static routes only.",
      error?.message ?? error
    );
  }

  return [...staticEntries, ...courseEntries, ...bookEntries, ...educatorEntries];
}