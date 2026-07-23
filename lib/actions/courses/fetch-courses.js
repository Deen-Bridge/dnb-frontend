// Fetch all courses from the backend API
import axiosInstance from "@/lib/config/axios.config";

/**
 * Fetches the public catalog of courses from the backend.
 *
 * This is the canonical "all courses" data source for landing-page server
 * components (`FeaturedCourses.jsx`, `Testimonials.jsx`). Callers MUST
 * defensively validate each course object before reading optional fields
 * — the backend response shape has historically varied (see "Return
 * shape" below) and additional fields may be added without notice.
 *
 * Return shape
 * ────────────
 * Always returns an `Array<Course>`. The underlying `GET /api/courses`
 * response is normalised:
 *   1. `{ courses: Course[] }` – the canonical wrapped envelope
 *   2. `Course[]`              – the unwrapped array
 *   3. anything else           – returned as `[]`
 *
 * On any error this also returns `[]`, so server-component consumers can
 * safely fall back to "render nothing" rather than crashing.
 *
 * Course record fields consumed by landing-page components
 * ──────────────────────────────────────────────────────────
 * Required (callers assume these are present):
 *   - `_id`   : `string`  – used as the React key and in deep links
 *   - `id`    : `string`  – alternate id (used by some legacy endpoints)
 *   - `title` : `string`  – displayed in cards and testimonials
 *
 * Optional (consumers MUST guard before reading):
 *   - `reviews`       : `Array<{
 *                          _id?: `string`,
 *                          user?: { name?: `string`, avatar?: `string` },
 *                          comment?: `string`,
 *                          rating?: `number`,
 *                        }>`
 *   - `enrolledUsers` : `Array<*>` – its `.length` is used to rank popularity
 *
 * @returns {Promise<Array<Course>>}
 * @see app/(pages)/(landingPage)/FeaturedCourses.jsx
 * @see app/(pages)/(landingPage)/Testimonials.jsx
 */
export async function fetchCourses() {
  try {
    const response = await axiosInstance.get("/api/courses");
    console.log("API Response:", response);
    console.log("API Response Data:", response.data);
    if (response.data && response.data.courses) {
      return response.data.courses;
    }
    return response.data;
  } catch (error) {
    console.log("Error fetching courses:", error);
    return [];
  }
}
