import axiosInstance from "@/lib/config/axios.config";
import config from "@/lib/config/req.header.config";

export const getRecommendations = async () => {
  try {
    const res = await axiosInstance.get(`/api/users/recommendations`, config);
    console.log("getRecommendations response:", res.data);
    return res.data;
  } catch (e) {
    console.log("Error fetching recommendations:", e.message);
    return {
      success: false,
      message: e.response?.data?.message || "Failed to fetch recommendations",
      recommendations: {
        courses: [],
        books: [],
        userInterests: [],
        coursesCount: 0,
        booksCount: 0,
      },
    };
  }
};
