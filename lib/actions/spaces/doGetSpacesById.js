import axiosInstance from "@/lib/config/axios.config";
export async function getSpaceById(id) {
  const res = await axiosInstance.get(`/api/spaces/${id}`);
  return res.data.space; // Only return the space object
}
