"use client";
/**
 * useCan — capability helper bound to the authenticated user.
 * -----------------------------------------------------------
 * Thin, memoised wrapper over `can(action, user)` from `lib/auth/roles`, reading
 * the user (and the auth `loading` flag) from AuthProvider.
 *
 * **Fails closed while auth is resolving.** During the `loading` window every
 * check returns `false`, so no instructor affordance can flash before we know
 * who the user is. Once resolved it delegates to the pure `can()`.
 *
 * Usage:
 *   const { can } = useCan();
 *   if (can(CAPABILITIES.COURSE_CREATE)) { ...render Create button... }
 */
import { useCallback, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import {
  can as canFn,
  isVerified as isVerifiedFn,
  normalizeRole,
} from "@/lib/auth/roles";

export function useCan() {
  const { user, loading } = useAuth();

  const can = useCallback(
    (action) => {
      if (loading) return false; // fail closed until auth resolves
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
