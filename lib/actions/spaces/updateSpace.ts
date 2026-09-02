import axiosInstance from "@/lib/config/axios.config";

export const updateSpace = async (spaceId: string, updates: any, token?: string): Promise<any> => { // TODO(types): Space update parameters
  try {
    void token;
    const res = await axiosInstance.put(
      `/api/spaces/update/${spaceId}`,
      updates
    );
    return res.data;
  } catch (error: any) { // TODO(types): Axios error on update space
    throw error.response?.data || error;
  }
};
