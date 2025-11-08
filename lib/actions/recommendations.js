import axiosInstance from "@/lib/config/axios.config";

/**
 * Fetch recommended courses based on user interests
 * @param {Array<string>} interests - User's interests/categories
 * @returns {Promise<Object>} - Recommended courses
 */
export const fetchRecommendedCourses = async (interests = []) => {
  try {
    const response = await axiosInstance.post("/api/courses/recommended", {
      interests,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching recommended courses:", error);
    throw error;
  }
};

/**
 * Fetch all courses
 * @returns {Promise<Object>} - All courses
 */
export const fetchAllCourses = async () => {
  try {
    const response = await axiosInstance.get("/api/courses");
    return response.data;
  } catch (error) {
    console.error("Error fetching all courses:", error);
    throw error;
  }
};

/**
 * Fetch recommended books based on user interests
 * @param {Array<string>} interests - User's interests/categories
 * @returns {Promise<Object>} - Recommended books
 */
export const fetchRecommendedBooks = async (interests = []) => {
  try {
    const response = await axiosInstance.post("/api/books/recommended", {
      interests,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching recommended books:", error);
    throw error;
  }
};

/**
 * Fetch all books
 * @returns {Promise<Object>} - All books
 */
export const fetchAllBooks = async () => {
  try {
    const response = await axiosInstance.get("/api/books");
    return response.data;
  } catch (error) {
    console.error("Error fetching all books:", error);
    throw error;
  }
};
