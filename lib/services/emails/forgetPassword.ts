import axios from "axios";
import axiosInstance from "@/lib/config/axios.config";

export interface RequestPasswordResetPayload {
  email: string;
}

export interface PasswordResetResponse {
  success: boolean;
  message: string;
}

export interface ResetPasswordWithOtpPayload extends RequestPasswordResetPayload {
  otp: string;
  newPassword: string;
}

interface PasswordResetErrorResponse {
  message?: string;
}

const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError<PasswordResetErrorResponse>(error)) {
    return error.response?.data?.message ?? error.message;
  }

  if (error instanceof Error) return error.message;
  if (typeof error === "object" && error !== null && "message" in error) {
    const message = error.message;
    if (typeof message === "string") return message;
  }

  return "Unknown error";
};

export const forgetPassword = async (
  email: string
): Promise<PasswordResetResponse> => {
  try {
    const payload: RequestPasswordResetPayload = { email };
    const response = await axiosInstance.post<PasswordResetResponse>(
      "/auth/request-password-reset",
      payload
    );
    return response.data;
  } catch (error) {
    console.error("Error requesting password reset:", getErrorMessage(error));
    throw error;
  }
};

export const resetPasswordWithOTP = async (
  email: string,
  otp: string,
  newPassword: string
): Promise<PasswordResetResponse> => {
  try {
    const payload: ResetPasswordWithOtpPayload = { email, otp, newPassword };
    const response = await axiosInstance.post<PasswordResetResponse>(
      "/auth/reset-password",
      payload
    );
    return response.data;
  } catch (error) {
    console.error("Error resetting password:", getErrorMessage(error));
    throw error;
  }
};
