import axiosInstance from "@/lib/config/axios.config";

export async function fetchBooks() {
  const res = await axiosInstance.get("/api/books");
  return res.data;
}
