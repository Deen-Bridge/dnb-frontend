import axiosInstance from "@/lib/config/axios.config";
import { getLocalSearchResults } from "@/lib/search-fallback";

export async function searchQuery(query) {
  const cleanQuery = query ? query.trim() : "";
  if (!cleanQuery) return [];

  try {
    const encoded = encodeURIComponent(cleanQuery);
    const response = await axiosInstance.get(`/api/search?q=${encoded}`);
    if (Array.isArray(response.data)) {
      return response.data;
    }
  } catch (error) {
    // Only fall back to local mock data on actual network/request failure in development mode
    if (process.env.NODE_ENV === "development") {
      return getLocalSearchResults(cleanQuery);
    }
    throw error;
  }

  return [];
}
