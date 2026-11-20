const PREFIX = "dnb:learning:v1:";

export const LEARNING_RETENTION_MS = {
  courseProgress: 90 * 24 * 60 * 60 * 1000,
  bookProgress: 90 * 24 * 60 * 60 * 1000,
  courseDraft: 7 * 24 * 60 * 60 * 1000,
} as const;

type LearningKind = keyof typeof LEARNING_RETENTION_MS;

interface StoredLearningValue<T> {
  value: T;
  savedAt: number;
  expiresAt: number;
}

function hasStorage(): boolean {
  return typeof window !== "undefined" && !!window.localStorage;
}

function encode(value: string | number): string {
  return encodeURIComponent(String(value));
}

export function learningStorageKey(
  kind: LearningKind,
  userId: string | number,
  resourceId: string | number = "account",
): string {
  return `${PREFIX}${kind}:${encode(userId)}:${encode(resourceId)}`;
}

export function readLearningValue<T>(
  key: string,
  now: number = Date.now(),
): T | null {
  if (!hasStorage()) return null;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    const stored = JSON.parse(raw) as StoredLearningValue<T>;
    if (!stored || typeof stored.expiresAt !== "number" || stored.expiresAt <= now) {
      window.localStorage.removeItem(key);
      return null;
    }
    return stored.value;
  } catch {
    return null;
  }
}

export function writeLearningValue<T>(
  key: string,
  value: T,
  retentionMs: number,
  now: number = Date.now(),
): boolean {
  if (!hasStorage()) return false;
  try {
    const stored: StoredLearningValue<T> = {
      value,
      savedAt: now,
      expiresAt: now + retentionMs,
    };
    window.localStorage.setItem(key, JSON.stringify(stored));
    return true;
  } catch {
    // Authoritative state remains on the backend when browser storage is full.
    return false;
  }
}

export function removeLearningValue(key: string): boolean {
  if (!hasStorage()) return false;
  try {
    window.localStorage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}

/** Clear all client-side learning data on logout/account handoff. */
export function clearClientLearningData(): void {
  if (!hasStorage()) return;
  try {
    const keys = [] as string[];
    for (let index = 0; index < window.localStorage.length; index += 1) {
      const key = window.localStorage.key(index);
      if (key?.startsWith(PREFIX)) keys.push(key);
      // Remove pre-policy keys so data created by older builds cannot leak on a shared device.
      if (
        key?.startsWith("dnb:progress:") ||
        key?.startsWith("dnb:book-progress:") ||
        key?.startsWith("dnb_course_draft_")
      ) keys.push(key);
    }
    keys.forEach((key) => window.localStorage.removeItem(key));
  } catch {
    // Storage may be disabled; logout must still complete.
  }
}
