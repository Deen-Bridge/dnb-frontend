import axiosInstance from "@/lib/config/axios.config";

export const forgetPassword = async (email) => {
  if (!email || typeof email !== "string") {
    console.log("Invalid email input");
    return { success: false, message: "Invalid email" };
  }
  try {
    const res = await axiosInstance.post("/api/email/rest", { email });
    return res.data;
  } catch (e) {
    console.log(
      "Error Sending Reset Link:",
      error?.response?.data || error.message
    );
    return { success: false, message: "Failed to send reset link" };
  }
};
