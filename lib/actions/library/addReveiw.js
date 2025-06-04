import axiosInstance from "@/lib/config/axios.config";
import config from "../../config/req.header.config";
// Add a review to a book
export async function addBookReview({ bookId, rating, comment }) {
  try {
    const res = await axiosInstance.post(
      `/api/books/${bookId}/reviews`,
      { rating, comment },
      config
    );
    return res.data;
  } catch (error) {
    if (error.response && error.response.data) {
      return error.response.data;
    }
    return { success: false, message: error.message };
  }
}
