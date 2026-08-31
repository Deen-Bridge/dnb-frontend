"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  getSessionSecurityConfig,
  DEFAULT_SESSION_SECURITY_CONFIG,
} from "@/lib/actions/admin-session-config";
import { reauthenticate } from "@/lib/actions/auth/reauth";
import { isSessionFresh, markReauthenticated } from "@/lib/auth/session-status";

export interface ReauthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (password: string) => Promise<void>;
}

export interface UseReauthResult {
  ensureFreshSession: () => Promise<boolean>;
  reauthProps: ReauthDialogProps;
}

export default function useReauth(): UseReauthResult {
  const [open, setOpen] = useState<boolean>(false);

  const reauthAfterRef = useRef<number>(
    DEFAULT_SESSION_SECURITY_CONFIG.reauthAfterMinutes
  );
  const pendingRef = useRef<((result: boolean) => void) | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const cfg = await getSessionSecurityConfig();
        if (!cancelled && cfg?.reauthAfterMinutes != null) {
          reauthAfterRef.current = cfg.reauthAfterMinutes;
        }
      } catch {
        // Keep the default threshold on failure
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const settle = useCallback((result: boolean) => {
    const resolve = pendingRef.current;
    pendingRef.current = null;
    if (resolve) resolve(result);
  }, []);

  const ensureFreshSession = useCallback((): Promise<boolean> => {
    if (isSessionFresh(reauthAfterRef.current)) {
      return Promise.resolve(true);
    }
    if (pendingRef.current) settle(false);
    return new Promise((resolve) => {
      pendingRef.current = resolve;
      setOpen(true);
    });
  }, [settle]);

  const onConfirm = useCallback(
    async (password: string): Promise<void> => {
      await reauthenticate({ password });
      markReauthenticated();
      setOpen(false);
      settle(true);
    },
    [settle]
  );

  const onOpenChange = useCallback(
    (next: boolean) => {
      setOpen(next);
      if (!next) settle(false);
    },
    [settle]
  );

  return {
    ensureFreshSession,
    reauthProps: { open, onOpenChange, onConfirm },
  };
}
