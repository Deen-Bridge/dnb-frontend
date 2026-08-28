import axiosInstance from "@/lib/config/axios.config";

export const createSpace = async (formData: any): Promise<any> => { // TODO(types): Space creation form payload
  try {
    const res = await axiosInstance.post("/api/spaces", formData);
    return res.data;
  } catch (error: any) { // TODO(types): Axios error on create space
    return {
      success: false,
      message: error?.response?.data?.message || error.message,
    };
  }
};
