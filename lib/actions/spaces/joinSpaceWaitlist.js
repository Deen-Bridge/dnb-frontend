import axiosInstance from "@/lib/config/axios.config";
import config from "@/lib/config/req.header.config";
export const joinSpaceWaitlist = async (spaceId) => {
  const res = await axiosInstance.post(
    `/api/spaces/${spaceId}/waitlist`,
    {},
    config
  );
  return res.data;
};
