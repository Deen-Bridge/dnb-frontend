import axiosInstance from "@/lib/config/axios.config";

export interface ChangePasswordParams {
  currentPassword?: string;
  newPassword?: string;
}

export interface ChangePasswordResult {
  success: boolean;
  message: string;
}

export const changePassword = async ({ currentPassword, newPassword }: ChangePasswordParams): Promise<ChangePasswordResult> => {
  try {
    const res = await axiosInstance.put("/api/auth/change-password", {
      currentPassword,
      newPassword,
    });
    return {
      success: true,
      message: res.data?.message || "Password changed successfully.",
    };
  } catch (error: any) { // TODO(types): Axios error from change password
    return {
      success: false,
      message:
        error?.response?.data?.message ||
        error?.message ||
        "Failed to change password.",
    };
  }
};
