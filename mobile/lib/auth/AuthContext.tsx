import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import {
  apiClient,
  storeTokens,
  getAccessToken,
  clearTokens,
  API_ENDPOINTS,
} from "@/lib/api";
import type { User } from "@/types";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    getAccessToken()
      .then((token) => token ? apiClient.get(API_ENDPOINTS.auth.me) : null)
      .then((response) => { if (active) setUser(response?.data?.user ?? response?.data ?? null); })
      .catch(async () => { await clearTokens(); if (active) setUser(null); })
      .finally(() => { if (active) setIsLoading(false); });
    return () => { active = false; };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const { data } = await apiClient.post(API_ENDPOINTS.auth.login, { email, password });
    await storeTokens(data.accessToken, data.refreshToken ?? "");
    setUser(data.user ?? (await apiClient.get(API_ENDPOINTS.auth.me)).data);
  }, []);

  const signUp = useCallback(
    async (email: string, password: string, name: string) => {
      const { data } = await apiClient.post(API_ENDPOINTS.auth.register, { email, password, name });
      await storeTokens(data.accessToken, data.refreshToken ?? "");
      setUser(data.user ?? (await apiClient.get(API_ENDPOINTS.auth.me)).data);
    },
    []
  );

  const signOut = useCallback(async () => {
    await apiClient.post(API_ENDPOINTS.auth.logout).catch(() => undefined);
    await clearTokens();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
