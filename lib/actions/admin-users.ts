import { logAuditEvent, AUDIT_ACTIONS } from "@/lib/admin/audit";

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
