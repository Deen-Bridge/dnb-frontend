import axiosInstance from "@/lib/config/axios.config";

export interface RecommendationsData {
  courses: any[]; // TODO(types): Recommended courses
  books: any[]; // TODO(types): Recommended books
  userInterests: string[];
  coursesCount: number;
  booksCount: number;
}

export interface GetRecommendationsResult {
  success: boolean;
  message?: string;
  recommendations: RecommendationsData;
}

export const getRecommendations = async (): Promise<GetRecommendationsResult> => {
  try {
    const res = await axiosInstance.get(`/api/users/recommendations`);
    console.log("getRecommendations response:", res.data);
    return res.data;
  } catch (e: any) { // TODO(types): Axios error from getRecommendations
    console.log("Error fetching recommendations:", e?.message);
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
