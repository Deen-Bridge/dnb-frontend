import Constants from "expo-constants";
import { compareVersions } from "./versions";
export { compareVersions } from "./versions";

export type UpgradeRequirement = { minimumVersion: string; storeUrl?: string; reason?: "minimum-version" | "runtime-incompatible" };
type Listener = (requirement: UpgradeRequirement | null) => void;
const listeners = new Set<Listener>();
let requirement: UpgradeRequirement | null = null;

export function currentVersion(): string { return Constants.expoConfig?.version ?? "0.0.0"; }
export function isMinimumVersionSatisfied(minimumVersion: string): boolean { return compareVersions(currentVersion(), minimumVersion) >= 0; }

export function publishUpgradeRequirement(next: UpgradeRequirement | null): void {
  requirement = next && !isMinimumVersionSatisfied(next.minimumVersion) ? next : null;
  listeners.forEach((listener) => listener(requirement));
}

export function subscribeUpgradeRequirement(listener: Listener): () => void { listeners.add(listener); listener(requirement); return () => listeners.delete(listener); }

export function readUpgradeRequirement(error: { response?: { status?: number; data?: unknown } }): UpgradeRequirement | null {
  const data = error.response?.data;
  if (error.response?.status !== 426 || !data || typeof data !== "object") return null;
  const body = data as Record<string, unknown>;
  if (typeof body.minimumVersion !== "string") return null;
  return { minimumVersion: body.minimumVersion, storeUrl: typeof body.storeUrl === "string" ? body.storeUrl : undefined, reason: body.reason === "runtime-incompatible" ? body.reason : "minimum-version" };
}
