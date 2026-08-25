"use client";
/**
 * FeatureFlagProvider — app-wide runtime feature-flag consumer context (#313).
 * ---------------------------------------------------------------------------
 * Fetches the flag set **once per session** via the stubbed service in
 * `lib/actions/admin-flags`, caches it in `sessionStorage`, and exposes it to
 * the whole app through {@link useFeatureFlag}. This is the *read* side of the
 * feature-flags feature; the admin *management* surface (list/toggle/create)
 * lives in `hooks/useFeatureFlags` + the settings page.
 *
 * Design notes
 * ------------
 *   - **Fetch once, cache per session.** On mount we hydrate synchronously from
 *     `sessionStorage` (key `dnb:feature-flags`) so a page reload doesn't
 *     re-flash; if the cache is empty we fetch once and persist. `refresh()`
 *     forces a re-fetch (e.g. right after an admin edits a flag).
 *   - **Fail closed.** Unknown key, provider not ready, or a disabled flag all
 *     resolve to `false` — a feature is only on with positive evidence.
 *   - **Stable partial rollout.** When a flag is enabled but its
 *     `rolloutPercentage` is < 100, inclusion is decided by a deterministic
 *     per-session hash of the flag key against a stable random session salt, so
 *     the same session gets the same answer for the whole session (no flicker),
 *     while different sessions spread across the rollout bucket.
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { listFlags } from "@/lib/actions/admin-flags";

const FLAGS_CACHE_KEY = "dnb:feature-flags";
const SESSION_SALT_KEY = "dnb:feature-flags:salt";

/**
 * @typedef {Object} FeatureFlag
 * @property {string} key
 * @property {string} description
 * @property {boolean} enabled
 * @property {number} rolloutPercentage
 * @property {boolean} critical
 * @property {string} updatedAt
 */

const FeatureFlagContext = createContext({
  /** @type {FeatureFlag[]} */
  flags: [],
  isReady: false,
  refresh: async () => {},
});

/**
 * Small, fast, deterministic string hash (FNV-1a, 32-bit). Not cryptographic —
 * it only needs to spread keys evenly and reproducibly into rollout buckets.
 *
 * @param {string} str
 * @returns {number} unsigned 32-bit integer
 */
function fnv1a(str) {
  let hash = 0x811c9dc5;
  for (let i = 0; i < str.length; i += 1) {
    hash ^= str.charCodeAt(i);
    // 32-bit FNV prime multiply via shifts, kept in 32-bit range.
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

/**
 * Read (or lazily create) a stable per-session salt so rollout bucketing is
 * consistent for the whole session but varies between sessions/users.
 *
 * @returns {string}
 */
function getSessionSalt() {
  if (typeof window === "undefined") return "ssr";
  try {
    let salt = window.sessionStorage.getItem(SESSION_SALT_KEY);
    if (!salt) {
      salt = Math.random().toString(36).slice(2, 12);
      window.sessionStorage.setItem(SESSION_SALT_KEY, salt);
    }
    return salt;
  } catch {
    return "no-storage";
  }
}

function readCachedFlags() {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(FLAGS_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function writeCachedFlags(flags) {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(FLAGS_CACHE_KEY, JSON.stringify(flags));
  } catch {
    /* sessionStorage unavailable (private mode / quota) — degrade to in-memory */
  }
}

/**
 * Decide whether a flag resolves to enabled for the current session. Applies
 * the master switch first, then the stable rollout bucket.
 *
 * @param {FeatureFlag|undefined|null} flag
 * @param {string} salt
 * @returns {boolean}
 */
export function resolveFlag(flag, salt) {
  if (!flag || typeof flag !== "object") return false;
  if (!flag.enabled) return false;

  const pct = Number(flag.rolloutPercentage);
  if (!Number.isFinite(pct) || pct >= 100) return true;
  if (pct <= 0) return false;

  // Stable bucket in [0, 100) for this session + key.
  const bucket = fnv1a(`${salt}:${flag.key}`) % 100;
  return bucket < pct;
}

/**
 * Provider that feeds the flag set to the app once per session. Mount it high
 * in the tree (e.g. inside `AppProviders`) so every consumer shares one fetch.
 *
 * @param {{children: React.ReactNode}} props
 */
export function FeatureFlagProvider({ children }) {
  const [flags, setFlags] = useState(() => readCachedFlags() || []);
  const [isReady, setIsReady] = useState(() => readCachedFlags() !== null);
  const saltRef = useRef(null);
  const fetchedRef = useRef(false);

  if (saltRef.current === null) {
    saltRef.current = getSessionSalt();
  }

  const load = useCallback(async () => {
    try {
      const { flags: next } = await listFlags();
      const list = Array.isArray(next) ? next : [];
      setFlags(list);
      writeCachedFlags(list);
    } catch {
      // Fail closed: keep whatever we had (possibly empty) — consumers get false.
    } finally {
      setIsReady(true);
    }
  }, []);

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    // Only fetch if the session cache was empty; otherwise trust the cache.
    if (readCachedFlags() === null) {
      load();
    }
  }, [load]);

  /** Force a re-fetch and refresh the session cache (post-admin-edit). */
  const refresh = useCallback(async () => {
    await load();
  }, [load]);

  const value = useMemo(
    () => ({ flags, isReady, refresh, salt: saltRef.current }),
    [flags, isReady, refresh]
  );

  return (
    <FeatureFlagContext.Provider value={value}>
      {children}
    </FeatureFlagContext.Provider>
  );
}

/**
 * Access the raw flag context — the flag list, readiness, and `refresh()`.
 * Prefer {@link useFeatureFlag} for the common "is X on?" question.
 *
 * @returns {{flags: FeatureFlag[], isReady: boolean, refresh: () => Promise<void>, salt: string}}
 */
export function useFeatureFlags() {
  return useContext(FeatureFlagContext);
}

/**
 * Consumer hook: is the flag with `key` on for this session? Returns a boolean
 * and fails closed (unknown key or provider not ready → `false`). Respects the
 * master switch and the stable per-session rollout bucket.
 *
 * @example
 * const canUseX = useFeatureFlag("new-checkout");
 * return canUseX ? <NewCheckout /> : <LegacyCheckout />;
 *
 * @param {string} key kebab-case flag identifier
 * @returns {boolean}
 */
export function useFeatureFlag(key) {
  const { flags, isReady, salt } = useContext(FeatureFlagContext);
  return useMemo(() => {
    if (!isReady || !key) return false;
    const flag = flags.find((f) => f.key === key);
    return resolveFlag(flag, salt);
  }, [flags, isReady, salt, key]);
}

export default FeatureFlagProvider;
