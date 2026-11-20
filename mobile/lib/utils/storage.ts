import * as SecureStore from "expo-secure-store";

/** Keys that must never survive logout, account deletion, or account switch. */
export const SENSITIVE_STORAGE_KEYS = [
  "auth_access_token",
  "auth_refresh_token",
  "user_profile_cache",
  "offline_mutation_queue",
] as const;

export async function secureGet(key: string): Promise<string | null> {
  return SecureStore.getItemAsync(key);
}

export async function secureSet(key: string, value: string): Promise<void> {
  await SecureStore.setItemAsync(key, value);
}

export async function secureRemove(key: string): Promise<void> {
  await SecureStore.deleteItemAsync(key);
}

export async function secureClear(keys: string[]): Promise<void> {
  await Promise.all(keys.map((key) => SecureStore.deleteItemAsync(key)));
}

export async function secureClearSensitiveData(): Promise<void> {
  await secureClear([...SENSITIVE_STORAGE_KEYS]);
}
