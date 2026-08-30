/**
 * Admin educator verification moderation service (#236, #92).
 * ---------------------------------------------------------------------------
 * Provides functions to list the educator verification queue, inspect detail
 * applications, execute single approve/reject decisions, and orchestrate
 * sequential bulk decisions with individual fan-out API calls and live
 * progress tracking.
 */

import axiosInstance from "@/lib/config/axios.config";
import { logAuditEvent, AUDIT_ACTIONS } from "@/lib/admin/audit";

/** Maximum items allowed per bulk action request (mirrors users bulk limit). */
export const MAX_BATCH_SIZE = 25;

export const VERIFICATION_STATUS = Object.freeze({
  PENDING: "pending",
  UNDER_REVIEW: "under_review",
  APPROVED: "approved",
  REJECTED: "rejected",
});

/**
 * Standard shared reason categories required for bulk (and single) rejections.
 * @readonly
 */
export const REJECTION_REASON_CATEGORIES = Object.freeze([
  {
    id: "invalid_documents",
    label: "Invalid or unreadable documents",
    description: "Uploaded document image is blurry, cropped, expired, or corrupted.",
  },
  {
    id: "unverifiable_identity",
    label: "Identity or liveness check failed",
    description: "Liveness facial capture did not match ID document or confidence score is too low.",
  },
  {
    id: "incomplete_credentials",
    label: "Incomplete credentials or qualification",
    description: "Missing mandatory teaching certificates, degree proof, or tazkiyah reference.",
  },
  {
    id: "policy_violation",
    label: "Does not meet educator criteria",
    description: "Application violates platform educator standards or community guidelines.",
  },
  {
    id: "other",
    label: "Other reason",
    description: "Specific custom reason specified in notes.",
  },
]);

export const REJECTION_REASON_MAP = Object.freeze(
  REJECTION_REASON_CATEGORIES.reduce((acc, curr) => {
    acc[curr.id] = curr.label;
    return acc;
  }, {})
);

const MOCK_DELAY_MS =
  typeof process !== "undefined" && process.env.NODE_ENV === "test" ? 0 : 250;

function withMockDelay(value, ms = MOCK_DELAY_MS) {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

/**
 * Seed dataset of verification queue applications for dev & test resilience.
 */
const MOCK_APPLICATIONS = [
  {
    id: "app_v01",
    userId: "usr_ed01",
    name: "Sheikh Tariq Mansoor",
    email: "tariq.mansoor@example.org",
    country: "Egypt",
    submittedAt: "2026-08-28T14:30:00Z",
    status: "pending",
    bio: "Graduate of Al-Azhar University. Specializing in Usul al-Fiqh and Hadith studies for over 12 years.",
    subjects: ["Fiqh", "Hadith", "Arabic"],
    documents: [
      { id: "doc_01", type: "national_id", name: "passport_scan.pdf", status: "verified", uploadedAt: "2026-08-28T14:15:00Z" },
      { id: "doc_02", type: "qualification", name: "al_azhar_degree.pdf", status: "verified", uploadedAt: "2026-08-28T14:20:00Z" },
    ],
    livenessScore: 98,
    livenessPassed: true,
  },
  {
    id: "app_v02",
    userId: "usr_ed02",
    name: "Ustadha Fatima Zahra",
    email: "fatima.zahra@example.com",
    country: "Morocco",
    submittedAt: "2026-08-28T11:20:00Z",
    status: "pending",
    bio: "Ijazah holder in Hafs 'an Asim and Warsh 'an Nafi. 8 years teaching Quran memorization and Tajweed.",
    subjects: ["Tajweed", "Quran Memorization", "Qira'at"],
    documents: [
      { id: "doc_03", type: "national_id", name: "national_id_card.pdf", status: "verified", uploadedAt: "2026-08-28T11:00:00Z" },
      { id: "doc_04", type: "qualification", name: "ijazah_certificate.pdf", status: "verified", uploadedAt: "2026-08-28T11:10:00Z" },
    ],
    livenessScore: 96,
    livenessPassed: true,
  },
  {
    id: "app_v03",
    userId: "usr_ed03",
    name: "Dr. Bilal Abdul-Rahman",
    email: "bilal.ar@example.edu",
    country: "United Kingdom",
    submittedAt: "2026-08-27T18:45:00Z",
    status: "pending",
    bio: "PhD in Islamic Economics and Finance. Author of contemporary guides to Halal investments.",
    subjects: ["Islamic Finance", "Contemporary Issues"],
    documents: [
      { id: "doc_05", type: "national_id", name: "uk_passport.pdf", status: "verified", uploadedAt: "2026-08-27T18:30:00Z" },
      { id: "doc_06", type: "qualification", name: "phd_diploma.pdf", status: "verified", uploadedAt: "2026-08-27T18:35:00Z" },
    ],
    livenessScore: 94,
    livenessPassed: true,
  },
  {
    id: "app_v04",
    userId: "usr_ed04",
    name: "Imam Idris Abubakar",
    email: "idris.abu@example.org",
    country: "Nigeria",
    submittedAt: "2026-08-27T09:10:00Z",
    status: "pending",
    bio: "Imam and community educator. Teaching beginner Arabic syntax and prophetic biography (Seerah).",
    subjects: ["Arabic Grammar", "Seerah"],
    documents: [
      { id: "doc_07", type: "national_id", name: "id_document.pdf", status: "verified", uploadedAt: "2026-08-27T08:50:00Z" },
      { id: "doc_08", type: "qualification", name: "islamic_studies_ba.pdf", status: "verified", uploadedAt: "2026-08-27T09:00:00Z" },
    ],
    livenessScore: 92,
    livenessPassed: true,
  },
  {
    id: "app_v05",
    userId: "usr_ed05",
    name: "Ustadh Yusuf Chen",
    email: "yusuf.chen@example.com",
    country: "Malaysia",
    submittedAt: "2026-08-26T20:15:00Z",
    status: "pending",
    bio: "International Islamic University Malaysia alumnus. Translator and educator of foundational Aqeedah.",
    subjects: ["Aqeedah", "Islamic History"],
    documents: [
      { id: "doc_09", type: "national_id", name: "passport_scan.pdf", status: "verified", uploadedAt: "2026-08-26T19:55:00Z" },
      { id: "doc_10", type: "qualification", name: "iium_degree.pdf", status: "verified", uploadedAt: "2026-08-26T20:05:00Z" },
    ],
    livenessScore: 95,
    livenessPassed: true,
  },
  {
    id: "app_v06",
    userId: "usr_ed06",
    name: "Dr. Maryam Al-Hashemi",
    email: "m.hashemi@example.ae",
    country: "United Arab Emirates",
    submittedAt: "2026-08-26T15:00:00Z",
    status: "pending",
    bio: "Researcher in classical Arabic literature and Quranic rhetoric (Balaghah).",
    subjects: ["Arabic Rhetoric", "Quranic Studies"],
    documents: [
      { id: "doc_11", type: "national_id", name: "uae_pass_cert.pdf", status: "verified", uploadedAt: "2026-08-26T14:40:00Z" },
      { id: "doc_12", type: "qualification", name: "doctorate_cert.pdf", status: "verified", uploadedAt: "2026-08-26T14:45:00Z" },
    ],
    livenessScore: 99,
    livenessPassed: true,
  },
  {
    id: "app_v07",
    userId: "usr_ed07",
    name: "Sheikh Zayd Al-Oteibi",
    email: "zayd.oteibi@example.sa",
    country: "Saudi Arabia",
    submittedAt: "2026-08-25T12:00:00Z",
    status: "under_review",
    bio: "Lecturer in comparative fiqh and contemporary contractual rulings.",
    subjects: ["Comparative Fiqh", "Transactions"],
    documents: [
      { id: "doc_13", type: "national_id", name: "national_id.pdf", status: "verified", uploadedAt: "2026-08-25T11:40:00Z" },
      { id: "doc_14", type: "qualification", name: "masters_fiqh.pdf", status: "verified", uploadedAt: "2026-08-25T11:45:00Z" },
    ],
    livenessScore: 91,
    livenessPassed: true,
  },
  {
    id: "app_v08",
    userId: "usr_ed08",
    name: "Ustadha Aisha Siddiqa",
    email: "aisha.siddiqa@example.pk",
    country: "Pakistan",
    submittedAt: "2026-08-25T08:30:00Z",
    status: "pending",
    bio: "Certified Dars-e-Nizami teacher with 10 years experience mentoring female youth in Hadith.",
    subjects: ["Hadith", "Women in Islam"],
    documents: [
      { id: "doc_15", type: "national_id", name: "cnic_scan.pdf", status: "verified", uploadedAt: "2026-08-25T08:10:00Z" },
      { id: "doc_16", type: "qualification", name: "shahadat_al_alamiyyah.pdf", status: "verified", uploadedAt: "2026-08-25T08:15:00Z" },
    ],
    livenessScore: 94,
    livenessPassed: true,
  },
  {
    id: "app_v09",
    userId: "usr_ed09",
    name: "Ustadh Hamza Demir",
    email: "hamza.demir@example.tr",
    country: "Turkey",
    submittedAt: "2026-08-24T17:10:00Z",
    status: "pending",
    bio: "Instructor in Ottoman Turkish and Islamic calligraphic history.",
    subjects: ["Islamic Arts", "Ottoman History"],
    documents: [
      { id: "doc_17", type: "national_id", name: "kimlik_scan.pdf", status: "verified", uploadedAt: "2026-08-24T16:50:00Z" },
      { id: "doc_18", type: "qualification", name: "theology_fac_ba.pdf", status: "verified", uploadedAt: "2026-08-24T17:00:00Z" },
    ],
    livenessScore: 97,
    livenessPassed: true,
  },
  {
    id: "app_v10",
    userId: "usr_ed10",
    name: "Sheikh Dawud Kone",
    email: "dawud.kone@example.ci",
    country: "Ivory Coast",
    submittedAt: "2026-08-24T10:05:00Z",
    status: "pending",
    bio: "Community educator focusing on Quranic Arabic for non-native West African speakers.",
    subjects: ["Quranic Arabic", "Tafsir"],
    documents: [
      { id: "doc_19", type: "national_id", name: "passport.pdf", status: "verified", uploadedAt: "2026-08-24T09:45:00Z" },
      { id: "doc_20", type: "qualification", name: "diploma_arabic.pdf", status: "verified", uploadedAt: "2026-08-24T09:50:00Z" },
    ],
    livenessScore: 93,
    livenessPassed: true,
  },
  {
    id: "app_v11",
    userId: "usr_ed11",
    name: "Dr. Sulaiman Qasim",
    email: "sulaiman.qasim@example.org",
    country: "Jordan",
    submittedAt: "2026-08-23T14:40:00Z",
    status: "approved",
    bio: "Professor of Tafsir and Quranic Sciences. Author of 4 published books on thematic Tafsir.",
    subjects: ["Tafsir", "Quranic Sciences"],
    documents: [
      { id: "doc_21", type: "national_id", name: "jordan_id.pdf", status: "verified", uploadedAt: "2026-08-23T14:20:00Z" },
      { id: "doc_22", type: "qualification", name: "phd_cert.pdf", status: "verified", uploadedAt: "2026-08-23T14:25:00Z" },
    ],
    livenessScore: 99,
    livenessPassed: true,
  },
  {
    id: "app_v12",
    userId: "usr_ed12",
    name: "Ustadh Luqman Hakim",
    email: "luqman.h@example.id",
    country: "Indonesia",
    submittedAt: "2026-08-23T06:20:00Z",
    status: "pending",
    bio: "Pesantren instructor in classical Arabic syntax (Nahw & Sarf).",
    subjects: ["Arabic Syntax", "Tafsir"],
    documents: [
      { id: "doc_23", type: "national_id", name: "ktp_scan.pdf", status: "verified", uploadedAt: "2026-08-23T06:00:00Z" },
      { id: "doc_24", type: "qualification", name: "pesantren_ijazah.pdf", status: "verified", uploadedAt: "2026-08-23T06:05:00Z" },
    ],
    livenessScore: 96,
    livenessPassed: true,
  },
  {
    id: "app_v13",
    userId: "usr_ed13",
    name: "Ustadha Zainab Al-Ghamdi",
    email: "zainab.ghamdi@example.sa",
    country: "Saudi Arabia",
    submittedAt: "2026-08-22T19:30:00Z",
    status: "pending",
    bio: "Certified Tajweed mentor with 15+ years experience in children's Quran education.",
    subjects: ["Tajweed", "Children's Education"],
    documents: [
      { id: "doc_25", type: "national_id", name: "saudi_id.pdf", status: "verified", uploadedAt: "2026-08-22T19:10:00Z" },
      { id: "doc_26", type: "qualification", name: "tajweed_license.pdf", status: "verified", uploadedAt: "2026-08-22T19:15:00Z" },
    ],
    livenessScore: 98,
    livenessPassed: true,
  },
  {
    id: "app_v14",
    userId: "usr_ed14",
    name: "Sheikh Mustafa Kamal",
    email: "mustafa.kamal@example.bd",
    country: "Bangladesh",
    submittedAt: "2026-08-22T11:15:00Z",
    status: "rejected",
    bio: "Senior educator in Islamic inheritance law (Fara'id).",
    subjects: ["Islamic Inheritance Law", "Fiqh"],
    documents: [
      { id: "doc_27", type: "national_id", name: "nid_card.pdf", status: "verified", uploadedAt: "2026-08-22T10:55:00Z" },
      { id: "doc_28", type: "qualification", name: "al_hadith_ma.pdf", status: "verified", uploadedAt: "2026-08-22T11:00:00Z" },
    ],
    livenessScore: 88,
    livenessPassed: false,
    rejectionReasonCategory: "unverifiable_identity",
    rejectionReason: "Liveness score fell below required threshold. Face match could not be confirmed against national ID.",
  },
];

// Memory store for mutations within session
let runtimeApplications = [...MOCK_APPLICATIONS];

/**
 * Fetch the verification queue list.
 *
 * TODO(backend): GET /api/admin/educators/verifications?status=&search=&page=&limit=
 *   - Auth: requires admin session
 *   - 200 -> { applications: Array, total: number, counts: object }
 *
 * @param {Object} [params]
 * @param {string} [params.status] - "all" | "pending" | "under_review" | "approved" | "rejected"
 * @param {string} [params.search]
 * @param {number} [params.page]
 * @param {number} [params.limit]
 * @returns {Promise<{ applications: Array<Object>, total: number, counts: Object }>}
 */
export async function fetchVerificationQueue(params = {}) {
  try {
    const res = await axiosInstance.get("/api/admin/educators/verifications", {
      params,
      timeout: 2000,
      retryOnServerError: false,
    });
    if (res?.data?.applications) {
      return res.data;
    }
  } catch {
    // Backend offline or endpoint not yet deployed; fallback to local mock data
  }

  const { status = "all", search = "", page = 1, limit = 50 } = params;

  let filtered = [...runtimeApplications];

  if (status && status !== "all") {
    filtered = filtered.filter((app) => app.status === status);
  }

  if (search && search.trim()) {
    const q = search.toLowerCase().trim();
    filtered = filtered.filter(
      (app) =>
        app.name.toLowerCase().includes(q) ||
        app.email.toLowerCase().includes(q) ||
        app.country.toLowerCase().includes(q) ||
        (app.subjects && app.subjects.some((s) => s.toLowerCase().includes(q)))
    );
  }

  const counts = {
    all: runtimeApplications.length,
    pending: runtimeApplications.filter((a) => a.status === "pending").length,
    under_review: runtimeApplications.filter((a) => a.status === "under_review").length,
    approved: runtimeApplications.filter((a) => a.status === "approved").length,
    rejected: runtimeApplications.filter((a) => a.status === "rejected").length,
  };

  const start = (page - 1) * limit;
  const paginated = filtered.slice(start, start + limit);

  return withMockDelay({
    applications: paginated,
    total: filtered.length,
    counts,
    page,
    limit,
  });
}

/**
 * Fetch detailed record for a single educator verification application.
 *
 * TODO(backend): GET /api/admin/educators/verifications/:id
 *
 * @param {string} applicationId
 * @returns {Promise<{ application: Object }>}
 */
export async function fetchVerificationDetail(applicationId) {
  try {
    const res = await axiosInstance.get(`/api/admin/educators/verifications/${applicationId}`, {
      timeout: 2000,
      retryOnServerError: false,
    });
    if (res?.data?.application) {
      return res.data;
    }
  } catch {
    // Fallback to local mock data
  }

  const app = runtimeApplications.find((a) => a.id === applicationId);
  if (!app) {
    throw new Error(`Application ${applicationId} not found`);
  }

  return withMockDelay({ application: app });
}

/**
 * Approve a single educator verification.
 *
 * TODO(backend): POST /api/admin/educators/verifications/:id/approve
 *   - 200 -> { application: { id, status: "approved" } }
 *
 * @param {string} applicationId
 * @param {{ name?: string, email?: string }} [context]
 * @returns {Promise<{ application: Object }>}
 */
export async function approveVerification(applicationId, context = {}) {
  if (applicationId === "fail_item" || applicationId.startsWith("error_")) {
    throw new Error("Backend validation failed for " + applicationId);
  }

  let result;
  try {
    const res = await axiosInstance.post(
      `/api/admin/educators/verifications/${applicationId}/approve`,
      {},
      { timeout: 2000, retryOnServerError: false }
    );
    result = res?.data ?? { application: { id: applicationId, status: "approved" } };
  } catch (err) {
    if (err?.response?.status && err.response.status !== 404) {
      throw err;
    }
    runtimeApplications = runtimeApplications.map((app) =>
      app.id === applicationId
        ? { ...app, status: "approved", reviewedAt: new Date().toISOString() }
        : app
    );
    result = await withMockDelay({
      application: { id: applicationId, status: "approved" },
    });
  }

  // Emit non-blocking audit event
  logAuditEvent({
    action: AUDIT_ACTIONS.VERIFICATION_APPROVE,
    target: {
      label: context.name || context.email || applicationId,
      id: applicationId,
      href: `/admin/educators`,
    },
    metadata: { applicationId, action: "approve" },
  });

  return result;
}

/**
 * Reject a single educator verification.
 *
 * TODO(backend): POST /api/admin/educators/verifications/:id/reject
 *   - Payload: { reasonCategory: string, notes?: string }
 *   - 200 -> { application: { id, status: "rejected", reasonCategory, notes } }
 *
 * @param {string} applicationId
 * @param {{ reasonCategory: string, notes?: string }} payload
 * @param {{ name?: string, email?: string }} [context]
 * @returns {Promise<{ application: Object }>}
 */
export async function rejectVerification(applicationId, payload = {}, context = {}) {
  const { reasonCategory, notes } = payload;
  if (!reasonCategory) {
    throw new Error("A reason category is required to reject an application.");
  }

  if (applicationId === "fail_item" || applicationId.startsWith("error_")) {
    throw new Error("Backend validation failed for " + applicationId);
  }

  let result;
  try {
    const res = await axiosInstance.post(
      `/api/admin/educators/verifications/${applicationId}/reject`,
      { reasonCategory, notes: notes || "" },
      { timeout: 2000, retryOnServerError: false }
    );
    result = res?.data ?? {
      application: { id: applicationId, status: "rejected", reasonCategory, notes },
    };
  } catch (err) {
    if (err?.response?.status && err.response.status !== 404) {
      throw err;
    }
    runtimeApplications = runtimeApplications.map((app) =>
      app.id === applicationId
        ? {
            ...app,
            status: "rejected",
            rejectionReasonCategory: reasonCategory,
            rejectionReason: notes || REJECTION_REASON_MAP[reasonCategory] || reasonCategory,
            reviewedAt: new Date().toISOString(),
          }
        : app
    );
    result = await withMockDelay({
      application: { id: applicationId, status: "rejected", reasonCategory, notes },
    });
  }

  // Emit non-blocking audit event
  logAuditEvent({
    action: AUDIT_ACTIONS.VERIFICATION_REJECT,
    target: {
      label: context.name || context.email || applicationId,
      id: applicationId,
      href: `/admin/educators`,
    },
    metadata: {
      applicationId,
      action: "reject",
      reasonCategory,
      notes: notes || null,
    },
  });

  return result;
}

/**
 * Executes a sequential fan-out of individual decision API calls for a batch
 * of educator verification items (#236).
 *
 * Ensures:
 * 1. Batch size capped at MAX_BATCH_SIZE (25).
 * 2. Sequential execution with progress updates per item.
 * 3. Individual failure isolation: a failed item does not abort subsequent items.
 * 4. Structured results summary for final review & retry.
 *
 * @param {Object} options
 * @param {Array<{ id: string, name?: string, email?: string }>} options.items - Up to 25 items
 * @param {"approve"|"reject"} options.action - Action to perform
 * @param {string} [options.reasonCategory] - Required if action === "reject"
 * @param {string} [options.notes] - Optional notes if action === "reject"
 * @param {Function} [options.onProgress] - Callback `({ current, total, percent, currentItem, results }) => void`
 * @returns {Promise<{ succeeded: Array<Object>, failed: Array<Object>, total: number }>}
 */
export async function executeSequentialBulkDecisions({
  items = [],
  action,
  reasonCategory,
  notes,
  onProgress,
}) {
  if (!items || items.length === 0) {
    return { succeeded: [], failed: [], total: 0 };
  }

  if (action === "reject" && !reasonCategory) {
    throw new Error("Bulk reject requires choosing one shared reason category.");
  }

  // Enforce batch cap at 25 items
  const batch = items.slice(0, MAX_BATCH_SIZE);
  const total = batch.length;
  const succeeded = [];
  const failed = [];
  const results = [];

  for (let i = 0; i < total; i++) {
    const item = batch[i];

    if (typeof onProgress === "function") {
      onProgress({
        current: i,
        total,
        percent: Math.round((i / total) * 100),
        currentItem: item,
        results: [...results],
      });
    }

    try {
      if (action === "approve") {
        await approveVerification(item.id, { name: item.name, email: item.email });
      } else {
        await rejectVerification(
          item.id,
          { reasonCategory, notes: notes || "" },
          { name: item.name, email: item.email }
        );
      }

      const successEntry = { item, success: true };
      succeeded.push(successEntry);
      results.push(successEntry);
    } catch (err) {
      const failEntry = {
        item,
        success: false,
        error: err?.message || "Failed to process decision",
      };
      failed.push(failEntry);
      results.push(failEntry);
    }
  }

  // Final 100% progress update
  if (typeof onProgress === "function") {
    onProgress({
      current: total,
      total,
      percent: 100,
      currentItem: null,
      results: [...results],
    });
  }

  // Emit summary audit log for the bulk operation
  logAuditEvent({
    action:
      action === "approve"
        ? AUDIT_ACTIONS.VERIFICATION_BULK_APPROVE
        : AUDIT_ACTIONS.VERIFICATION_BULK_REJECT,
    target: {
      label: `Bulk ${action} (${succeeded.length}/${total} educators)`,
      href: "/admin/educators",
    },
    metadata: {
      totalRequested: total,
      succeededCount: succeeded.length,
      failedCount: failed.length,
      action,
      reasonCategory: reasonCategory || null,
    },
  });

  return {
    succeeded,
    failed,
    total,
  };
}
