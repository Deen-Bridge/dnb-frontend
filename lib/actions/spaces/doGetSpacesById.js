import axiosInstance from "@/lib/config/axios.config";
import config from "@/lib/config/req.header.config";
export async function getSpaceById(id) {
  const res = await axiosInstance.get(`/api/spaces/${id}`, config);
  return res.data.space; // Only return the space object
}
