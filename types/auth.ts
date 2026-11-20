import { User } from "./api";

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  logout: () => void;
  refreshUser: (userId: string) => Promise<User | undefined>;
}

export interface SessionData {
  token: string;
  user: User;
}

export interface LoginResponse {
  token: string;
  user: User;
  message?: string;
}

export interface SignupResponse {
  success: boolean;
  message: string;
}
