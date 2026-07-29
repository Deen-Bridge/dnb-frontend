"use client";
import { useAuthContext, __triggerAuthUpdate } from "@/components/providers/AuthProvider";
import Cookies from "js-cookie";
import { toast } from "sonner";
import axiosInstance from "@/lib/config/axios.config";

const COOKIE_OPTIONS = { expires: 1, path: "/" };

/**
 * Persist auth session cookies and sync AuthProvider state.
 * Shared by email/password login, signup, and Sign in with Stellar.
 */
export const persistSession = (token, user) => {
  if (!token || !user) {
    throw new Error("Missing token or user for session persistence");
  }

  if (user.id && !user._id) user._id = user.id;

  Cookies.set("authToken", token, COOKIE_OPTIONS);
  Cookies.set("userInfo", JSON.stringify(user), COOKIE_OPTIONS);

  __triggerAuthUpdate(user);

  return user;
};

export const useAuth = () => {
  return useAuthContext();
};

export const login = async (email, password) => {
  try {
    const res = await axiosInstance.post("/api/auth/login", {
      email,
      password,
    });
    const { token, user } = res.data;
    persistSession(token, user);

    toast.success("Login successful");
    return user;
  } catch (error) {
    if (error.response) {
      const errorMessage = error.response.data?.message || "Login failed";
      console.log("Login failed:", errorMessage);
      toast.error(errorMessage);
    } else {
      console.log("Login failed:", error.message);
      toast.error("An unexpected error occurred. Please try again.");
    }
    throw error;
  }
};

export const signup = async (name, email, password, role) => {
  try {
    const res = await axiosInstance.post("/api/auth/register", {
      name,
      email,
      password,
      role,
    });

    const { token, user } = res.data;
    persistSession(token, user);

    toast.success("Signup successful! Redirecting to dashboard...");
    return user;
  } catch (error) {
    if (error.response) {
      const errorMessage = error.response.data?.message || "Signup failed";
      console.log("Signup failed:", errorMessage);
      toast.error(errorMessage);
    } else {
      console.log("Signup failed:", error.message);
      toast.error("An unexpected error occurred. Please try again.");
    }
    throw error;
  }
};

export default useAuth;
