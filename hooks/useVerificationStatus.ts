"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { normalizeRole, ROLES } from "@/lib/auth/roles";
import {
  fetchVerificationStatus,
  VERIFICATION_STATUS,
  VerificationStatusValue,
  VerificationStatusResult,
} from "@/lib/actions/educators/fetchVerificationStatus";
import { useNotificationSSE } from "@/hooks/useNotificationSSE";

const SNOOZE_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours
const LS_KEY = "dnb_verification_banner";

const BANNER_STATUSES = new Set<string>([
  VERIFICATION_STATUS.NOT_STARTED,
  VERIFICATION_STATUS.INCOMPLETE,
  VERIFICATION_STATUS.PENDING,
  VERIFICATION_STATUS.UNDER_REVIEW,
  VERIFICATION_STATUS.REJECTED,
]);

interface BannerPrefs {
  snoozedUntil?: number;
  dismissedForStatus?: string;
}

function readBannerPrefs(): BannerPrefs {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeBannerPrefs(prefs: BannerPrefs): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(LS_KEY, JSON.stringify(prefs));
  } catch {
    // storage full or private browsing
  }
}

export interface UseVerificationStatusResult {
  status: VerificationStatusValue;
  data: VerificationStatusResult | null;
  loading: boolean;
  error: string | null;
  resumeStep: number;
  isBannerVisible: boolean;
  isVerified: boolean;
  isRejected: boolean;
  isPending: boolean;
  isIncomplete: boolean;
  snooze: () => void;
  dismiss: () => void;
  refresh: () => Promise<void>;
}

export function useVerificationStatus(): UseVerificationStatusResult {
  const { user, refreshUser } = useAuth();
  const { onVerificationUpdate } = useNotificationSSE();

  const [data, setData] = useState<VerificationStatusResult | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [bannerPrefsVersion, setBannerPrefsVersion] = useState<number>(0);

  const isEducator = normalizeRole(user?.role) === ROLES.EDUCATOR;
  const mountedRef = useRef<boolean>(true);

  const load = useCallback(async () => {
    if (!isEducator) {
      setData(null);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const result = await fetchVerificationStatus();
      if (!mountedRef.current) return;
      setData(result);

      const prefs = readBannerPrefs();
      if (prefs.dismissedForStatus && prefs.dismissedForStatus !== result.status) {
        writeBannerPrefs({});
        setBannerPrefsVersion((v) => v + 1);
      }
    } catch (err: any) { // TODO(types): Error from fetchVerificationStatus
      if (!mountedRef.current) return;
      setError(err?.message ?? "Unknown error");
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [isEducator]);

  useEffect(() => {
    mountedRef.current = true;
    load();
    return () => {
      mountedRef.current = false;
    };
  }, [load]);

  const refresh = useCallback(async (): Promise<void> => {
    await load();
    if (user?._id) {
      await refreshUser(user._id).catch(() => {});
    }
  }, [load, refreshUser, user?._id]);

  useEffect(() => {
    if (!isEducator) return;
    const unsub = onVerificationUpdate(() => {
      refresh().catch(() => {});
    });
    return unsub;
  }, [isEducator, onVerificationUpdate, refresh]);

  const status = (data?.status ?? VERIFICATION_STATUS.NOT_STARTED) as VerificationStatusValue;

  const resumeStep = useMemo(() => {
    if (!data) return 1;
    const next = (data.lastCompletedStep ?? 0) + 1;
    return Math.min(next, data.totalSteps ?? 3);
  }, [data]);

  const isBannerVisible = useMemo(() => {
    void bannerPrefsVersion;

    if (!isEducator) return false;
    if (loading) return false;
    if (!BANNER_STATUSES.has(status)) return false;
    if (status === VERIFICATION_STATUS.VERIFIED) return false;

    const prefs = readBannerPrefs();

    if (prefs.dismissedForStatus === status) return false;
    if (prefs.snoozedUntil && Date.now() < prefs.snoozedUntil) return false;

    return true;
  }, [isEducator, loading, status, bannerPrefsVersion]);

  const snooze = useCallback(() => {
    writeBannerPrefs({ snoozedUntil: Date.now() + SNOOZE_DURATION_MS });
    setBannerPrefsVersion((v) => v + 1);
  }, []);

  const dismiss = useCallback(() => {
    writeBannerPrefs({ dismissedForStatus: status });
    setBannerPrefsVersion((v) => v + 1);
  }, [status]);

  return {
    status,
    data,
    loading,
    error,
    resumeStep,
    isBannerVisible,
    isVerified: status === VERIFICATION_STATUS.VERIFIED,
    isRejected: status === VERIFICATION_STATUS.REJECTED,
    isPending:
      status === VERIFICATION_STATUS.PENDING ||
      status === VERIFICATION_STATUS.UNDER_REVIEW,
    isIncomplete:
      status === VERIFICATION_STATUS.INCOMPLETE ||
      status === VERIFICATION_STATUS.NOT_STARTED,
    snooze,
    dismiss,
    refresh,
  };
}

export default useVerificationStatus;
