import axios, { InternalAxiosRequestConfig, AxiosResponse, AxiosError } from "axios";
import { config } from "@/lib/config/env";
import {
  getOperationPolicy,
  getRetryDelayMs,
  waitForRetry,
  type RequestOperation,
} from "@/lib/config/request-policy";

declare module "axios" {
  export interface AxiosRequestConfig {
    retryOnServerError?: boolean;
    operation?: RequestOperation;
    _retry?: boolean;
    _authRetry?: boolean;
    _retryAttempt?: number;
  }
  export interface InternalAxiosRequestConfig {
    retryOnServerError?: boolean;
    operation?: RequestOperation;
    _retry?: boolean;
    _authRetry?: boolean;
    _retryAttempt?: number;
  }
}

const baseURL = config.apiUrl;

const axiosInstance = axios.create({
  baseURL,
  withCredentials: true,
  timeout: 15000,
});

// Track ongoing refresh to avoid multiple concurrent refresh calls
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: string | null) => void;
  reject: (reason?: any) => void; // TODO(types): Error reason type for failed promise queue
}> = [];

const processQueue = (error: any | null, token: string | null = null): void => { // TODO(types): Error object from refresh failure
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
  (config: InternalAxiosRequestConfig) => {
    const policy = getOperationPolicy(config.url, config.operation);
    if (config.timeout === 15000 || config.timeout == null) {
      config.timeout = policy.timeoutMs;
    }
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
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// ---------------------------------------------------------------------------
// Retry policy
// ---------------------------------------------------------------------------
const IDEMPOTENT_METHODS = new Set(["get", "head", "options"]);

const hasIdempotencyContract = (request: InternalAxiosRequestConfig) => {
  if (IDEMPOTENT_METHODS.has(String(request.method ?? "get").toLowerCase())) {
    return true;
  }
  if (request.headers?.["Idempotency-Key"]) return true;
  if (typeof request.data === "string") {
    try {
      return Boolean(JSON.parse(request.data).idempotencyKey);
    } catch {
      return false;
    }
  }
  return Boolean(request.data?.idempotencyKey);
};

const isRetryableRequest = (request?: InternalAxiosRequestConfig): boolean => {
  if (!request) return false;
  if (request.retryOnServerError === true) {
    return hasIdempotencyContract(request);
  }
  if (request.retryOnServerError === false) return false;
  const policy = getOperationPolicy(request.url, request.operation);
  return policy.retryMethods.includes(String(request.method ?? "get").toLowerCase());
};

// Add response interceptor to handle errors
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: any) => { // TODO(types): Generic error interceptor payload
    const originalRequest = error.config as InternalAxiosRequestConfig | undefined;

    const policy = getOperationPolicy(originalRequest?.url, originalRequest?.operation);
    const attempt = originalRequest?._retryAttempt ?? 1;
    const canRetry =
      originalRequest &&
      !originalRequest._authRetry &&
      attempt < policy.maxAttempts &&
      isRetryableRequest(originalRequest);

    // Handle network errors when the operation has a bounded retry budget.
    if (error.code === "ERR_NETWORK" && !canRetry) {
      console.error("Network error:", error);
      return Promise.reject({
        message:
          "Unable to connect to the server. Please check your internet connection.",
        originalError: error,
      });
    }

    // Handle timeouts
    if (error.code === "ECONNABORTED" && !canRetry) {
      console.log("Request timeout:", error);
      return Promise.reject({
        message: "Request timed out. Please try again.",
        originalError: error,
      });
    }

    // Handle 401 - attempt token refresh (skip for login/register/refresh/stellar-auth/google-auth endpoints)
    const isAuthRoute =
      originalRequest?.url?.includes("/api/auth/login") ||
      originalRequest?.url?.includes("/api/auth/register") ||
      originalRequest?.url?.includes("/api/auth/refresh") ||
      originalRequest?.url?.includes("/api/auth/stellar/") ||
      originalRequest?.url?.includes("/api/auth/google");

    if (originalRequest && error.response?.status === 401 && !originalRequest._authRetry && !isAuthRoute) {
      if (isRefreshing) {
        return new Promise<string | null>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => axiosInstance(originalRequest));
      }

      originalRequest._authRetry = true;
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
          const userInfo: Record<string, any> = { id: user.id, name: user.name, role: user.role, email: user.email }; // TODO(types): Profile property bag
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
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${token}`;
        }
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);

        // Refresh failed - clear auth and redirect to login
        const Cookies = (await import("js-cookie")).default;
        Cookies.remove("authToken", { path: "/" });
        Cookies.remove("userInfo", { path: "/" });

        if (typeof window !== "undefined") {
          // Axios runs outside React; this hard redirect handles an expired session.
          window.location.href = "/login";
        }

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Retry only within the operation budget, with bounded backoff and jitter.
    const status = error.response?.status;
    if (
      originalRequest &&
      canRetry &&
      (error.code === "ERR_NETWORK" ||
        error.code === "ECONNABORTED" ||
        policy.retryStatuses.includes(status))
    ) {
      originalRequest._retryAttempt = attempt + 1;
      try {
        const retryAfter = error.response?.headers?.["retry-after"];
        await waitForRetry(
          getRetryDelayMs(attempt, retryAfter),
          originalRequest.signal
        );
        return axiosInstance(originalRequest);
      } catch (retryError) {
        return Promise.reject(retryError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
