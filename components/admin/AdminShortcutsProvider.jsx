"use client";
/**
 * AdminShortcutsProvider — arms the power-admin keyboard layer (#336).
 * ---------------------------------------------------------------------------
 * Mirrors `AdminIdleGuard`: mounted **once** in `AppProviders`, it is a
 * deliberate no-op except when BOTH conditions hold —
 *   1. the signed-in user is an admin (`normalizeRole(user.role) === ADMIN`), and
 *   2. the user is currently on an admin surface (an `/admin` or
 *      `/dashboard/admin` route).
 *
 * When armed it activates {@link useAdminShortcuts} (the chord state machine)
 * and renders the `?` cheatsheet overlay. For non-admins, learners, or any
 * non-admin route it arms nothing and renders nothing, so the blast radius is
 * contained and there is zero chance of intercepting a normal user's typing.
 */
import { useMemo } from "react";
import { usePathname } from "next/navigation";
import useAuth from "@/hooks/useAuth";
import useAdminShortcuts from "@/hooks/useAdminShortcuts";
import ShortcutCheatsheet from "@/components/admin/ShortcutCheatsheet";
import { ROLES, normalizeRole } from "@/lib/auth/roles";

/** Matches an admin surface: ".../admin" or ".../admin/..." (any locale prefix). */
const ADMIN_ROUTE = /\/admin(\/|$)/;

export default function AdminShortcutsProvider() {
  const { user, loading } = useAuth();
  const pathname = usePathname();

  const isAdmin = useMemo(
    () => Boolean(user) && normalizeRole(user.role) === ROLES.ADMIN,
    [user]
  );
  const onAdminRoute = Boolean(pathname && ADMIN_ROUTE.test(pathname));

  // Only arm once auth is resolved — never mid-load.
  const armed = !loading && isAdmin && onAdminRoute;

  const { isCheatsheetOpen, setCheatsheetOpen } = useAdminShortcuts({
    enabled: armed,
  });

  // Nothing to render unless armed; the cheatsheet is only reachable then.
  if (!armed) return null;

  return (
    <ShortcutCheatsheet open={isCheatsheetOpen} onOpenChange={setCheatsheetOpen} />
  );
}
