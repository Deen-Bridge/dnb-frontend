import useAuth from "./useAuth";
import axiosInstance from "@/lib/config/axios.config";

// Returns true if the user has purchased the book
export function useHasBook(bookId) {
  const { user } = useAuth();
  if (!user || !Array.isArray(user.purchasedBooks) || !bookId) return false;
  return user.purchasedBooks.some(
    (b) =>
      b.bookId?.toString?.() === bookId.toString() ||
      b._id?.toString?.() === bookId.toString()
  );
}

// purchase a book
export async function usePurchaseBook(bookId) {
  if (!bookId) {
    console.error("No bookId provided to usePurchaseBook");
    return;
  }
  try {
    const res = await axiosInstance.post(
      "/api/purchase/book",
      { bookId: bookId.toString() }
    );
    return res.data;
  } catch (e) {
    const msg = e?.response?.data?.message || e.message || "Purchase failed";
    console.error("Purchase error:", msg);
    throw new Error(msg);
  }
}

// Returns true if the user has purchased/enrolled in the course
export function useHasCourse(courseId) {
  const { user } = useAuth();
  if (!user || !courseId) return false;

  // Check purchasedCourses array
  if (Array.isArray(user.purchasedCourses)) {
    const purchased = user.purchasedCourses.some(
      (c) =>
        c.courseId?.toString?.() === courseId.toString() ||
        c._id?.toString?.() === courseId.toString()
    );
    if (purchased) return true;
  }

  // Also check enrolledCourses if it exists
  if (Array.isArray(user.enrolledCourses)) {
    return user.enrolledCourses.some(
      (c) => c?.toString?.() === courseId.toString()
    );
  }

  return false;
}

// purchase a course (enroll)
export async function usePurchaseCourse(courseId) {
  if (!courseId) {
    console.error("No courseId provided to usePurchaseCourse");
    return;
  }
  try {
    const res = await axiosInstance.post(`/api/courses/${courseId}/enroll`, {});
    return res.data;
  } catch (e) {
    const msg = e?.response?.data?.message || e.message || "Purchase failed";
    console.error("Purchase error:", msg);
    throw new Error(msg);
  }
}
