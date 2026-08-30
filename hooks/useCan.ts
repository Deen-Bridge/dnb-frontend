"use client";

import { useCallback, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import {
  can as canFn,
  isVerified as isVerifiedFn,
  normalizeRole,
  Role,
} from "@/lib/auth/roles";

export interface UseCanResult {
  can: (action: string) => boolean;
  loading: boolean;
  role: Role | null;
  isVerified: boolean;
}

export function useCan(): UseCanResult {
  const { user, loading } = useAuth();

  const can = useCallback(
    (action: string): boolean => {
      if (loading) return false;
      return canFn(action, user);
    },
    [user, loading]
  );

  return useMemo(
    () => ({
      can,
      loading,
      role: !loading && user ? normalizeRole(user.role) : null,
      isVerified: !loading && isVerifiedFn(user),
    }),
    [can, loading, user]
  );
}

export default useCan;
