import axiosInstance from "@/lib/config/axios.config";

export async function getBookById(id) {
  const res = await axiosInstance.get(`/api/books/${id}`);
  return res.data;
}
