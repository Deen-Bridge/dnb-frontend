import axiosInstance from "@/lib/config/axios.config";

export const getSpaceMeetingToken = async (spaceId) => {
  try {
    const response = await axiosInstance.post("/api/calls/token", {
      spaceId,
    });

    return response.data;
  } catch (error) {
    const message =
      error?.response?.data?.message ||
      error?.message ||
      "Unable to create meeting token. Please try again.";

    return {
      success: false,
      message,
    };
  }
};

