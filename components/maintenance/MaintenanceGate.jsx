"use client";
/**
 * MaintenanceGate — layout-level, client-side maintenance gate (#303).
 * ---------------------------------------------------------------------------
 * WHY A LAYOUT GATE, NOT MIDDLEWARE: auth in this app is entirely CLIENT-SIDE
 * (a JWT in a cookie decoded by `useAuth`), so a Next.js `middleware.js` running
 * on the edge cannot reliably tell an admin apart from a learner — it would
 * either lock admins out or leak the app to everyone. Instead this gate is a
 * client provider mounted once in `AppProviders`, so it re-evaluates the flag on
 * every render and route change with the real, decoded user in hand. It also
 * polls lightly (60s) and refetches on window focus so a toggle propagates to
 * already-open tabs without a manual reload.
 *
 * Three coherent states:
 *   1. maintenance OFF                → render the app normally.
 *   2. maintenance ON  + admin        → render the app + a persistent top bar
 *                                        ("Maintenance mode is ON") with a
 *                                        "Turn off" action and a settings link.
 *   3. maintenance ON  + non-admin /  → render <MaintenanceScreen> instead of
 *      logged-out                        the app.
 *
 * FAIL-OPEN: while the initial state is still loading we render children, so a
 * transient read never flashes the lock screen at legitimate users.
 */
import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { Wrench, Settings, Loader2 } from "lucide-react";
import useAuth from "@/hooks/useAuth";
import useMaintenanceMode from "@/hooks/useMaintenanceMode";
import { normalizeRole, ROLES } from "@/lib/auth/roles";
import { getMaintenanceState } from "@/lib/actions/admin-maintenance";
import MaintenanceScreen from "@/components/maintenance/MaintenanceScreen";
import { cn } from "@/lib/utils";
import { poppins_500 } from "@/lib/config/font.config";

/** Poll cadence for propagating a toggle to already-open tabs. */
const POLL_INTERVAL_MS = 60_000;

/** Whether the user holds the admin role (any tier) and may bypass the lock. */
function isAdminUser(user) {
  return Boolean(user) && normalizeRole(user.role) === ROLES.ADMIN;
}

/**
 * Persistent top bar shown to admins while maintenance is ON. Shares the admin
 * `useMaintenanceMode` hook for the "Turn off" mutation, then asks the gate to
 * refetch so the bar disappears immediately.
 *
 * @param {{onTurnedOff: () => void}} props
 */
function MaintenanceAdminBar({ onTurnedOff }) {
  const router = useRouter();
  const { disable, isSaving } = useMaintenanceMode();

  const handleTurnOff = async () => {
    try {
      await disable();
      onTurnedOff();
      router.refresh();
    } catch {
      // useMaintenanceMode already surfaced a toast; leave the bar in place.
    }
  };

  return (
    <div
      role="status"
      className={cn(
        poppins_500.className,
        "sticky top-0 z-[60] flex flex-wrap items-center justify-center gap-x-4 gap-y-2 bg-amber-500 px-4 py-2 text-center text-sm text-amber-950 shadow-md"
      )}
    >
      <span className="inline-flex items-center gap-2">
        <Wrench className="h-4 w-4 shrink-0" aria-hidden="true" />
        Maintenance mode is ON — learners see the lock screen.
      </span>
      <span className="inline-flex items-center gap-2">
        <button
          type="button"
          onClick={handleTurnOff}
          disabled={isSaving}
          className="inline-flex items-center gap-1.5 rounded-full bg-amber-950 px-3 py-1 text-xs font-semibold text-amber-50 transition hover:bg-amber-900 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSaving ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
          ) : null}
          {isSaving ? "Turning off…" : "Turn off"}
        </button>
        <Link
          href="/dashboard/admin/settings/maintenance"
          className="inline-flex items-center gap-1 rounded-full border border-amber-950/40 px-3 py-1 text-xs font-semibold transition hover:bg-amber-950/10"
        >
          <Settings className="h-3.5 w-3.5" aria-hidden="true" />
          Settings
        </Link>
      </span>
    </div>
  );
}

/**
 * @param {{children: React.ReactNode}} props
 */
export default function MaintenanceGate({ children }) {
  const { user, loading: authLoading } = useAuth();
  const pathname = usePathname();

  const [maintenance, setMaintenance] = useState(null);
  const [ready, setReady] = useState(false);

  const fetchState = useCallback(async () => {
    try {
      const { maintenance: state } = await getMaintenanceState();
      setMaintenance(state);
    } catch {
      // Fail open: on a read error leave the last-known (or null) state so the
      // app stays reachable rather than trapping everyone behind the lock.
    } finally {
      setReady(true);
    }
  }, []);

  // Re-check on mount and on every route change (the "each navigation" check).
  useEffect(() => {
    fetchState();
  }, [fetchState, pathname]);

  // Light polling + focus refetch so an open tab notices a toggle.
  useEffect(() => {
    const id = setInterval(fetchState, POLL_INTERVAL_MS);
    const onFocus = () => fetchState();
    window.addEventListener("focus", onFocus);
    return () => {
      clearInterval(id);
      window.removeEventListener("focus", onFocus);
    };
  }, [fetchState]);

  const enabled = Boolean(maintenance?.enabled);

  // Fail-open until we have both the flag and a resolved auth state.
  if (!ready || authLoading || !enabled) {
    return <>{children}</>;
  }

  if (isAdminUser(user)) {
    return (
      <>
        <MaintenanceAdminBar onTurnedOff={fetchState} />
        {children}
      </>
    );
  }

  return (
    <MaintenanceScreen
      message={maintenance?.message}
      etaAt={maintenance?.etaAt}
    />
  );
}
