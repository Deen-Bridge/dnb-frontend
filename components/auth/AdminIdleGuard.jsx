"use client";
/**
 * AdminIdleGuard — idle-timeout warning + auto-logout for admin sessions (#337).
 * ---------------------------------------------------------------------------
 * Mounted **once** in `AppProviders`, this component is a deliberate no-op
 * except when BOTH conditions hold:
 *   1. the signed-in user is an admin (`normalizeRole(user.role) === ADMIN`), and
 *   2. the user is currently on an admin surface (an `/admin` or
 *      `/dashboard/admin` route).
 *
 * Admin sessions are held to a stricter standard than learner areas: after a
 * configurable idle period an "you'll be signed out" warning counts down, and
 * on timeout the user is signed out and bounced to the login page with a clear
 * reason. Everywhere else it arms nothing, so the blast radius is contained.
 *
 * **Fail safe.** It never forces a logout while auth or the config are still
 * loading, and it disarms the moment the user leaves an admin route or signs
 * out — a non-admin visitor is never affected.
 */
import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, ShieldAlert } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import useAuth from "@/hooks/useAuth";
import useIdleTimeout from "@/hooks/useIdleTimeout";
import { ROLES, normalizeRole } from "@/lib/auth/roles";
import {
  getSessionSecurityConfig,
  DEFAULT_SESSION_SECURITY_CONFIG,
} from "@/lib/actions/admin-session-config";
import {
  loginUrlWithReason,
  SESSION_IDLE,
  clearReauthMarker,
} from "@/lib/auth/session-status";
import { cn } from "@/lib/utils";
import { poppins_400, poppins_600 } from "@/lib/config/font.config";

/** Matches an admin surface: ".../admin" or ".../admin/..." (any locale prefix). */
const ADMIN_ROUTE = /\/admin(\/|$)/;

/** Format seconds as "m:ss" for the countdown, clamped at zero. */
function formatCountdown(totalSeconds) {
  const s = Math.max(0, Math.floor(totalSeconds || 0));
  const minutes = Math.floor(s / 60);
  const seconds = s % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

export default function AdminIdleGuard() {
  const { user, loading, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const [config, setConfig] = useState(null);

  const isAdmin = useMemo(
    () => Boolean(user) && normalizeRole(user.role) === ROLES.ADMIN,
    [user]
  );
  const onAdminRoute = Boolean(pathname && ADMIN_ROUTE.test(pathname));

  // Load the (stubbed) config once we know the user is an admin. Fail safe:
  // fall back to defaults if the request fails so the guard still protects.
  useEffect(() => {
    if (!isAdmin) {
      setConfig(null);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const cfg = await getSessionSecurityConfig();
        if (!cancelled) setConfig(cfg);
      } catch {
        if (!cancelled) setConfig({ ...DEFAULT_SESSION_SECURITY_CONFIG });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isAdmin]);

  // Only arm once everything needed is resolved — never mid-load.
  const armed = !loading && isAdmin && onAdminRoute && Boolean(config);

  const idleMs = (config?.idleTimeoutMinutes ?? 0) * 60_000;
  const warnMs = (config?.idleWarningSeconds ?? 0) * 1000;

  const handleTimeout = () => {
    // Sign out, forget any step-up freshness, and explain why on the login page.
    clearReauthMarker();
    try {
      logout();
    } finally {
      router.replace(loginUrlWithReason(SESSION_IDLE));
    }
  };

  const { isIdleWarning, remainingSeconds, stayActive } = useIdleTimeout({
    idleMs,
    warnMs,
    enabled: armed,
    onTimeout: handleTimeout,
  });

  // Nothing to render unless we're armed and actively warning.
  if (!armed || !isIdleWarning) return null;

  return (
    <AlertDialog open={isIdleWarning}>
      <AlertDialogContent className="border border-destructive/20 bg-surface-raised">
        <AlertDialogHeader>
          <AlertDialogTitle
            className={cn(poppins_600.className, "flex items-center gap-2 text-ink")}
          >
            <ShieldAlert className="h-5 w-5 text-destructive" aria-hidden="true" />
            You&apos;ll be signed out soon
          </AlertDialogTitle>
          <AlertDialogDescription
            className={cn(poppins_400.className, "text-ink-muted")}
          >
            For security, your admin session will end after inactivity. You&apos;ll
            be signed out in{" "}
            <span
              className="font-mono font-semibold text-destructive"
              aria-live="polite"
            >
              {formatCountdown(remainingSeconds)}
            </span>
            .
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            className="rounded-full"
            onClick={handleTimeout}
          >
            <LogOut className="mr-1 h-4 w-4" aria-hidden="true" />
            Sign out now
          </AlertDialogCancel>
          <AlertDialogAction
            className="rounded-full bg-accent text-white hover:bg-accent/90"
            onClick={stayActive}
          >
            Stay signed in
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
