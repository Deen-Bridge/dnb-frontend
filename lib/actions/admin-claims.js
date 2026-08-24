/**
 * Moderation-queue claims service — claim / unclaim a work item (#335).
 * ---------------------------------------------------------------------------
 * **STUBBED.** Both functions resolve with mocked data so the optimistic claim
 * hook (`useClaim`, #335) can be built and reviewed before the backend
 * endpoints exist. Swap the mock bodies for `axiosInstance` calls (see
 * `lib/config/axios.config.js`) when the backend lands.
 *
 * "Claiming" assigns a moderation-queue item to the acting admin so teammates
 * don't double-handle the same report. The claim is exclusive: the server
 * rejects a claim on an item already claimed by someone else.
 *
 * Claim shape owned by the backend:
 *
 *   {
 *     id: string,                                  // queue-item id
 *     claimedBy: { id: string, name: string } | null,
 *     claimedAt: string | null,                    // ISO 8601 timestamp
 *   }
 */

const MOCK_DELAY_MS = 400;

function withMockDelay(value) {
  return new Promise((resolve) => setTimeout(() => resolve(value), MOCK_DELAY_MS));
}

/**
 * Claim a queue item for the acting admin.
 *
 * TODO(backend): POST /api/admin/moderation/queue/:id/claim
 *   - Auth: moderator/admin only; the acting admin is taken from the session.
 *   - 200 → { claim: { id, claimedBy: { id, name }, claimedAt } }
 *   - 409 if the item is already claimed by a different admin (return the
 *     current claim so the client can reconcile).
 *   - 404 if the item does not exist.
 *
 * @param {string} id queue-item id
 * @returns {Promise<{claim: {id: string, claimedBy: {id: string, name: string}, claimedAt: string}}>}
 */
export async function claim(id) {
  // TODO(backend):
  //   return axiosInstance
  //     .post(`/api/admin/moderation/queue/${id}/claim`)
  //     .then((res) => res.data);
  return withMockDelay({
    claim: {
      id,
      claimedBy: { id: "me", name: "You" },
      claimedAt: new Date().toISOString(),
    },
  });
}

/**
 * Release a claim the acting admin holds on a queue item.
 *
 * TODO(backend): DELETE /api/admin/moderation/queue/:id/claim
 *   - Auth: moderator/admin only; only the current claimant (or a super-admin)
 *     may unclaim.
 *   - 200 → { claim: { id, claimedBy: null, claimedAt: null } }
 *   - 403 if the actor is not the claimant; 404 if the item does not exist.
 *
 * @param {string} id queue-item id
 * @returns {Promise<{claim: {id: string, claimedBy: null, claimedAt: null}}>}
 */
export async function unclaim(id) {
  // TODO(backend):
  //   return axiosInstance
  //     .delete(`/api/admin/moderation/queue/${id}/claim`)
  //     .then((res) => res.data);
  return withMockDelay({ claim: { id, claimedBy: null, claimedAt: null } });
}
