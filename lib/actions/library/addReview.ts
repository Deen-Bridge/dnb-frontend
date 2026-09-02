import axiosInstance from "@/lib/config/axios.config";

export interface AddBookReviewParams {
  bookId: string;
  rating: number;
  comment: string;
}

export async function addBookReview({ bookId, rating, comment }: AddBookReviewParams): Promise<any> { // TODO(types): Book review response payload
  try {
    const res = await axiosInstance.post(
      `/api/books/${bookId}/reviews`,
      { rating, comment }
    );
    return res.data;
  } catch (error: any) { // TODO(types): Axios error on book review
    if (error.response && error.response.data) {
      return error.response.data;
    }
    return { success: false, message: error.message };
  }
}
