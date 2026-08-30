/**
 * useAdminTeam — admin-team data + mutation hook tests (#340).
 * -----------------------------------------------------------
 * Drives the hook that backs the member table: initial load, and the
 * demote/revoke mutations that update the local list in place. The failure
 * paths assert the list is left intact when a mutation rejects (no partial /
 * corrupted state) — the rollback guarantee the UI relies on.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";

vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const authMock = vi.hoisted(() => ({
  user: { id: "me", role: "admin", tier: "super_admin" },
}));

// Authenticated super-admin so the hook's fail-closed guard lets it fetch.
// The user object must be a stable reference: the hook's load effect keys off
// `user`, so a fresh object every render would re-trigger the effect (and
// consume a one-shot reject / overwrite an optimistic update).
const authMock = vi.hoisted(() => ({
  user: { id: "me", role: "admin", tier: "super_admin" },
}));
vi.mock("@/hooks/useAuth", () => ({
  default: () => ({ user: authMock.user, loading: false }),
  useAuth: () => ({ user: authMock.user, loading: false }),
}));

vi.mock("@/lib/auth/admin-tiers", () => ({
  canManageTeam: () => true,
}));

vi.mock("@/lib/admin/audit", () => ({
  AUDIT_ACTIONS: {
    ROLE_DEMOTE: "role.demote",
    ROLE_REVOKE: "role.revoke",
  },
  logAuditEvent: vi.fn(),
}));

vi.mock("@/lib/utils/admin-toast", () => ({
  adminToastSuccess: vi.fn(),
}));

const mocks = vi.hoisted(() => ({
  listAdmins: vi.fn(),
  createInvite: vi.fn(),
  demoteAdmin: vi.fn(),
  revokeAdmin: vi.fn(),
}));

vi.mock("@/lib/actions/admin-team", () => ({
  listAdmins: mocks.listAdmins,
  createInvite: mocks.createInvite,
  demoteAdmin: mocks.demoteAdmin,
  revokeAdmin: mocks.revokeAdmin,
}));

import useAdminTeam from "@/hooks/useAdminTeam";

const SUPER = { id: "a1", name: "Amina", email: "amina@x.org", tier: "super_admin" };
const STAFF = { id: "a2", name: "Bilal", email: "bilal@x.org", tier: "staff" };

beforeEach(() => {
  vi.clearAllMocks();
  mocks.listAdmins.mockResolvedValue({ admins: [{ ...SUPER }, { ...STAFF }] });
});

async function mountLoaded() {
  const view = renderHook(() => useAdminTeam());
  await waitFor(() => expect(view.result.current.isLoading).toBe(false));
  return view;
}

describe("useAdminTeam — load", () => {
  it("loads the member list and clears the loading flag", async () => {
    const { result } = await mountLoaded();
    expect(result.current.admins).toHaveLength(2);
    expect(result.current.error).toBeNull();
  });

  it("surfaces a message when the list fails to load", async () => {
    mocks.listAdmins.mockRejectedValue(new Error("network down"));
    const { result } = renderHook(() => useAdminTeam());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.error).toBe("network down");
  });
});

describe("useAdminTeam — demote", () => {
  it("updates the member's tier to staff on success", async () => {
    mocks.demoteAdmin.mockResolvedValue({ admin: { id: "a1", tier: "staff" } });
    const { result } = await mountLoaded();

    await result.current.demoteMember("a1", { confirmation: "amina@x.org" });

    expect(mocks.demoteAdmin).toHaveBeenCalledWith("a1", { confirmation: "amina@x.org" });
    await waitFor(() =>
      expect(result.current.admins.find((m) => m.id === "a1").tier).toBe("staff")
    );
  });

  it("leaves the list unchanged when the demote rejects (rollback)", async () => {
    mocks.demoteAdmin.mockRejectedValueOnce(new Error("403"));
    const { result } = await mountLoaded();

    await act(async () => {
      await expect(result.current.demoteMember("a1")).rejects.toThrow("403");
    });

    // The optimistic list must not be mutated on failure.
    expect(result.current.admins.find((m) => m.id === "a1").tier).toBe("super_admin");
    expect(result.current.admins).toHaveLength(2);
  });
});

describe("useAdminTeam — revoke", () => {
  it("removes the member from the list on success", async () => {
    mocks.revokeAdmin.mockResolvedValue({ revoked: true, adminId: "a2" });
    const { result } = await mountLoaded();

    await result.current.revokeMember("a2", { confirmation: "bilal@x.org" });

    await waitFor(() => expect(result.current.admins.some((m) => m.id === "a2")).toBe(false));
    await waitFor(() => expect(result.current.admins).toHaveLength(1));
  });

  it("keeps the member when the revoke rejects (rollback)", async () => {
    mocks.revokeAdmin.mockRejectedValueOnce(new Error("boom"));
    const { result } = await mountLoaded();

    await act(async () => {
      await expect(result.current.revokeMember("a2")).rejects.toThrow("boom");
    });

    expect(result.current.admins.some((m) => m.id === "a2")).toBe(true);
    expect(result.current.admins).toHaveLength(2);
  });
});

describe("useAdminTeam — invite", () => {
  it("returns the minted invite from the service", async () => {
    mocks.createInvite.mockResolvedValueOnce({ invite: { token: "inv_mock_x", url: "u", expiresAt: "e" } });
    const { result } = await mountLoaded();

    let invite;
    await act(async () => {
      invite = await result.current.inviteAdmin({ tier: "staff" });
    });

    expect(invite.token).toBe("inv_mock_x");
  });
});
