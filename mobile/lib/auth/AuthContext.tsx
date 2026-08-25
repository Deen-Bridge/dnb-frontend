import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  User as FirebaseUser,
} from "firebase/auth";
import { FIREBASE_CONFIG } from "@/lib/config/env";
import { initializeApp, getApps } from "firebase/app";
import {
  apiClient,
  storeTokens,
  clearTokens,
  API_ENDPOINTS,
} from "@/lib/api";
import type { User } from "@/types";

if (!getApps().length) {
  initializeApp(FIREBASE_CONFIG);
}

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        try {
          const token = await fbUser.getIdToken();
          await storeTokens(token, "");
          const { data } = await apiClient.get(API_ENDPOINTS.auth.me);
          setUser(data.user ?? data);
        } catch {
          setUser(null);
        }
      } else {
        setUser(null);
        await clearTokens();
      }
      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const auth = getAuth();
    const credential = await signInWithEmailAndPassword(auth, email, password);
    const token = await credential.user.getIdToken();
    await storeTokens(token, "");
    const { data } = await apiClient.get(API_ENDPOINTS.auth.me);
    setUser(data.user ?? data);
  }, []);

  const signUp = useCallback(
    async (email: string, password: string, name: string) => {
      const auth = getAuth();
      const credential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      await credential.user.updateProfile({ displayName: name });
      const token = await credential.user.getIdToken();
      await storeTokens(token, "");
      await apiClient.post(API_ENDPOINTS.auth.register, { email, name });
      const { data } = await apiClient.get(API_ENDPOINTS.auth.me);
      setUser(data.user ?? data);
    },
    []
  );

  const signOut = useCallback(async () => {
    const auth = getAuth();
    await firebaseSignOut(auth);
    await clearTokens();
    setUser(null);
    setFirebaseUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        firebaseUser,
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
