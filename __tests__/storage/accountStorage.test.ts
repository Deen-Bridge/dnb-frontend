import { accountStorageKey, getAccountValue, setAccountValue } from "@/lib/storage/accountStorage";

describe("account-scoped storage", () => {
  it("namespaces by account and expires values", () => {
    const storage = new Map<string, string>();
    const fake = {
      setItem: (key: string, value: string) => storage.set(key, value),
      getItem: (key: string) => storage.get(key) ?? null,
      removeItem: (key: string) => storage.delete(key),
    } as Storage;
    const alice = accountStorageKey("draft", "alice", "course");
    const bob = accountStorageKey("draft", "bob", "course");
    expect(alice).not.toBe(bob);
    expect(setAccountValue(fake, alice, { title: "private" }, 60_000)).toBe(true);
    expect(getAccountValue(fake, alice)).toEqual({ title: "private" });
    expect(getAccountValue(fake, bob)).toBeNull();
  });

  it("drops corrupted and expired envelopes", () => {
    const storage = new Map<string, string>();
    const fake = {
      setItem: (key: string, value: string) => storage.set(key, value),
      getItem: (key: string) => storage.get(key) ?? null,
      removeItem: (key: string) => storage.delete(key),
    } as Storage;
    storage.set("bad", "not-json");
    expect(getAccountValue(fake, "bad")).toBeNull();
    expect(setAccountValue(fake, "old", "value", -1)).toBe(true);
    expect(getAccountValue(fake, "old")).toBeNull();
  });
});
