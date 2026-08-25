import axios from "axios";
import { config } from "@/lib/config/env";

const baseURL = config.apiUrl;

const axiosInstance = axios.create({
  baseURL,
  withCredentials: true,
  timeout: 90000,
});

// Track ongoing refresh to avoid multiple concurrent refresh calls
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Add request interceptor to handle auth token
axiosInstance.interceptors.request.use(
  (config) => {
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

// ---------------------------------------------------------------------------
// Retry policy
// ---------------------------------------------------------------------------
// A 5xx does NOT mean the server failed to process the request — it may have
// succeeded and then died formatting the response. Replaying a mutation is
// therefore unsafe: a retried POST /api/stellar/payment/submit can resubmit an
// already-accepted signed XDR (double charge), and a retried purchase/enroll
// can create duplicate records.
//
// Only methods that are idempotent by definition are replayed automatically.
// A mutation can opt in explicitly with `retryOnServerError: true` on the
// request config, which callers should set only when the endpoint de-duplicates
// server-side (e.g. via an idempotency key).
const IDEMPOTENT_METHODS = new Set(["get", "head", "options"]);

const isRetryableRequest = (request) => {
  if (!request) return false;
  if (request.retryOnServerError === true) return true;
  if (request.retryOnServerError === false) return false;
  return IDEMPOTENT_METHODS.has(String(request.method ?? "get").toLowerCase());
};

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

    // Handle 401 - attempt token refresh (skip for login/register/refresh/stellar-auth endpoints)
    const isAuthRoute = originalRequest.url?.includes("/api/auth/login") ||
      originalRequest.url?.includes("/api/auth/register") ||
      originalRequest.url?.includes("/api/auth/refresh") ||
      originalRequest.url?.includes("/api/auth/stellar/");

    if (error.response?.status === 401 && !originalRequest._retry && !isAuthRoute) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => axiosInstance(originalRequest));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshRes = await axios.post(`${baseURL}/api/auth/refresh`, null, {
          withCredentials: true,
        });

        const { token, user } = refreshRes.data;

        // Update auth cookies with new token
        const Cookies = (await import("js-cookie")).default;
        Cookies.set("authToken", token, { expires: 1, path: "/" });
        if (user) {
          const userInfo = { id: user.id, name: user.name, role: user.role, email: user.email };
          if (user.avatar) userInfo.avatar = user.avatar;
          if (user.gender) userInfo.gender = user.gender;
          if (user.age) userInfo.age = user.age;
          if (user.country) userInfo.country = user.country;
          if (user.language) userInfo.language = user.language;
          if (user.interests) userInfo.interests = user.interests;
          if (user.bio) userInfo.bio = user.bio;
          Cookies.set("userInfo", JSON.stringify(userInfo), { expires: 1, path: "/" });
        }

        processQueue(null, token);

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);

        // Refresh failed - clear auth and redirect to login
        const Cookies = (await import("js-cookie")).default;
        Cookies.remove("authToken", { path: "/" });
        Cookies.remove("userInfo", { path: "/" });

        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Auto-retry once on 5xx errors after 1 second — idempotent requests only.
    // Mutations surface immediately so the caller (e.g. the payment modal's
    // error step) can tell the user what happened instead of silently
    // resubmitting.
    if (
      !originalRequest._retry &&
      error.response?.status >= 500 &&
      isRetryableRequest(originalRequest)
    ) {
      originalRequest._retry = true;
      try {
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
