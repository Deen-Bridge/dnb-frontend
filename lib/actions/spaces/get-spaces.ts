import axiosInstance from "@/lib/config/axios.config";

export async function getSpaces(): Promise<any[]> { // TODO(types): Spaces list
  try {
    const res = await axiosInstance.get("/api/spaces");
    return res.data?.spaces || (Array.isArray(res.data) ? res.data : []);
  } catch {
    return [];
  }
}
