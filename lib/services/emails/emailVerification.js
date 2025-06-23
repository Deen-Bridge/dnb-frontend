import axiosInstance from "@/lib/config/axios.config";

export const sendOtp = async (email) => {
  if (!email || typeof email !== "string") {
    console.log("Invalid email input");
    return { success: false, message: "Invalid email" };
  }

  try {
    const res = await axiosInstance.post("/api/email", {
      email,
    });
    return res.data;
  } catch (error) {
    console.log("Error Sending OTP:", error?.response?.data || error.message);
    return { success: false, message: "Failed to send OTP" };
  }
};
