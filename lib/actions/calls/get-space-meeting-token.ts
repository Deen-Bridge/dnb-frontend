import axiosInstance from "@/lib/config/axios.config";

export interface GetSpaceMeetingTokenResult {
  success?: boolean;
  token?: string;
  roomName?: string;
  message?: string;
  [key: string]: any; // TODO(types): Token response payload
}

export const getSpaceMeetingToken = async (spaceId: string): Promise<GetSpaceMeetingTokenResult> => {
  try {
    const response = await axiosInstance.post("/api/calls/token", {
      spaceId,
    });

    return response.data;
  } catch (error: any) { // TODO(types): Axios error on space token
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
