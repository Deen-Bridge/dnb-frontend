import * as SecureStore from "expo-secure-store";

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
