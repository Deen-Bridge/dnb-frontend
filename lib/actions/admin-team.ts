const MOCK_DELAY_MS = 400;

function withMockDelay<T>(value: T): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), MOCK_DELAY_MS));
}

export interface AdminMember {
  id: string;
  name: string;
  email: string;
  tier: "staff" | "super_admin";
  lastActiveAt: string;
  addedBy: { id: string; name: string } | null;
}

export async function listAdmins(): Promise<{ admins: AdminMember[] }> {
  const now = Date.now();
  return withMockDelay({
    admins: [
      {
        id: "admin-001",
        name: "Amina Yusuf",
        email: "amina@deenbridge.org",
        tier: "super_admin",
        lastActiveAt: new Date(now - 2 * 60 * 60 * 1000).toISOString(),
        addedBy: null,
      },
      {
        id: "admin-002",
        name: "Bilal Karim",
        email: "bilal@deenbridge.org",
        tier: "staff",
        lastActiveAt: new Date(now - 26 * 60 * 60 * 1000).toISOString(),
        addedBy: { id: "admin-001", name: "Amina Yusuf" },
      },
      {
        id: "admin-003",
        name: "Zaynab Idris",
        email: "zaynab@deenbridge.org",
        tier: "staff",
        lastActiveAt: new Date(now - 6 * 24 * 60 * 60 * 1000).toISOString(),
        addedBy: { id: "admin-001", name: "Amina Yusuf" },
      },
    ],
  });
}

export interface CreateInviteOptions {
  email?: string;
  tier?: "staff" | "super_admin";
}

export interface CreateInviteResult {
  invite: {
    token: string;
    url: string;
    expiresAt: string;
  };
}

export async function createInvite(options: CreateInviteOptions = {}): Promise<CreateInviteResult> {
  const token = "inv_mock_".concat(
    Math.random().toString(36).slice(2, 10),
    Math.random().toString(36).slice(2, 10)
  );
  return withMockDelay({
    invite: {
      token,
      url: `${typeof window !== "undefined" ? window.location.origin : ""}/register/invite?token=${token}&tier=${options.tier || "staff"}`,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    },
  });
}

export interface DemoteContext {
  confirmation?: string;
}

export async function demoteAdmin(adminId: string, context: DemoteContext = {}): Promise<{ admin: { id: string; tier: "staff"; confirmation?: string } }> {
  return withMockDelay({ admin: { id: adminId, tier: "staff", confirmation: context.confirmation } });
}

export interface RevokeContext {
  confirmation?: string;
}

export async function revokeAdmin(adminId: string, context: RevokeContext = {}): Promise<{ revoked: boolean; adminId: string }> {
  void context;
  return withMockDelay({ revoked: true, adminId });
}
