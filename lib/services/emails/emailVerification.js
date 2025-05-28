import axios from "axios";

export const sendOtp = async (email) => {
  if (!email || typeof email !== "string") {
    console.error("Invalid email input");
    return { success: false, message: "Invalid email" };
  }

  try {
    const res = await axios.post("https://dnb-backend-api.onrender.com/api/email", {
      email,
    });
    return res.data;
  } catch (error) {
    console.error("Error Sending OTP:", error?.response?.data || error.message);
    return { success: false, message: "Failed to send OTP" };
  }
};

