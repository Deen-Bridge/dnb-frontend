"use client";
import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { toast } from "sonner";
import axiosInstance from "@/lib/config/axios.config";
import { setCacheScope } from "@/lib/utils/cache";

const AuthContext = createContext(null);

let _authUpdater = null;
export function __setAuthUpdater(fn) {
  _authUpdater = fn;
}
export function __triggerAuthUpdate(user) {
  if (_authUpdater) _authUpdater(user);
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const setAuthState = useCallback((userData) => {
    if (userData) {
      if (userData.id && !userData._id) userData._id = userData.id;
      setUser(userData);
      setIsAuthenticated(true);
      setCacheScope(userData._id || userData.id || null);
    } else {
      setUser(null);
      setIsAuthenticated(false);
      setCacheScope(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    __setAuthUpdater(setAuthState);

    let userInfo = null;
    try {
      const raw = Cookies.get("userInfo");
      if (raw) userInfo = JSON.parse(raw);
    } catch {
      Cookies.remove("userInfo", { path: "/" });
    }

    if (userInfo) {
      if (userInfo.id && !userInfo._id) userInfo._id = userInfo.id;
      setUser(userInfo);
      setIsAuthenticated(true);
    }
    setLoading(false);

    return () => {
      __setAuthUpdater(null);
    };
  }, [setAuthState]);

  // Anonymous error-tracking context: id only, never email or name.
  useEffect(() => {
    let active = true;
    import("@sentry/nextjs")
      .then((mod) => {
        const Sentry = mod.default ?? mod;
        if (!active || !Sentry || typeof Sentry.setUser !== "function") return;
        Sentry.setUser(user?._id ? { id: user._id } : null);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [user?._id]);

  const logout = useCallback(() => {
    Cookies.remove("userInfo", { path: "/" });
    axiosInstance.post("/api/auth/logout").catch(() => {});
    setUser(null);
    setIsAuthenticated(false);
    setCacheScope(null);

    if (typeof window !== "undefined" && "caches" in window) {
      caches.keys().then((names) => {
        const runtimeCaches = names.filter((name) => name.startsWith("dnb-runtime-"));
        return Promise.all(
          runtimeCaches.map((name) => caches.delete(name))
        );
      }).catch(() => {});
    }

    toast.success("Logged out successfully");
    router.push("/");
  }, [router]);

  const refreshUser = useCallback(async (userId) => {
    try {
      const res = await axiosInstance.get(`/api/users/${userId}`);
      if (res.data && (res.data.user || res.data)) {
        let freshUser = res.data.user || res.data;
        if (freshUser.id && !freshUser._id) freshUser._id = freshUser.id;
        setUser(freshUser);
        Cookies.set("userInfo", JSON.stringify(freshUser), { expires: 1, path: "/" });
        setIsAuthenticated(true);
        return freshUser;
      }
    } catch (error) {
      console.log("Failed to refresh user:", error);
      toast.error("Failed to refresh user info");
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, loading, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}
