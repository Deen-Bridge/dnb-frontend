import axiosInstance from "@/lib/config/axios.config";

export const forgetPassword = async (email: string): Promise<any> => { // TODO(types): Response payload from forget-password request
  try {
    const response = await axiosInstance.post("/auth/request-password-reset", {
      email,
    });
    return response.data;
  } catch (error) {
    console.error("Error requesting password reset:", error);
    throw error;
  }
};

export const resetPasswordWithOTP = async (
  email: string,
  otp: string,
  newPassword: string
): Promise<any> => { // TODO(types): Response payload from reset-password request
  try {
    const response = await axiosInstance.post("/auth/reset-password", {
      email,
      otp,
      newPassword,
    });
    return response.data;
  } catch (error) {
    console.error("Error resetting password:", error);
    throw error;
  }
};
