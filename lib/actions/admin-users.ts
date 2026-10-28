import { logAuditEvent, AUDIT_ACTIONS } from "@/lib/admin/audit";
import axiosInstance from "@/lib/config/axios.config";
import { updateUser } from "@/lib/actions/users/updateUser";

export interface ModerationContext {
  reason?: string;
  email?: string;
}

/** The slice of an Axios error these actions read the server message from. */
interface ApiErrorLike {
  message?: string;
  response?: { data?: { message?: string } };
}

// TODO(backend): endpoints below are assumed; confirm paths/payloads with the API.
async function postModeration(
  userId: string,
  action: "suspend" | "ban" | "reinstate",
  body: Record<string, unknown>
) {
  try {
    const res = await axiosInstance.post(`/api/admin/users/${userId}/${action}`, body);
    if (res.data?.success === false) throw new Error(res.data?.message);
    return res.data;
  } catch (caught) {
    const e = caught as ApiErrorLike;
    throw new Error(e?.response?.data?.message || e?.message || `Could not ${action} this user.`);
  }
}

/** durationDays: positive number of days, or null for indefinite. */
export async function suspendUser(
  userId: string,
  durationDays: number | null,
  context: ModerationContext = {}
) {
  const data = await postModeration(userId, "suspend", {
    durationDays,
    reason: context.reason || undefined,
  });
  logAuditEvent({
    action: AUDIT_ACTIONS.SUSPEND,
    target: {
      label: context.email || userId,
      id: userId,
      href: `/dashboard/admin/users/${userId}`,
    },
    metadata: { durationDays, reason: context.reason || null },
  });
  return data;
}

export async function banUser(userId: string, context: ModerationContext = {}) {
  if (!context.reason?.trim()) throw new Error("A reason is required to ban a user.");
  const data = await postModeration(userId, "ban", { reason: context.reason.trim() });
  logAuditEvent({
    action: AUDIT_ACTIONS.BAN,
    target: {
      label: context.email || userId,
      id: userId,
      href: `/dashboard/admin/users/${userId}`,
    },
    metadata: { reason: context.reason.trim() },
  });
  return data;
}

/** Server resets the user to their previous role. */
export async function reinstateUser(userId: string, context: ModerationContext = {}) {
  const data = await postModeration(userId, "reinstate", { reason: context.reason || undefined });
  logAuditEvent({
    action: AUDIT_ACTIONS.UNBAN,
    target: {
      label: context.email || userId,
      id: userId,
      href: `/dashboard/admin/users/${userId}`,
    },
    metadata: { reason: context.reason || null },
  });
  return data;
}

export type AdminUserRole = "student" | "mentor" | "admin";

export async function changeUserRole(
  userId: string,
  role: AdminUserRole,
  context: { email: string; previousRole: string; reason?: string }
): Promise<{ user: { id: string; role: AdminUserRole } }> {
  const response = await updateUser(userId, {
    role,
    roleChangeReason: context.reason?.trim() || undefined,
  });

  if (!response || response.success === false) {
    throw new Error(response?.message || "The user's role could not be changed.");
  }

  const savedRole = response.user?.role || response.role || role;
  if (savedRole !== role) {
    throw new Error("The server did not confirm the requested role.");
  }

  logAuditEvent({
    action: AUDIT_ACTIONS.ROLE_CHANGE,
    target: {
      label: context.email || userId,
      id: userId,
      href: `/dashboard/admin/users/${userId}`,
    },
    metadata: {
      previousRole: context.previousRole,
      role,
      reason: context.reason?.trim() || null,
    },
    summary: `Changed ${context.email || userId} from ${context.previousRole} to ${role}.`,
  });

  return { user: { id: userId, role: savedRole } };
}

/*
 * Account security actions (issue #229).
 *
 * TODO(backend): BOTH endpoints below may not exist yet. Expected contract:
 *
 * 1) PUT /api/admin/users/:userId/password-reset-requirement
 *    request:  { required: boolean, reason?: string }
 *    response: { success: true, requirePasswordReset: boolean }
 *    Semantics: when required is true, the user's next login must complete
 *    the password reset flow before a session is issued.
 *
 * 2) POST /api/admin/users/:userId/sessions/revoke
 *    request:  { reason?: string }
 *    response: { success: true, revokedCount: number }
 *    Semantics: server-side revocation of every refresh token for the user.
 *    Existing access tokens are not individually tracked and expire on their own.
 *
 * Errors: non-2xx or { success: false, message } is surfaced to the caller.
 */
async function requestSecurityAction<T>(
  userId: string,
  request: () => Promise<{ data: T & { success?: boolean; message?: string } }>,
  fallbackMessage: string
): Promise<T> {
  try {
    const res = await request();
    if (res.data?.success === false) throw new Error(res.data?.message || fallbackMessage);
    return res.data;
  } catch (caught) {
    const e = caught as ApiErrorLike;
    throw new Error(e?.response?.data?.message || e?.message || fallbackMessage);
  }
}

export interface SecurityActionContext {
  email?: string;
  reason?: string;
}

/** TODO(backend): see contract above. Forces the reset flow on the next login. */
export async function setRequirePasswordReset(
  userId: string,
  required: boolean,
  context: SecurityActionContext = {}
): Promise<{ success: true; requirePasswordReset: boolean }> {
  const data = await requestSecurityAction<{ requirePasswordReset: boolean }>(
    userId,
    () =>
      axiosInstance.put(`/api/admin/users/${userId}/password-reset-requirement`, {
        required,
        reason: context.reason || undefined,
      }),
    "The password reset requirement could not be updated."
  );
  const saved = data.requirePasswordReset;
  if (saved !== required)
    throw new Error("The server did not confirm the password reset requirement.");
  logAuditEvent({
    action: AUDIT_ACTIONS.PASSWORD_RESET_REQUIRED,
    target: {
      label: context.email || userId,
      id: userId,
      href: `/dashboard/admin/users/${userId}`,
    },
    metadata: { required },
  });
  return { success: true, requirePasswordReset: saved };
}

/** TODO(backend): see contract above. Revokes all refresh tokens server-side. */
export async function revokeAllSessions(
  userId: string,
  context: SecurityActionContext = {}
): Promise<{ success: true; revokedCount: number }> {
  const data = await requestSecurityAction<{ revokedCount?: number }>(
    userId,
    () =>
      axiosInstance.post(`/api/admin/users/${userId}/sessions/revoke`, {
        reason: context.reason || undefined,
      }),
    "The user's sessions could not be signed out."
  );
  const revokedCount = Number(data.revokedCount ?? 0);
  logAuditEvent({
    action: AUDIT_ACTIONS.SESSIONS_REVOKED,
    target: {
      label: context.email || userId,
      id: userId,
      href: `/dashboard/admin/users/${userId}`,
    },
    metadata: { revokedCount },
  });
  return { success: true, revokedCount };
}
