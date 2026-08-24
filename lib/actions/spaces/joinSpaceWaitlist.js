import axiosInstance from "@/lib/config/axios.config";
export const joinSpaceWaitlist = async (spaceId) => {
  const res = await axiosInstance.post(`/api/spaces/${spaceId}/waitlist`, {});
  return res.data;
};
