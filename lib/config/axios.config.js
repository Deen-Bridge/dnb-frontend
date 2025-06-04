import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL) {
  console.warn(
    "API_URL is not defined in environment variables. Using default URL."
  );
}

const axiosInstance = axios.create({
  baseURL: API_URL || "http://localhost:5000", // fallback to localhost if env var is not set
  withCredentials: true,
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
  (error) => {
    if (error.response?.status === 401) {
      // Only redirect in browser environment
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
