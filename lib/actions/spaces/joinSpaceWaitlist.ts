import axiosInstance from "@/lib/config/axios.config";

export const joinSpaceWaitlist = async (spaceId: string): Promise<any> => { // TODO(types): Waitlist response
  const res = await axiosInstance.post(`/api/spaces/${spaceId}/waitlist`, {});
  return res.data;
};
