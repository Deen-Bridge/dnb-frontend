import axiosInstance from "@/lib/config/axios.config";

export interface ReviewActionParams {
  courseId?: string;
  bookId?: string;
  reviewId?: string;
  rating?: number;
  comment?: string;
}

export async function addCourseReview({ courseId, rating, comment }: { courseId: string; rating: number; comment: string }): Promise<any> { // TODO(types): Course review response
  try {
    const res = await axiosInstance.post(
      `/api/courses/${courseId}/reviews`,
      { rating, comment }
    );
    return res.data;
  } catch (error: any) { // TODO(types): Axios error on add course review
    if (error.response && error.response.data) {
      return error.response.data;
    }
    return { success: false, message: error.message };
  }
}

export async function addBookReview({ bookId, rating, comment }: { bookId: string; rating: number; comment: string }): Promise<any> { // TODO(types): Book review response
  try {
    const res = await axiosInstance.post(
      `/api/books/${bookId}/reviews`,
      { rating, comment }
    );
    return res.data;
  } catch (error: any) { // TODO(types): Axios error on add book review
    if (error.response && error.response.data) {
      return error.response.data;
    }
    return { success: false, message: error.message };
  }
}

export async function updateCourseReview({
  courseId,
  reviewId,
  rating,
  comment,
}: {
  courseId: string;
  reviewId: string;
  rating: number;
  comment: string;
}): Promise<any> { // TODO(types): Update course review response
  try {
    const res = await axiosInstance.patch(
      `/api/courses/${courseId}/reviews/${reviewId}`,
      { rating, comment }
    );
    return res.data;
  } catch (error: any) { // TODO(types): Axios error on patch course review
    if (error.response && error.response.data) {
      return error.response.data;
    }
    return { success: false, message: error.message };
  }
}

export async function updateBookReview({
  bookId,
  reviewId,
  rating,
  comment,
}: {
  bookId: string;
  reviewId: string;
  rating: number;
  comment: string;
}): Promise<any> { // TODO(types): Update book review response
  try {
    const res = await axiosInstance.patch(
      `/api/books/${bookId}/reviews/${reviewId}`,
      { rating, comment }
    );
    return res.data;
  } catch (error: any) { // TODO(types): Axios error on patch book review
    if (error.response && error.response.data) {
      return error.response.data;
    }
    return { success: false, message: error.message };
  }
}

export async function deleteCourseReview({
  courseId,
  reviewId,
}: {
  courseId: string;
  reviewId: string;
}): Promise<any> { // TODO(types): Delete course review response
  try {
    const res = await axiosInstance.delete(`/api/courses/${courseId}/reviews/${reviewId}`);
    return res.data;
  } catch (error: any) { // TODO(types): Axios error on delete course review
    if (error.response && error.response.data) {
      return error.response.data;
    }
    return { success: false, message: error.message };
  }
}

export async function deleteBookReview({
  bookId,
  reviewId,
}: {
  bookId: string;
  reviewId: string;
}): Promise<any> { // TODO(types): Delete book review response
  try {
    const res = await axiosInstance.delete(`/api/books/${bookId}/reviews/${reviewId}`);
    return res.data;
  } catch (error: any) { // TODO(types): Axios error on delete book review
    if (error.response && error.response.data) {
      return error.response.data;
    }
    return { success: false, message: error.message };
  }
}
