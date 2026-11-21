/**
 * The client-side vocabulary for the stateful auth contracts.
 *
 * The API owns the truth. These states describe what the UI may claim after a
 * response has been received, not optimistic progress while a request is in
 * flight.
 */
export const AUTH_LIFECYCLE_STATES = Object.freeze({
  IDLE: "idle",
  PENDING_VERIFICATION: "pending_verification",
  VERIFIED: "verified",
  VERIFICATION_FAILED: "verification_failed",
  RESET_REQUESTED: "reset_requested",
  RESET_INVALID: "reset_invalid",
  RESET_EXPIRED: "reset_expired",
  RESET_COMPLETED: "reset_completed",
  TWO_FACTOR_REQUIRED: "two_factor_required",
  TWO_FACTOR_FAILED: "two_factor_failed",
  SESSION_ACTIVE: "session_active",
  SESSION_EXPIRED: "session_expired",
  SESSION_REVOKED: "session_revoked",
  SIGNED_OUT: "signed_out",
} as const);

export type AuthLifecycleState =
  (typeof AUTH_LIFECYCLE_STATES)[keyof typeof AUTH_LIFECYCLE_STATES];

export type AuthLifecycleEvent =
  | "verification_pending"
  | "verification_confirmed"
  | "verification_rejected"
  | "reset_requested"
  | "reset_rejected"
  | "reset_expired"
  | "reset_confirmed"
  | "two_factor_challenged"
  | "two_factor_rejected"
  | "session_confirmed"
  | "session_expired"
  | "session_revoked"
  | "signed_out";

const TRANSITIONS: Record<AuthLifecycleState, Partial<Record<AuthLifecycleEvent, AuthLifecycleState>>> = {
  idle: {
    verification_pending: "pending_verification",
    reset_requested: "reset_requested",
    two_factor_challenged: "two_factor_required",
    session_confirmed: "session_active",
    signed_out: "signed_out",
  },
  pending_verification: {
    verification_confirmed: "verified",
    verification_rejected: "verification_failed",
  },
  verified: { session_confirmed: "session_active", signed_out: "signed_out" },
  verification_failed: { verification_pending: "pending_verification" },
  reset_requested: {
    reset_confirmed: "reset_completed",
    reset_rejected: "reset_invalid",
    reset_expired: "reset_expired",
  },
  reset_invalid: { reset_requested: "reset_requested" },
  reset_expired: { reset_requested: "reset_requested" },
  reset_completed: { session_confirmed: "session_active", signed_out: "signed_out" },
  two_factor_required: {
    session_confirmed: "session_active",
    two_factor_rejected: "two_factor_failed",
  },
  two_factor_failed: { two_factor_challenged: "two_factor_required" },
  session_active: {
    session_expired: "session_expired",
    session_revoked: "session_revoked",
    signed_out: "signed_out",
  },
  session_expired: { session_confirmed: "session_active", signed_out: "signed_out" },
  session_revoked: { session_confirmed: "session_active", signed_out: "signed_out" },
  signed_out: { session_confirmed: "session_active" },
};

export function transitionAuthState(
  state: AuthLifecycleState,
  event: AuthLifecycleEvent
): AuthLifecycleState {
  return TRANSITIONS[state]?.[event] ?? state;
}

type ErrorLike = {
  response?: { status?: number; data?: { code?: unknown; message?: unknown } };
  code?: unknown;
};

function backendCode(error: unknown): string {
  if (!error || typeof error !== "object") return "";
  const value = error as ErrorLike;
  const code = value.response?.data?.code;
  return typeof code === "string" ? code.toUpperCase() : "";
}

export function sessionEndReason(error: unknown): "expired" | "revoked" {
  const code = backendCode(error);
  return code.includes("REVOK") || code.includes("INVALIDATED") ? "revoked" : "expired";
}

export function authRecoveryMessage(error: unknown, fallback: string): string {
  const code = backendCode(error);
  if (code.includes("EXPIRED") || code.includes("USED")) {
    return "This link has expired or was already used. Request a new link to continue.";
  }
  if (code.includes("INVALID") || code.includes("MALFORMED") || code.includes("TOKEN")) {
    return "This link is no longer valid. Request a new link and try again.";
  }
  return fallback;
}
