import useAuth from "./useAuth";

// Returns true if the user has purchased the book
export function useHasBook(bookId) {
  const { user } = useAuth();
  if (!user || !user.purchasedBooks) return false;
  return user.purchasedBooks.some(
    (b) => b.bookId.toString() === bookId.toString()
  );
}

// purchase a book
export function usePurchaseBook(bookId) {
  return true;
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
