import axiosInstance from "@/lib/config/axios.config";

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

const INVITE_TIERS = new Set(["staff", "super_admin"]);

interface ApiErrorLike {
  message?: string;
  response?: { data?: { message?: string } };
}

function assertInviteResponse(data: unknown): asserts data is CreateInviteResult {
  const invite = (data as CreateInviteResult | undefined)?.invite;
  if (
    !invite ||
    typeof invite.token !== "string" ||
    invite.token.length < 32 ||
    typeof invite.url !== "string" ||
    !invite.url ||
    typeof invite.expiresAt !== "string" ||
    Number.isNaN(Date.parse(invite.expiresAt)) ||
    Date.parse(invite.expiresAt) <= Date.now()
  ) {
    throw new Error("The server returned an invalid admin invitation.");
  }
}

/**
 * Ask the authenticated backend to mint an invitation.
 *
 * The backend must authorize the actor and derive organization scope from the
 * session. It owns token generation, hashing, expiry, one-time redemption,
 * notification delivery, revocation, and audit records. The client deliberately
 * never constructs an invitation URL or accepts a role from the URL.
 */
export async function createInvite(options: CreateInviteOptions = {}): Promise<CreateInviteResult> {
  const tier = options.tier || "staff";
  if (!INVITE_TIERS.has(tier)) {
    throw new Error("Invalid admin invitation tier.");
  }

  try {
    const response = await axiosInstance.post("/api/admin/invitations", {
      email: options.email?.trim() || undefined,
      tier,
    });
    assertInviteResponse(response.data);
    return response.data;
  } catch (caught) {
    const error = caught as ApiErrorLike;
    throw new Error(
      error.response?.data?.message || error.message || "Could not create the admin invitation."
    );
  }
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
