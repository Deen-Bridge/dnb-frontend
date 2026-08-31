import axiosInstance from "@/lib/config/axios.config";

export async function getBookById(id: string): Promise<any> { // TODO(types): Book record payload
  const res = await axiosInstance.get(`/api/books/${id}`);
  return res.data?.book ?? res.data;
}
