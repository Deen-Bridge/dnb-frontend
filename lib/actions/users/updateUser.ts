import axiosInstance from "@/lib/config/axios.config";

export const updateUser = async (userId?: string, formData?: any): Promise<any | null> => { // TODO(types): User update payload
  if (!userId) {
    console.error("updateUser: userId is undefined");
    return { success: false, message: "User ID is required" };
  }
  try {
    const res = await axiosInstance.put(
      `/api/users/update/${userId}`,
      formData
    );
    return res.data;
  } catch (e: any) { // TODO(types): Axios error from user update endpoint
    console.error("Error updating users:", e.message);
    return null;
  }
};
