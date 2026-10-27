import { logger } from "@/lib/logger";
import axiosInstance from "@/lib/config/axios.config";
import type { Book, Course } from "@/types/api";

/**
 * Recommendation and listing endpoints return either a bare array or an
 * envelope keyed by the resource name (`courses`, `books`, `recommended`).
 */
export type RecommendationsResponse<T> =
  | T[]
  | {
      success?: boolean;
      courses?: T[];
      books?: T[];
      recommended?: T[];
    };

export const fetchRecommendedCourses = async (
  interests: string[] = []
): Promise<RecommendationsResponse<Course>> => {
  try {
    const response = await axiosInstance.post("/api/courses/recommended", {
      interests,
    });
    return response.data;
  } catch (error) {
    logger.error("Error fetching recommended courses:", error);
    throw error;
  }
};

export const fetchAllCourses = async (): Promise<RecommendationsResponse<Course>> => {
  try {
    const response = await axiosInstance.get("/api/courses");
    return response.data;
  } catch (error) {
    logger.error("Error fetching all courses:", error);
    throw error;
  }
};

export const fetchRecommendedBooks = async (
  interests: string[] = []
): Promise<RecommendationsResponse<Book>> => {
  try {
    const response = await axiosInstance.post("/api/books/recommended", {
      interests,
    });
    return response.data;
  } catch (error) {
    logger.error("Error fetching recommended books:", error);
    throw error;
  }
};

export const fetchAllBooks = async (): Promise<RecommendationsResponse<Book>> => {
  try {
    const response = await axiosInstance.get("/api/books");
    return response.data;
  } catch (error) {
    logger.error("Error fetching all books:", error);
    throw error;
  }
};
