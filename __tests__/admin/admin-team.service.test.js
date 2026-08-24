/**
 * Admin-team service — audit/step-up evidence contract tests (#340).
 * ------------------------------------------------------------------
 * The service in `lib/actions/admin-team.js` is the seam the admin surfaces
 * call for listing/inviting and for the demote/revoke mutations that carry the
 * step-up confirmation forward as audit evidence. These tests pin the resolved
 * shapes the UI depends on and, crucially, that the `confirmation` phrase is
 * forwarded verbatim on the sensitive mutations.
 */
import { describe, it, expect } from "vitest";
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
  it("mints an invite with a token, link and expiry", async () => {
    const { invite } = await createInvite({ tier: "staff" });
    expect(invite.token).toMatch(/^inv_mock_/);
    expect(invite.url).toContain(invite.token);
    expect(invite.url).toContain("tier=staff");
    expect(Number.isNaN(new Date(invite.expiresAt).getTime())).toBe(false);
  });

  it("defaults the tier in the link when none is provided", async () => {
    const { invite } = await createInvite();
    expect(invite.url).toContain("tier=staff");
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
