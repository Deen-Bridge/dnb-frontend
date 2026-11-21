"use client";
import { useAuthContext, __triggerAuthUpdate } from "@/components/providers/AuthProvider";
import Cookies from "js-cookie";
import { toast } from "sonner";
import axiosInstance from "@/lib/config/axios.config";
import { User } from "@/types/api";
import { AUTH_EVENTS, broadcastAuthEvent } from "@/lib/auth/authSync";

const USER_COOKIE_OPTIONS = { expires: 1, path: "/" };

/**
 * Persist auth session cookies and sync AuthProvider state.
 * Shared by email/password login, signup, and Sign in with Stellar.
 */
export const persistSession = (_token: string, user: any): any => { // TODO(types): Authenticated user session object
  if (!user) {
    throw new Error("Missing user for session persistence");
  }

  if (user.id && !user._id) user._id = user.id;

  // The backend owns the HttpOnly access cookie. Never copy it into a
  // JavaScript-readable cookie.
  Cookies.set("userInfo", JSON.stringify(user), USER_COOKIE_OPTIONS);

  __triggerAuthUpdate(user);
  broadcastAuthEvent(AUTH_EVENTS.LOGIN, user._id ?? user.id ?? null);

  return user;
};

export interface AuthContextType {
  user: User | any | null; // TODO(types): Authenticated user session object
  isAuthenticated: boolean;
  loading: boolean;
  login: (credentials?: any) => Promise<any>; // TODO(types): Login credentials
  logout: () => void;
  refreshUser: (userId?: string) => Promise<void>;
  updateUser: (data: any) => void; // TODO(types): User update payload
  [key: string]: any; // TODO(types): Additional auth context properties
}

export const useAuth = (): AuthContextType => {
  return useAuthContext() as unknown as AuthContextType;
};

export const login = async (email?: string, password?: string): Promise<User | any> => { // TODO(types): Login response user
  try {
    const res = await axiosInstance.post("/api/auth/login", {
      email,
      password,
    });
    const { token, user } = res.data;
    persistSession(token, user);

    toast.success("Login successful");
    return user;
  } catch (error: any) { // TODO(types): Axios error from login
    if (error.response) {
      const errorMessage = error.response.data?.message || "Login failed";
      console.log("Login failed:", errorMessage);
      toast.error(errorMessage);
    } else {
      console.log("Login failed:", error?.message || error);
      toast.error("An unexpected error occurred. Please try again.");
    }
    throw error;
  }
};

export interface SignupResult {
  success: boolean;
  message: string;
}

export const signup = async (name?: string, email?: string, password?: string, role?: string): Promise<SignupResult> => {
  try {
    const res = await axiosInstance.post("/api/auth/register", {
      name,
      email,
      password,
      role,
    });

    const message = res.data.message || "Verification email sent. Please check your inbox.";
    toast.success(message);
    return { success: true, message };
  } catch (error: any) { // TODO(types): Axios error from signup
    if (error.response) {
      const errorMessage = error.response.data?.message || "Signup failed";
      console.log("Signup failed:", errorMessage);
      toast.error(errorMessage);
    } else {
      console.log("Signup failed:", error?.message || error);
      toast.error("An unexpected error occurred. Please try again.");
    }
    throw error;
  }
};

export default useAuth;
