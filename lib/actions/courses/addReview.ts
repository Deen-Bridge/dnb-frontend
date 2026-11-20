import axiosInstance from "@/lib/config/axios.config";

export interface AddCourseReviewParams {
  courseId: string;
  rating: number;
  comment: string;
}

export async function addCourseReview({ courseId, rating, comment }: AddCourseReviewParams): Promise<any> { // TODO(types): Review API response payload
  try {
    const res = await axiosInstance.post(
      `/api/courses/${courseId}/reviews`,
      { rating, comment }
    );
    return res.data;
  } catch (error: any) { // TODO(types): Axios error on add review
    if (error.response && error.response.data) {
      return error.response.data;
    }
    return { success: false, message: error.message };
  }
}
