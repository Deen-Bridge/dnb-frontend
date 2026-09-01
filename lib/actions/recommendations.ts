import axiosInstance from "@/lib/config/axios.config";

export const fetchRecommendedCourses = async (interests: string[] = []): Promise<any> => { // TODO(types): Recommended courses response
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

export const fetchAllCourses = async (): Promise<any> => { // TODO(types): Courses response
  try {
    const response = await axiosInstance.get("/api/courses");
    return response.data;
  } catch (error) {
    console.error("Error fetching all courses:", error);
    throw error;
  }
};

export const fetchRecommendedBooks = async (interests: string[] = []): Promise<any> => { // TODO(types): Recommended books response
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

export const fetchAllBooks = async (): Promise<any> => { // TODO(types): Books response
  try {
    const response = await axiosInstance.get("/api/books");
    return response.data;
  } catch (error) {
    console.error("Error fetching all books:", error);
    throw error;
  }
};
