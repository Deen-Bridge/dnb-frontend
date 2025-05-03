"use client";

import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import axios from "axios";

const useAuth = () => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = Cookies.get("authToken");
    const userInfo = Cookies.get("userInfo")
      ? JSON.parse(Cookies.get("userInfo"))
      : null;

    if (token && userInfo) {
      setUser(userInfo);
      setIsAuthenticated(true);
    }
  }, []);

  const logout = () => {
    Cookies.remove("authToken");
    Cookies.remove("userInfo");
    setUser(null);
    setIsAuthenticated(false);
    toast.success("Logged out successfully");
    router.push("/login");
  };

  return { user, isAuthenticated, logout };
};

// Export login function separately
export const login = async (email, password) => {
  try {
    const res = await axios.post("/api/auth/login", { email, password });
    const { token, user } = res.data;

    // Save token and user info in cookies
    Cookies.set("authToken", token, { expires: 3 }); // Expires in 3 days
    Cookies.set("userInfo", JSON.stringify(user), { expires: 3 });

    toast.success("Login successful");
    return user; // Return user info if needed
  } catch (error) {
    if (error.response) {
      // Backend returned an error response
      const errorMessage = error.response.data?.message || "Login failed";
      console.error("Login failed:", errorMessage);
      toast.error(errorMessage); // Show the error message from the backend
    } else {
      // Network or other unexpected errors
      console.error("Login failed:", error.message);
      toast.error("An unexpected error occurred. Please try again.");
    }
    throw error; // Re-throw error for handling in the component
  }
};
export const signup = async (name, email, password, role) => {
  try {
    const res = await axios.post("/api/auth/signup", {
      name,
      email,
      password,
      role,
    });

    // Show success toast
    toast.success("Signup successful! Redirecting to login...");
    return res.data; // Return response data if needed
  } catch (error) {
    if (error.response) {
      // Handle backend error response
      const errorMessage = error.response.data?.message || "Signup failed";
      console.error("Signup failed:", errorMessage);
      toast.error(errorMessage); // Show the error message from the backend
    } else {
      // Handle network or unexpected errors
      console.error("Signup failed:", error.message);
      toast.error("An unexpected error occurred. Please try again.");
    }
    throw error; // Re-throw error for handling in the component
  }
};
export default useAuth;
