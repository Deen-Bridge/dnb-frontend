import axios from "axios";
import axiosInstance from "@/lib/config/axios.config";

export interface SendOtpRequest {
  email: string;
}

export interface SendOtpResult {
  success: boolean;
  otp?: string;
  message?: string;
}

interface EmailServiceErrorResponse {
  message?: string;
}

const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError<EmailServiceErrorResponse>(error)) {
    return error.response?.data?.message ?? error.message;
  }

  if (error instanceof Error) return error.message;
  if (typeof error === "object" && error !== null && "message" in error) {
    const message = error.message;
    if (typeof message === "string") return message;
  }

  return "Unknown error";
};

export const sendOtp = async (email: string): Promise<SendOtpResult> => {
  if (!email || typeof email !== "string") {
    console.log("Invalid email input");
    return { success: false, message: "Invalid email" };
  }

  try {
    const request: SendOtpRequest = {
      email,
    };
    const res = await axiosInstance.post<SendOtpResult>("/api/email", request);
    return res.data;
  } catch (error: unknown) {
    const axiosError = axios.isAxiosError<EmailServiceErrorResponse>(error)
      ? error
      : undefined;
    console.log(
      "Error Sending OTP:",
      axiosError?.response?.data ?? getErrorMessage(error)
    );
    return { success: false, message: "Failed to send OTP" };
  }
};
