import axiosInstance from "@/lib/config/axios.config";
import { getLocalSearchResults } from "@/lib/search-fallback";

export async function searchQuery(query?: string): Promise<any[]> { // TODO(types): Search query result items
  const cleanQuery = query ? query.trim() : "";
  if (!cleanQuery) return [];

  try {
    const encoded = encodeURIComponent(cleanQuery);
    const response = await axiosInstance.get(`/api/search?q=${encoded}`);
    if (Array.isArray(response.data)) {
      return response.data;
    }
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      return getLocalSearchResults(cleanQuery);
    }
    throw error;
  }

  return [];
}
