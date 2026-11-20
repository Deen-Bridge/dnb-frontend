import axiosInstance from "@/lib/config/axios.config";

export async function searchQuery(query?: string): Promise<any[]> { // TODO(types): Search query result items
  const cleanQuery = query ? query.trim() : "";
  if (!cleanQuery) return [];

  try {
    const encoded = encodeURIComponent(cleanQuery);
    const response = await axiosInstance.get(`/api/search?q=${encoded}`);
    const payload = response.data?.results ?? response.data?.data ?? response.data;
    if (!Array.isArray(payload)) throw new Error("The search response has an invalid shape.");
    return payload;
  } catch (error) {
    throw error;
  }
}
