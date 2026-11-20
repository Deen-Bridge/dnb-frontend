import axiosInstance from "@/lib/config/axios.config";

export async function fetchBooks(): Promise<any> { // TODO(types): Books API response
  const res = await axiosInstance.get("/api/books");
  return res.data;
}
