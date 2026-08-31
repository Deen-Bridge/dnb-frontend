import axiosInstance from "@/lib/config/axios.config";

export interface SendOtpResult {
  success: boolean;
  message?: string;
}

export const sendOtp = async (email: string): Promise<SendOtpResult> => {
  if (!email || typeof email !== "string") {
    console.log("Invalid email input");
    return { success: false, message: "Invalid email" };
  }

  try {
    const res = await axiosInstance.post("/api/email", {
      email,
    });
    return res.data;
  } catch (error: any) { // TODO(types): Axios error from email service
    console.log("Error Sending OTP:", error?.response?.data || error.message);
    return { success: false, message: "Failed to send OTP" };
  }
};
