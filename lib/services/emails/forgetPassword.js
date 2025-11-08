import axiosInstance from "@/lib/config/axios.config";

/**
 * Request password reset OTP
 * @param {string} email - User's email address
 * @returns {Promise<Object>} - Response with OTP (for development)
 */
export const forgetPassword = async (email) => {
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

/**
 * Reset password with OTP
 * @param {string} email - User's email address
 * @param {string} otp - One-time password
 * @param {string} newPassword - New password
 * @returns {Promise<Object>} - Response
 */
export const resetPasswordWithOTP = async (email, otp, newPassword) => {
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
