import { logAuditEvent, AUDIT_ACTIONS } from "@/lib/admin/audit";
import { updateUser } from "@/lib/actions/users/updateUser";

const MOCK_DELAY_MS = 300;

function withMockDelay<T>(value: T): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), MOCK_DELAY_MS));
}

export interface BanUserContext {
  reason?: string;
  email?: string;
}

export interface BanUserResult {
  user: {
    id: string;
    status: "banned";
  };
}

export async function banUser(userId: string, context: BanUserContext = {}): Promise<BanUserResult> {
  const result = await withMockDelay<BanUserResult>({ user: { id: userId, status: "banned" } });

  logAuditEvent({
    action: AUDIT_ACTIONS.BAN,
    target: {
      label: context.email || userId,
      id: userId,
      href: `/dashboard/admin/users/${userId}`,
    },
    metadata: { reason: context.reason || null },
  });

  return result;
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
