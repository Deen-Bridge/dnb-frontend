/**
 * fetchVerificationStatus
 * -----------------------
 * Fetches the educator's current EducatorApplication state from the backend
 * (dnb-backend#92). Returns a normalised VerificationStatus object.
 *
 * Contract (agreed with #92 assignee — update endpoint / field names once
 * the backend PR lands):
 *
 *   GET /api/educators/applications/status
 *   Authorization: Bearer <token>
 *
 *   Response 200:
 *   {
 *     status: "not_started" | "incomplete" | "pending"
 *              | "under_review" | "rejected" | "verified",
 *     lastCompletedStep: number,          // 1-based wizard step (1–3)
 *     totalSteps: number,                 // always 3 for now
 *     rejectionReason: string | null,
 *     submittedAt: ISO-8601 | null,
 *     reviewedAt:  ISO-8601 | null,
 *     documents: Array<{
 *       id: string,
 *       type: string,          // e.g. "national_id", "qualification"
 *       filename: string,      // masked on display — never a raw URL
 *       uploadedAt: ISO-8601,
 *       signedUrlEndpoint: string  // path to call for a time-limited URL
 *     }>,
 *     timeline: Array<{
 *       status: string,
 *       label:  string,
 *       ts:     ISO-8601 | null,
 *       done:   boolean
 *     }>
 *   }
 *
 *   Response 404 — no application record yet → treat as "not_started"
 *   Response 403 — user is not an educator → treat as "not_started"
 *
 * While dnb-backend#92 is in progress, NEXT_PUBLIC_LIVENESS_PROVIDER=mock
 * will keep the UI running against the mock adapter. The fetch here will
 * return a sensible fallback so the dashboard and status center render
 * correctly in dev without a live backend.
 */

import axiosInstance from "@/lib/config/axios.config";

// ── Status constants ────────────────────────────────────────────────────────

export const VERIFICATION_STATUS = /** @type {const} */ ({
  NOT_STARTED: "not_started",
  INCOMPLETE: "incomplete",
  PENDING: "pending",
  UNDER_REVIEW: "under_review",
  REJECTED: "rejected",
  VERIFIED: "verified",
});

/** @typedef {typeof VERIFICATION_STATUS[keyof typeof VERIFICATION_STATUS]} VerificationStatusValue */

/**
 * @typedef {Object} VerificationStatusResult
 * @property {VerificationStatusValue} status
 * @property {number}  lastCompletedStep   1-based; 0 = nothing completed
 * @property {number}  totalSteps
 * @property {string|null} rejectionReason
 * @property {string|null} submittedAt     ISO-8601
 * @property {string|null} reviewedAt      ISO-8601
 * @property {Array<{id:string, type:string, filename:string, uploadedAt:string, signedUrlEndpoint:string}>} documents
 * @property {Array<{status:string, label:string, ts:string|null, done:boolean}>} timeline
 */

/** Baseline returned when the user has no application record yet */
const NOT_STARTED_FALLBACK = /** @type {VerificationStatusResult} */ ({
  status: VERIFICATION_STATUS.NOT_STARTED,
  lastCompletedStep: 0,
  totalSteps: 3,
  rejectionReason: null,
  submittedAt: null,
  reviewedAt: null,
  documents: [],
  timeline: [
    { status: "identity", label: "Identity verification", ts: null, done: false },
    { status: "documents", label: "Document upload", ts: null, done: false },
    { status: "review", label: "Under review", ts: null, done: false },
  ],
});

/**
 * Normalise the raw API payload to VerificationStatusResult.
 * Guards against missing fields from older backend versions.
 *
 * @param {Object} raw
 * @returns {VerificationStatusResult}
 */
function normalise(raw) {
  const knownStatuses = Object.values(VERIFICATION_STATUS);
  return {
    status: knownStatuses.includes(raw.status)
      ? raw.status
      : VERIFICATION_STATUS.NOT_STARTED,
    lastCompletedStep: typeof raw.lastCompletedStep === "number"
      ? raw.lastCompletedStep
      : 0,
    totalSteps: typeof raw.totalSteps === "number" ? raw.totalSteps : 3,
    rejectionReason: raw.rejectionReason ?? null,
    submittedAt: raw.submittedAt ?? null,
    reviewedAt: raw.reviewedAt ?? null,
    documents: Array.isArray(raw.documents) ? raw.documents : [],
    timeline: Array.isArray(raw.timeline)
      ? raw.timeline
      : NOT_STARTED_FALLBACK.timeline,
  };
}

/**
 * Fetch the current verification status for the authenticated educator.
 *
 * @returns {Promise<VerificationStatusResult>}
 */
export async function fetchVerificationStatus() {
  try {
    const res = await axiosInstance.get(
      "/api/educators/applications/status"
    );
    return normalise(res.data);
  } catch (err) {
    const status = err?.response?.status;
    // 404 = no application yet; 403 = not an educator role — both are safe
    if (status === 404 || status === 403) {
      return NOT_STARTED_FALLBACK;
    }
    // Re-throw real network / server errors so the hook can surface them
    throw new Error(
      err?.response?.data?.message ??
        err?.message ??
        "Failed to fetch verification status"
    );
  }
}

/**
 * Request a short-lived signed URL for a previously submitted document.
 * The document is identified by its ID, not its filename.
 *
 * @param {string} documentId
 * @returns {Promise<{ signedUrl: string, expiresAt: string }>}
 */
export async function fetchDocumentSignedUrl(documentId) {
  if (!documentId) throw new Error("documentId is required");
  try {
    const res = await axiosInstance.post(
      `/api/educators/applications/documents/${documentId}/signed-url`
    );
    return res.data;
  } catch (err) {
    throw new Error(
      err?.response?.data?.message ??
        err?.message ??
        "Failed to obtain document URL"
    );
  }
}
