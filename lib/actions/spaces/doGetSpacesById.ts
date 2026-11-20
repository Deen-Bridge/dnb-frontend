import axiosInstance from "@/lib/config/axios.config";

export async function getSpaceById(id: string): Promise<any> { // TODO(types): Space entity
  const res = await axiosInstance.get(`/api/spaces/${id}`);
  return res.data?.space ?? res.data;
}
