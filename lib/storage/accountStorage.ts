const STORAGE_VERSION = 1;

type StoredValue<T> = { version: number; expiresAt: number; value: T };

export function accountStorageKey(namespace: string, accountId: string | null, suffix = "") {
  const owner = accountId ? encodeURIComponent(accountId) : "anonymous";
  return `dnb:v${STORAGE_VERSION}:${namespace}:${owner}${suffix ? `:${suffix}` : ""}`;
}

export function setAccountValue<T>(storage: Storage, key: string, value: T, ttlMs: number): boolean {
  try {
    const entry: StoredValue<T> = { version: STORAGE_VERSION, expiresAt: Date.now() + ttlMs, value };
    storage.setItem(key, JSON.stringify(entry));
    return true;
  } catch {
    return false;
  }
}

export function getAccountValue<T>(storage: Storage, key: string): T | null {
  try {
    const raw = storage.getItem(key);
    if (!raw) return null;
    const entry = JSON.parse(raw) as StoredValue<T>;
    if (entry.version !== STORAGE_VERSION || !Number.isFinite(entry.expiresAt) || entry.expiresAt <= Date.now()) {
      storage.removeItem(key);
      return null;
    }
    return entry.value;
  } catch {
    try { storage.removeItem(key); } catch { /* storage may be unavailable */ }
    return null;
  }
}
