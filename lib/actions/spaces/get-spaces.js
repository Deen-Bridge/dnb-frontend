import axiosInstance from "@/lib/config/axios.config";

export async function getSpaces() {
  try {
    const res = await axiosInstance.get("/api/spaces");
    return res.data.spaces; // returns array of spaces
  } catch (error) {
    return [];
  }
}
