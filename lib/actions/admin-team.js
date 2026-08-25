/**
 * Admin team service — list members, invite, demote, revoke.
 * ---------------------------------------------------------------------------
 * **STUBBED.** Every function in this module currently resolves with mocked
 * data so the admin-team page (#315) can be built and reviewed before the
 * backend endpoints exist. Each function documents the expected contract it
 * will implement — swap the mock bodies for `axiosInstance` calls (see
 * `lib/config/axios.config.js`) when the backend lands.
 *
 * Member shape owned by the backend:
 *
 *   {
 *     id: string,
 *     name: string,
 *     email: string,
 *     tier: "staff" | "super_admin",   // see lib/auth/admin-tiers.js TIERS
 *     lastActiveAt: string,            // ISO 8601 timestamp
 *     addedBy: { id: string, name: string } | null,
 *   }
 */

const MOCK_DELAY_MS = 400;

function withMockDelay(value) {
  return new Promise((resolve) => setTimeout(() => resolve(value), MOCK_DELAY_MS));
}

/**
 * List every member of the admin team.
 *
 * TODO(backend): GET /api/admin/team
 *   - Auth: requires a super-admin session token (server-side tier check).
 *   - 200 → { admins: Member[] } using the member shape above.
 *   - 403 for staff admins / non-admins.
 *
 * @returns {Promise<{admins: Array<{id: string, name: string, email: string, tier: ("staff"|"super_admin"), lastActiveAt: string, addedBy: {id: string, name: string}|null}>}>}
 */
export async function listAdmins() {
  // TODO(backend): return axiosInstance.get("/api/admin/team").then((res) => res.data);
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

/**
 * Create an admin invite. The backend mints a single-use token; the client
 * composes and displays the shareable link.
 *
 * TODO(backend): POST /api/admin/team/invites
 *   - Auth: super-admin only.
 *   - Payload: { email?: string, tier: "staff" | "super_admin" }
 *     (`email` optional — the invite link can be shared directly).
 *   - 201 → { invite: { token: string, url: string, expiresAt: string } }
 *   - The token is single-use, expires server-side, and records the inviting
 *     admin as `addedBy` on acceptance.
 *
 * @param {{email?: string, tier: ("staff"|"super_admin")}} [options]
 * @returns {Promise<{invite: {token: string, url: string, expiresAt: string}}>}
 */
export async function createInvite(options = {}) {
  // TODO(backend):
  //   return axiosInstance
  //     .post("/api/admin/team/invites", options)
  //     .then((res) => res.data);
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

/**
 * Demote an admin from super_admin to staff.
 *
 * TODO(backend): PATCH /api/admin/team/:id/demote
 *   - Auth: super-admin only; the acting super-admin is recorded in an audit
 *     trail alongside the step-up confirmation evidence (#311).
 *   - Payload: { confirmation: string } — the type-to-confirm phrase the actor
 *     entered, forwarded verbatim for server-side verification/logging.
 *   - 200 → { admin: Member } with the updated `tier`.
 *   - 403 if the target is the acting super-admin themselves or the actor is
 *     not a super-admin.
 *
 * @param {string} adminId
 * @param {{confirmation: string}} [context]
 * @returns {Promise<{admin: {id: string, tier: "staff"}}>}
 */
export async function demoteAdmin(adminId, context = {}) {
  // TODO(backend):
  //   return axiosInstance
  //     .patch(`/api/admin/team/${adminId}/demote`, context)
  //     .then((res) => res.data);
  return withMockDelay({ admin: { id: adminId, tier: "staff", confirmation: context.confirmation } });
}

/**
 * Revoke an admin's access entirely (remove the admin role).
 *
 * TODO(backend): DELETE /api/admin/team/:id
 *   - Auth: super-admin only; audit-trailed like demote.
 *   - Payload/query: forward { confirmation } as the request body for the
 *     step-up evidence (axios DELETE supports a body).
 *   - 200 → { revoked: true, adminId: string }
 *   - 403 self-revoke / non-super-admin, per demote above.
 *
 * @param {string} adminId
 * @param {{confirmation: string}} [context]
 * @returns {Promise<{revoked: boolean, adminId: string}>}
 */
export async function revokeAdmin(adminId, context = {}) {
  // TODO(backend):
  //   return axiosInstance
  //     .delete(`/api/admin/team/${adminId}`, { data: context })
  //     .then((res) => res.data);
  return withMockDelay({ revoked: true, adminId });
}
