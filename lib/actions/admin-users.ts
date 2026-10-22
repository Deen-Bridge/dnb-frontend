import { logAuditEvent, AUDIT_ACTIONS } from "@/lib/admin/audit";
import axiosInstance from "@/lib/config/axios.config";
import { updateUser } from "@/lib/actions/users/updateUser";

export interface ModerationContext {
  reason?: string;
  email?: string;
}

// TODO(backend): endpoints below are assumed; confirm paths/payloads with the API.
async function postModeration(userId: string, action: "suspend" | "ban" | "reinstate", body: Record<string, unknown>) {
  try {
    const res = await axiosInstance.post(`/api/admin/users/${userId}/${action}`, body);
    if (res.data?.success === false) throw new Error(res.data?.message);
    return res.data;
  } catch (e: any) {
    throw new Error(e?.response?.data?.message || e?.message || `Could not ${action} this user.`);
  }
}

/** durationDays: positive number of days, or null for indefinite. */
export async function suspendUser(userId: string, durationDays: number | null, context: ModerationContext = {}) {
  const data = await postModeration(userId, "suspend", { durationDays, reason: context.reason || undefined });
  logAuditEvent({
    action: AUDIT_ACTIONS.SUSPEND,
    target: { label: context.email || userId, id: userId, href: `/dashboard/admin/users/${userId}` },
    metadata: { durationDays, reason: context.reason || null },
  });
  return data;
}

export async function banUser(userId: string, context: ModerationContext = {}) {
  if (!context.reason?.trim()) throw new Error("A reason is required to ban a user.");
  const data = await postModeration(userId, "ban", { reason: context.reason.trim() });
  logAuditEvent({
    action: AUDIT_ACTIONS.BAN,
    target: { label: context.email || userId, id: userId, href: `/dashboard/admin/users/${userId}` },
    metadata: { reason: context.reason.trim() },
  });
  return data;
}

/** Server resets the user to their previous role. */
export async function reinstateUser(userId: string, context: ModerationContext = {}) {
  const data = await postModeration(userId, "reinstate", { reason: context.reason || undefined });
  logAuditEvent({
    action: AUDIT_ACTIONS.UNBAN,
    target: { label: context.email || userId, id: userId, href: `/dashboard/admin/users/${userId}` },
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
