import axiosInstance from "@/lib/config/axios.config";
import { getLocalSearchResults } from "@/lib/search-fallback";

export async function searchQuery(query) {
  const cleanQuery = query ? query.trim() : "";
  if (!cleanQuery) return [];

  try {
    const encoded = encodeURIComponent(cleanQuery);
    const response = await axiosInstance.get(`/api/search?q=${encoded}`);
    if (Array.isArray(response.data) && response.data.length > 0) {
      return response.data;
    }
  } catch (error) {
    // API server offline or error -> fallback to local data search
  }

  return getLocalSearchResults(cleanQuery);
}
