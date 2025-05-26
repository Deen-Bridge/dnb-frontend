import axios from "axios";
import config from "../../config/req.header.config";
// Add a review to a book
export async function addBookReview({ bookId, rating, comment, }) {
  try {
    const res = await axios.post(
      `https://dnb-backend-api.onrender.com/api/books/${bookId}/reviews`,
      { rating, comment }, config
    );
    return res.data;
  } catch (error) {
    if (error.response && error.response.data) {
      return error.response.data;
    }
    return { success: false, message: error.message };
  }
}
