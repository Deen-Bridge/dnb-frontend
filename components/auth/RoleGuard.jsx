"use client";
/**
 * RoleGuard — route-level authorization, composed over ProtectedRoute.
 * --------------------------------------------------------------------
 * Wrap a gated page/segment:
 *
 *   <RoleGuard capability={CAPABILITIES.COURSE_CREATE}>
 *     <CourseWizard />
 *   </RoleGuard>
 *
 * Layering:
 *   1. `ProtectedRoute` handles authentication (redirect to /login, loader
 *      while auth resolves) — we reuse it rather than re-implement it.
 *   2. Inside it, `CapabilityGate` runs the role/verification check. It only
 *      ever renders once the user is known (ProtectedRoute has resolved), so
 *      it fails closed with no affordance flash.
 *
 * Outcomes for a gated capability:
 *   - allowed                       → render children
 *   - right role, not yet verified  → <VerificationRequired /> (recoverable)
 *   - wrong role (e.g. student)     → redirect to the Unauthorized screen
 *
 * `capability` gates on a {@link CAPABILITIES} action. Alternatively pass
 * `roles` (array of {@link ROLES}) for a plain role gate with no verification
 * requirement.
 */
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/hooks/protected-route";
import { useAuth } from "@/hooks/useAuth";
import Loader from "@/components/molecules/loaders/rootLoader";
import Unauthorized from "@/components/molecules/errors/Unauthorized";
import VerificationRequired from "@/components/auth/VerificationRequired";
import {
  can,
  roleAllows,
  requiresVerification,
  isVerified,
  normalizeRole,
} from "@/lib/auth/roles";

const UNAUTHORIZED_PATH = "/dashboard/unauthorized";

function CapabilityGate({ capability, roles, redirectTo, children }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Decide the outcome. `loading` is already handled by ProtectedRoute (this
  // component isn't rendered until auth resolves), but we guard defensively.
  let allowed;
  let recoverableViaVerification = false;

  if (capability) {
    allowed = can(capability, user);
    recoverableViaVerification =
      !allowed &&
      requiresVerification(capability) &&
      roleAllows(user, capability) &&
      !isVerified(user);
  } else if (Array.isArray(roles) && roles.length > 0) {
    const role = user ? normalizeRole(user.role) : null;
    allowed = role !== null && roles.includes(role);
  } else {
    // No capability/roles specified → treat as authenticated-only pass-through.
    allowed = !!user;
  }

  const shouldRedirect = !loading && !allowed && !recoverableViaVerification;

  useEffect(() => {
    if (shouldRedirect) {
      router.replace(redirectTo || UNAUTHORIZED_PATH);
    }
  }, [shouldRedirect, redirectTo, router]);

  if (loading) return <Loader />;
  if (allowed) return <>{children}</>;
  if (recoverableViaVerification) return <VerificationRequired />;

  // Wrong role: render the unauthorized screen inline while the redirect above
  // takes effect, so there's never a blank frame.
  return <Unauthorized />;
}

export function RoleGuard({ capability, roles, redirectTo, children }) {
  return (
    <ProtectedRoute>
      <CapabilityGate capability={capability} roles={roles} redirectTo={redirectTo}>
        {children}
      </CapabilityGate>
    </ProtectedRoute>
  );
}

export default RoleGuard;
