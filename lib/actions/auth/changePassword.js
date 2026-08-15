import axiosInstance from "@/lib/config/axios.config";

// PUT /api/auth/change-password  { currentPassword, newPassword }
export const changePassword = async ({ currentPassword, newPassword }) => {
  try {
    const res = await axiosInstance.put("/api/auth/change-password", {
      currentPassword,
      newPassword,
    });
    return {
      success: true,
      message: res.data?.message || "Password changed successfully.",
    };
  } catch (error) {
    return {
      success: false,
      message:
        error?.response?.data?.message ||
        error?.message ||
        "Failed to change password.",
    };
  }
};
