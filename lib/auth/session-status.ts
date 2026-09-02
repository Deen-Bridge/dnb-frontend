import Cookies from "js-cookie";

export const SESSION_END_REASONS = Object.freeze({
  SESSION_EXPIRED: "expired",
  SESSION_REVOKED: "revoked",
  SESSION_IDLE: "idle",
} as const);

export type SessionEndReason = typeof SESSION_END_REASONS[keyof typeof SESSION_END_REASONS];

export const SESSION_EXPIRED = SESSION_END_REASONS.SESSION_EXPIRED;
export const SESSION_REVOKED = SESSION_END_REASONS.SESSION_REVOKED;
export const SESSION_IDLE = SESSION_END_REASONS.SESSION_IDLE;

export interface ReasonCopy {
  title: string;
  message: string;
  variant: "default" | "destructive";
}

const REASON_COPY: Record<SessionEndReason, ReasonCopy> = Object.freeze({
  [SESSION_END_REASONS.SESSION_EXPIRED]: Object.freeze({
    title: "Your session expired",
    message: "For your security, please sign in again to continue.",
    variant: "default" as const,
  }),
  [SESSION_END_REASONS.SESSION_REVOKED]: Object.freeze({
    title: "Your session was revoked",
    message:
      "This session was signed out from another device or by an administrator. Sign in again if this was you.",
    variant: "destructive" as const,
  }),
  [SESSION_END_REASONS.SESSION_IDLE]: Object.freeze({
    title: "Signed out for inactivity",
    message:
      "You were signed out after a period of inactivity to protect your account. Please sign in again.",
    variant: "default" as const,
  }),
});

export function normalizeReason(reason: unknown): SessionEndReason | null {
  if (typeof reason !== "string") return null;
  const r = reason.trim().toLowerCase();
  const values: string[] = Object.values(SESSION_END_REASONS);
  return values.includes(r) ? (r as SessionEndReason) : null;
}

export function reasonMessage(reason: unknown): ReasonCopy | null {
  const key = normalizeReason(reason);
  return key ? REASON_COPY[key] : null;
}

export function loginUrlWithReason(reason: string): string {
  const key = normalizeReason(reason);
  return key ? `/login?reason=${key}` : "/login";
}

export function decodeJwt(token: unknown): Record<string, any> | null { // TODO(types): Decoded arbitrary JWT claims dictionary
  if (typeof token !== "string") return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  try {
    let base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    while (base64.length % 4) base64 += "=";
    const json =
      typeof atob === "function"
        ? atob(base64)
        : Buffer.from(base64, "base64").toString("binary");
    const decoded = decodeURIComponent(
      Array.prototype.map
        .call(json, (c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

function readToken(): string | null {
  try {
    return Cookies.get("authToken") || null;
  } catch {
    return null;
  }
}

let lastReauthAt: number | null = null;

export function markReauthenticated(at: number = Date.now()): void {
  lastReauthAt = typeof at === "number" && Number.isFinite(at) ? at : Date.now();
}

export function clearReauthMarker(): void {
  lastReauthAt = null;
}

export function getSessionStartedAt(token?: string | null): number | null {
  const claims = decodeJwt(token ?? readToken());
  const iatMs =
    claims && typeof claims.iat === "number" ? claims.iat * 1000 : null;
  if (iatMs == null && lastReauthAt == null) return null;
  return Math.max(iatMs ?? 0, lastReauthAt ?? 0) || null;
}

export function getSessionAgeMs(token?: string | null): number | null {
  const startedAt = getSessionStartedAt(token);
  if (startedAt == null) return null;
  return Math.max(0, Date.now() - startedAt);
}

export function isSessionFresh(maxAgeMinutes: number | string, token?: string | null): boolean {
  const ageMs = getSessionAgeMs(token);
  if (ageMs == null) return true;
  const maxMs = Math.max(0, Number(maxAgeMinutes) || 0) * 60_000;
  return ageMs <= maxMs;
}
