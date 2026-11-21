/**
 * Admin-team service — audit/step-up evidence contract tests (#340, #711).
 * ------------------------------------------------------------------
 * The service in `lib/actions/admin-team.js` is the seam the admin surfaces
 * call for listing/inviting and for the demote/revoke mutations that carry the
 * step-up confirmation forward as audit evidence. Invitation minting is owned
 * by the authenticated backend; the frontend only forwards the requested
 * scope and validates the returned opaque link.
 */
import { beforeEach, describe, it, expect, vi } from "vitest";

const axiosInstance = vi.hoisted(() => ({ post: vi.fn() }));
vi.mock("@/lib/config/axios.config", () => ({ default: axiosInstance }));

beforeEach(() => {
  vi.clearAllMocks();
});

import {
  listAdmins,
  createInvite,
  demoteAdmin,
  revokeAdmin,
} from "@/lib/actions/admin-team";

const TIERS = new Set(["staff", "super_admin"]);

describe("listAdmins", () => {
  it("resolves a list of members with the documented shape", async () => {
    const { admins } = await listAdmins();
    expect(Array.isArray(admins)).toBe(true);
    expect(admins.length).toBeGreaterThan(0);
    for (const member of admins) {
      expect(typeof member.id).toBe("string");
      expect(typeof member.email).toBe("string");
      expect(TIERS.has(member.tier)).toBe(true);
    }
  });

  it("includes at least one super_admin", async () => {
    const { admins } = await listAdmins();
    expect(admins.some((m) => m.tier === "super_admin")).toBe(true);
  });
});

describe("createInvite", () => {
  it("delegates minting to the authenticated server", async () => {
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();
    axiosInstance.post.mockResolvedValueOnce({
      data: { invite: { token: "a".repeat(48), url: "https://app.test/register/invite?token=opaque", expiresAt } },
    });

    const result = await createInvite({ email: " teammate@example.com ", tier: "staff" });

    expect(axiosInstance.post).toHaveBeenCalledWith("/api/admin/invitations", {
      email: "teammate@example.com",
      tier: "staff",
    });
    expect(result.invite.url).toContain("opaque");
  });

  it("defaults the requested tier without constructing a client-side link", async () => {
    axiosInstance.post.mockResolvedValueOnce({
      data: { invite: { token: "b".repeat(48), url: "https://app.test/invite", expiresAt: new Date(Date.now() + 1000).toISOString() } },
    });

    await createInvite();

    expect(axiosInstance.post).toHaveBeenCalledWith("/api/admin/invitations", {
      email: undefined,
      tier: "staff",
    });
    expect(axiosInstance.post.mock.calls.at(-1)[1].tier).toBe("staff");
  });

  it("rejects an invalid tier before making a request", async () => {
    await expect(createInvite({ tier: "owner" })).rejects.toThrow("Invalid admin invitation tier");
    expect(axiosInstance.post).not.toHaveBeenCalled();
  });

  it("rejects malformed or expired server responses", async () => {
    axiosInstance.post.mockResolvedValueOnce({
      data: { invite: { token: "short", url: "https://app.test/invite", expiresAt: new Date(Date.now() - 1000).toISOString() } },
    });

    await expect(createInvite()).rejects.toThrow("invalid admin invitation");
  });
});

describe("demoteAdmin", () => {
  it("resolves the demoted tier and forwards the confirmation evidence", async () => {
    const { admin } = await demoteAdmin("admin-002", { confirmation: "bilal@deenbridge.org" });
    expect(admin.id).toBe("admin-002");
    expect(admin.tier).toBe("staff");
    expect(admin.confirmation).toBe("bilal@deenbridge.org");
  });
});

describe("revokeAdmin", () => {
  it("resolves a revoked acknowledgement for the target id", async () => {
    const result = await revokeAdmin("admin-003", { confirmation: "zaynab@deenbridge.org" });
    expect(result.revoked).toBe(true);
    expect(result.adminId).toBe("admin-003");
  });
});
