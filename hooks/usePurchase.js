import useAuth from "./useAuth";
import axiosInstance from "@/lib/config/axios.config";
import config from "@/lib/config/req.header.config";
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
  try {
    await axiosInstance.post(
      "/api/purchase/book",
      { bookId: bookId },
      config
    );
  } catch (e) {
    console.log(e);
  }
}

// Returns true if the user has purchased the course
export function useHasCourse(courseId) {
  const { user } = useAuth();
  if (!user || !user.purchasedCourses) return false;
  return user.purchasedCourses.some(
    (c) => c.courseId.toString() === courseId.toString()
  );
}

export function usePurchaseCourse(courseId) {
  return true;
}
