import useAuth from "./useAuth";
import axiosInstance from "@/lib/config/axios.config";

export function useHasBook(bookId?: string | number | null): boolean {
  const { user } = useAuth();
  if (!user || !Array.isArray(user.purchasedBooks) || !bookId) return false;
  return user.purchasedBooks.some(
    (b: any) => // TODO(types): Purchased book reference item
      b.bookId?.toString?.() === bookId.toString() ||
      b._id?.toString?.() === bookId.toString()
  );
}

export async function usePurchaseBook(bookId?: string | number): Promise<any> { // TODO(types): Purchase book response
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
  } catch (e: any) { // TODO(types): Axios error from purchase book
    const msg = e?.response?.data?.message || e?.message || "Purchase failed";
    console.error("Purchase error:", msg);
    throw new Error(msg);
  }
}

export function useHasCourse(courseId?: string | number | null): boolean {
  const { user } = useAuth();
  if (!user || !courseId) return false;

  if (Array.isArray(user.purchasedCourses)) {
    const purchased = user.purchasedCourses.some(
      (c: any) => // TODO(types): Purchased course reference item
        c.courseId?.toString?.() === courseId.toString() ||
        c._id?.toString?.() === courseId.toString()
    );
    if (purchased) return true;
  }

  if (Array.isArray(user.enrolledCourses)) {
    return user.enrolledCourses.some(
      (c: any) => c?.toString?.() === courseId.toString() // TODO(types): Enrolled course reference item
    );
  }

  return false;
}

export async function usePurchaseCourse(courseId?: string | number): Promise<any> { // TODO(types): Purchase course response
  if (!courseId) {
    console.error("No courseId provided to usePurchaseCourse");
    return;
  }
  try {
    const res = await axiosInstance.post(`/api/courses/${courseId}/enroll`, {});
    return res.data;
  } catch (e: any) { // TODO(types): Axios error from purchase course
    const msg = e?.response?.data?.message || e?.message || "Purchase failed";
    console.error("Purchase error:", msg);
    throw new Error(msg);
  }
}
