import axiosInstance from "@/lib/config/axios.config";
import config from "../../config/req.header.config";

// ── Create ──

export async function addCourseReview({ courseId, rating, comment }) {
  try {
    const res = await axiosInstance.post(
      `/api/courses/${courseId}/reviews`,
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

// ── Update stubs (enable when API endpoints are ready) ──

export async function updateCourseReview({ courseId, reviewId, rating, comment }) {
  try {
    const res = await axiosInstance.patch(
      `/api/courses/${courseId}/reviews/${reviewId}`,
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

export async function updateBookReview({ bookId, reviewId, rating, comment }) {
  try {
    const res = await axiosInstance.patch(
      `/api/books/${bookId}/reviews/${reviewId}`,
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

// ── Delete stubs (enable when API endpoints are ready) ──

export async function deleteCourseReview({ courseId, reviewId }) {
  try {
    const res = await axiosInstance.delete(
      `/api/courses/${courseId}/reviews/${reviewId}`,
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

export async function deleteBookReview({ bookId, reviewId }) {
  try {
    const res = await axiosInstance.delete(
      `/api/books/${bookId}/reviews/${reviewId}`,
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
