"use client";
/**
 * useReauth — step-up re-authentication gate for sensitive admin actions (#337).
 * ---------------------------------------------------------------------------
 * When a session is older than the configured `reauthAfterMinutes`, sensitive
 * mutations should require the admin to re-confirm their password first. This
 * hook exposes:
 *
 *   const { ensureFreshSession, reauthProps } = useReauth();
 *
 * `ensureFreshSession()` returns a promise that resolves `true` when the caller
 * may proceed and `false` when the admin cancelled. If the session is already
 * fresh (or its age can't be determined) it resolves `true` immediately without
 * prompting. Otherwise it opens the re-auth dialog and resolves once the admin
 * succeeds or cancels. Spread `reauthProps` onto `<ReauthPromptDialog />`.
 *
 * Usage:
 *   const { ensureFreshSession, reauthProps } = useReauth();
 *   const onDangerousThing = async () => {
 *     if (!(await ensureFreshSession())) return; // cancelled
 *     await doDangerousThing();
 *   };
 *   return <><ReauthPromptDialog {...reauthProps} /></>;
 */
import { useCallback, useEffect, useRef, useState } from "react";
import {
  getSessionSecurityConfig,
  DEFAULT_SESSION_SECURITY_CONFIG,
} from "@/lib/actions/admin-session-config";
import { reauthenticate } from "@/lib/actions/auth/reauth";
import { isSessionFresh, markReauthenticated } from "@/lib/auth/session-status";

export default function useReauth() {
  const [open, setOpen] = useState(false);

  // Threshold used to decide freshness; starts at the safe default and is
  // replaced once the stubbed config loads.
  const reauthAfterRef = useRef(
    DEFAULT_SESSION_SECURITY_CONFIG.reauthAfterMinutes
  );
  // Resolver for the promise handed back by `ensureFreshSession`.
  const pendingRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const cfg = await getSessionSecurityConfig();
        if (!cancelled && cfg?.reauthAfterMinutes != null) {
          reauthAfterRef.current = cfg.reauthAfterMinutes;
        }
      } catch {
        // Keep the default threshold on failure.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const settle = useCallback((result) => {
    const resolve = pendingRef.current;
    pendingRef.current = null;
    if (resolve) resolve(result);
  }, []);

  /**
   * Resolve `true` when the caller may proceed with the sensitive action.
   * Prompts for re-auth only when the session is stale.
   * @returns {Promise<boolean>}
   */
  const ensureFreshSession = useCallback(() => {
    if (isSessionFresh(reauthAfterRef.current)) {
      return Promise.resolve(true);
    }
    // If a prompt is somehow already open, cancel the previous waiter.
    if (pendingRef.current) settle(false);
    return new Promise((resolve) => {
      pendingRef.current = resolve;
      setOpen(true);
    });
  }, [settle]);

  /**
   * Verify the password. Throws on failure so the dialog can show the error and
   * stay open; on success marks the session fresh and resolves the waiter.
   * @param {string} password
   */
  const onConfirm = useCallback(
    async (password) => {
      await reauthenticate({ password });
      markReauthenticated();
      setOpen(false);
      settle(true);
    },
    [settle]
  );

  const onOpenChange = useCallback(
    (next) => {
      setOpen(next);
      if (!next) settle(false); // closing/cancelling → don't proceed
    },
    [settle]
  );

  return {
    ensureFreshSession,
    reauthProps: { open, onOpenChange, onConfirm },
  };
}
