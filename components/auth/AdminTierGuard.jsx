"use client";
/**
 * AdminTierGuard — page-level super-admin gate for admin-team surfaces (#315).
 * ---------------------------------------------------------------------------
 * Composes over `ProtectedRoute` (authentication) and `canManageTeam` from the
 * isolated tier module (`lib/auth/admin-tiers.js`). Unlike `RoleGuard`, which
 * redirects, this guard renders the access-denied screen **inline** while
 * keeping the user on the page — a staff admin who navigates here sees an
 * explicit "insufficient permissions" fallback, never a flash of the member
 * list.
 *
 * Layering:
 *   1. `ProtectedRoute` resolves auth (loader → login redirect when signed out,
 *      and its loader covers the unknown/loading states).
 *   2. Once the user is known, `canManageTeam(user)` decides; staff admins fall
 *      through to the access-denied fallback below.
 *
 * Usage:
 *   <AdminTierGuard>
 *     <AdminTeamContent />
 *   </AdminTierGuard>
 */
import ProtectedRoute from "@/hooks/protected-route";
import { useAuth } from "@/hooks/useAuth";
import Loader from "@/components/molecules/loaders/rootLoader";
import Unauthorized from "@/components/molecules/errors/Unauthorized";
import { canManageTeam } from "@/lib/auth/admin-tiers";

function TierGate({ children }) {
  const { user } = useAuth();

  // Defensive: ProtectedRoute resolves auth before rendering us, but fail
  // closed (loader, never gated content) if we ever render without a user.
  if (!user) return <Loader />;

  if (!canManageTeam(user)) {
    return (
      <Unauthorized message="Only super admins can manage the admin team. If you think this is a mistake, contact a super admin." />
    );
  }

  return <>{children}</>;
}

export function AdminTierGuard({ children }) {
  return (
    <ProtectedRoute>
      <TierGate>{children}</TierGate>
    </ProtectedRoute>
  );
}

export default AdminTierGuard;
