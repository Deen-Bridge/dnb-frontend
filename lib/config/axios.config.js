import axios from "axios";
import { config } from "@/lib/config/env";

const baseURL = config.apiUrl;

const axiosInstance = axios.create({
  baseURL,
  withCredentials: true,
  timeout: 90000,
});

// Add request interceptor to handle auth token
axiosInstance.interceptors.request.use(
  (config) => {
    // Only try to access document in browser environment
    if (typeof window !== "undefined") {
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("authToken="))
        ?.split("=")[1];

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle errors
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle network errors
    if (error.code === "ERR_NETWORK") {
      console.error("Network error:", error);

      return Promise.reject({
        message:
          "Unable to connect to the server. Please check your internet connection.",
        originalError: error,
      });
    }

    // Handle timeouts
    if (error.code === "ECONNABORTED") {
      console.log("Request timeout:", error);
      return Promise.reject({
        message: "Request timed out. Please try again.",
        originalError: error,
      });
    }


    if (!originalRequest._retry && error.response?.status >= 500) {
      originalRequest._retry = true;
      try {
        // Wait for 1 second before retrying
        await new Promise((resolve) => setTimeout(resolve, 1000));
        return axiosInstance(originalRequest);
      } catch (retryError) {
        return Promise.reject(retryError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
