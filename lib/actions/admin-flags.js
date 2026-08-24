/**
 * Feature-flags service — list, create, and update runtime feature flags.
 * ---------------------------------------------------------------------------
 * **STUBBED.** Every function in this module currently resolves with mocked
 * data so the flags management page (#313) can be built and reviewed before the
 * backend endpoints exist. Each function documents the expected contract it
 * will implement — swap the mock bodies for `axiosInstance` calls (see
 * `lib/config/axios.config.js`) when the backend lands.
 *
 * Flag shape owned by the backend:
 *
 *   {
 *     key: string,               // stable kebab-case identifier, e.g. "new-checkout"
 *     description: string,       // human-readable purpose
 *     enabled: boolean,          // master on/off switch
 *     rolloutPercentage: number, // 0-100, percentage of sessions included when enabled
 *     critical: boolean,         // kill-switch flag — toggling off has broad impact
 *     updatedAt: string,         // ISO 8601 timestamp of last change
 *   }
 */

const MOCK_DELAY_MS = 400;

/** In-memory store so the stubbed create/update mutations round-trip in dev. */
let mockFlags = null;

function withMockDelay(value) {
  return new Promise((resolve) => setTimeout(() => resolve(value), MOCK_DELAY_MS));
}

function seedFlags() {
  const now = Date.now();
  return [
    {
      key: "new-checkout",
      description: "Redesigned donation checkout flow with saved payment methods.",
      enabled: true,
      rolloutPercentage: 35,
      critical: false,
      updatedAt: new Date(now - 3 * 60 * 60 * 1000).toISOString(),
    },
    {
      key: "live-classes",
      description: "Enable live Jitsi-backed classes in the learning dashboard.",
      enabled: true,
      rolloutPercentage: 100,
      critical: false,
      updatedAt: new Date(now - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      key: "stellar-payouts",
      description: "Route educator payouts through the Stellar network. Disabling halts all on-chain settlement.",
      enabled: true,
      rolloutPercentage: 100,
      critical: true,
      updatedAt: new Date(now - 5 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      key: "ai-tutor-beta",
      description: "Experimental AI study assistant surfaced in course pages.",
      enabled: false,
      rolloutPercentage: 10,
      critical: false,
      updatedAt: new Date(now - 12 * 60 * 60 * 1000).toISOString(),
    },
    {
      key: "maintenance-mode",
      description: "Global read-only maintenance banner and write lock. Emergency use only.",
      enabled: false,
      rolloutPercentage: 100,
      critical: true,
      updatedAt: new Date(now - 30 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];
}

function getMockFlags() {
  if (!mockFlags) mockFlags = seedFlags();
  return mockFlags;
}

/**
 * List every feature flag.
 *
 * TODO(backend): GET /api/admin/flags
 *   - Auth: requires an admin session token (server-side tier check).
 *   - 200 → { flags: Flag[] } using the flag shape above.
 *   - 403 for non-admins.
 *
 * @returns {Promise<{flags: Array<{key: string, description: string, enabled: boolean, rolloutPercentage: number, critical: boolean, updatedAt: string}>}>}
 */
export async function listFlags() {
  // TODO(backend): return axiosInstance.get("/api/admin/flags").then((res) => res.data);
  return withMockDelay({ flags: getMockFlags().map((flag) => ({ ...flag })) });
}

/**
 * Create a new feature flag. New flags default to disabled so a rollout is an
 * explicit, deliberate follow-up action rather than a side effect of creation.
 *
 * TODO(backend): POST /api/admin/flags
 *   - Auth: admin only.
 *   - Payload: { key: string (kebab-case, unique), description: string,
 *     rolloutPercentage?: number (0-100, default 0), critical?: boolean }
 *   - 201 → { flag: Flag } with server-assigned `enabled: false`, `updatedAt`.
 *   - 409 if `key` already exists; 422 if `key` is not kebab-case.
 *
 * @param {{key: string, description: string, rolloutPercentage?: number, critical?: boolean}} payload
 * @returns {Promise<{flag: {key: string, description: string, enabled: boolean, rolloutPercentage: number, critical: boolean, updatedAt: string}}>}
 */
export async function createFlag(payload) {
  // TODO(backend):
  //   return axiosInstance
  //     .post("/api/admin/flags", payload)
  //     .then((res) => res.data);
  const flag = {
    key: payload.key,
    description: payload.description || "",
    enabled: false,
    rolloutPercentage:
      typeof payload.rolloutPercentage === "number" ? payload.rolloutPercentage : 0,
    critical: Boolean(payload.critical),
    updatedAt: new Date().toISOString(),
  };
  getMockFlags().unshift(flag);
  return withMockDelay({ flag: { ...flag } });
}

/**
 * Update a flag's mutable fields — used for the on/off toggle and rollout
 * percentage changes. Only the provided keys of `patch` are applied.
 *
 * TODO(backend): PATCH /api/admin/flags/:key
 *   - Auth: admin only.
 *   - Payload: Partial<{ enabled: boolean, rolloutPercentage: number (0-100),
 *     description: string, critical: boolean }>
 *   - 200 → { flag: Flag } with a refreshed server-side `updatedAt`.
 *   - 404 if the flag does not exist; 422 for an out-of-range rollout.
 *
 * @param {string} key
 * @param {Partial<{enabled: boolean, rolloutPercentage: number, description: string, critical: boolean}>} patch
 * @returns {Promise<{flag: {key: string, description: string, enabled: boolean, rolloutPercentage: number, critical: boolean, updatedAt: string}}>}
 */
export async function updateFlag(key, patch = {}) {
  // TODO(backend):
  //   return axiosInstance
  //     .patch(`/api/admin/flags/${key}`, patch)
  //     .then((res) => res.data);
  const flags = getMockFlags();
  const index = flags.findIndex((flag) => flag.key === key);
  if (index === -1) {
    await withMockDelay(null);
    throw new Error(`Unknown flag: ${key}`);
  }
  const updated = {
    ...flags[index],
    ...patch,
    key,
    updatedAt: new Date().toISOString(),
  };
  flags[index] = updated;
  return withMockDelay({ flag: { ...updated } });
}
