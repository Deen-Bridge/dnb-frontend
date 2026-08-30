import axiosInstance from "@/lib/config/axios.config";

export const CREDENTIAL_EXPIRY_STATUS = /** @type {const} */ ({
  EXPIRED: "expired",
  EXPIRING: "expiring",
  VALID: "valid",
  MISSING: "missing",
});

/**
 * Backend contract expected by the admin credential-expiry UI:
 *
 * GET /api/admin/mentors/credentials
 * {
 *   mentors: Array<{
 *     id: string,
 *     name: string,
 *     email: string,
 *     verificationStatus: "verified",
 *     credentials: Array<{
 *       id: string,
 *       type: string,
 *       expiresAt: string | null // ISO-8601 date or timestamp
 *     }>
 *   }>
 * }
 *
 * Credentials are flattened into one row per mentor credential so each expiry
 * can be filtered and reminded independently.
 */

const DAY_MS = 24 * 60 * 60 * 1000;

function toUtcDay(value) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
}

/**
 * Compute the calendar-day expiry state for a credential.
 *
 * @param {string|null|undefined} expiresAt
 * @param {Date|string} [now]
 * @returns {{ status: string, daysRemaining: number|null }}
 */
export function computeCredentialExpiry(expiresAt, now = new Date()) {
  if (!expiresAt) {
    return {
      status: CREDENTIAL_EXPIRY_STATUS.MISSING,
      daysRemaining: null,
    };
  }

  const expiryDay = toUtcDay(expiresAt);
  const currentDay = toUtcDay(now);

  if (expiryDay === null || currentDay === null) {
    return {
      status: CREDENTIAL_EXPIRY_STATUS.MISSING,
      daysRemaining: null,
    };
  }

  const daysRemaining = Math.round((expiryDay - currentDay) / DAY_MS);

  if (daysRemaining < 0) {
    return { status: CREDENTIAL_EXPIRY_STATUS.EXPIRED, daysRemaining };
  }

  if (daysRemaining <= 90) {
    return { status: CREDENTIAL_EXPIRY_STATUS.EXPIRING, daysRemaining };
  }

  return { status: CREDENTIAL_EXPIRY_STATUS.VALID, daysRemaining };
}

/**
 * Return whether a computed credential row matches an admin expiry filter.
 * Expiry-window filters include today and future expirations, but not already
 * expired credentials.
 *
 * @param {{ expiryStatus: string, daysRemaining: number|null }} credential
 * @param {"all"|"30"|"60"|"90"|"expired"} filter
 */
export function matchesCredentialExpiryFilter(credential, filter) {
  if (filter === "all") return true;
  if (filter === "expired") {
    return credential.expiryStatus === CREDENTIAL_EXPIRY_STATUS.EXPIRED;
  }

  const windowDays = Number(filter);
  return (
    Number.isFinite(windowDays) &&
    credential.daysRemaining !== null &&
    credential.daysRemaining >= 0 &&
    credential.daysRemaining <= windowDays
  );
}

function dateFromNow(days) {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString();
}

function fallbackMentors() {
  return [
    {
      id: "mentor_001",
      name: "Dr. Bilal Karim",
      email: "bilal@deenbridge.org",
      verificationStatus: "verified",
      credentials: [
        {
          id: "credential_001",
          type: "Teaching certificate",
          expiresAt: dateFromNow(18),
        },
      ],
    },
    {
      id: "mentor_002",
      name: "Zaynab Idris",
      email: "zaynab@deenbridge.org",
      verificationStatus: "verified",
      credentials: [
        {
          id: "credential_002",
          type: "Ijazah verification",
          expiresAt: dateFromNow(52),
        },
      ],
    },
    {
      id: "mentor_003",
      name: "Amina Yusuf",
      email: "amina@deenbridge.org",
      verificationStatus: "verified",
      credentials: [
        {
          id: "credential_003",
          type: "Safeguarding certificate",
          expiresAt: dateFromNow(84),
        },
      ],
    },
    {
      id: "mentor_004",
      name: "Omar Rahman",
      email: "omar@deenbridge.org",
      verificationStatus: "verified",
      credentials: [
        {
          id: "credential_004",
          type: "Teaching certificate",
          expiresAt: dateFromNow(-7),
        },
      ],
    },
  ];
}

function normaliseMentors(rawMentors, now) {
  if (!Array.isArray(rawMentors)) return [];

  return rawMentors
    .filter(
      (mentor) =>
        mentor?.verificationStatus === "verified" || mentor?.isVerified === true
    )
    .flatMap((mentor) => {
      const mentorId = mentor.id ?? mentor._id;
      const credentials = Array.isArray(mentor.credentials)
        ? mentor.credentials
        : mentor.credentialType || mentor.credentialExpiryDate
          ? [
              {
                id: mentor.credentialId,
                type: mentor.credentialType,
                expiresAt: mentor.credentialExpiryDate,
              },
            ]
          : [];

      return credentials.map((credential, index) => {
        const expiry = computeCredentialExpiry(credential.expiresAt, now);
        return {
          mentorId: String(mentorId ?? ""),
          mentorName: mentor.name ?? "Unknown mentor",
          mentorEmail: mentor.email ?? "",
          credentialId: String(
            credential.id ?? `${mentorId ?? "mentor"}-credential-${index}`
          ),
          credentialType: credential.type ?? "Unspecified credential",
          expiresAt: credential.expiresAt ?? null,
          expiryStatus: expiry.status,
          daysRemaining: expiry.daysRemaining,
        };
      });
    });
}

/**
 * Fetch verified mentors and return one computed row per credential.
 * Network and 404 responses use representative local data until the backend
 * endpoint is available; authenticated server errors continue to surface.
 *
 * @param {{ expiryWithinDays?: 30|60|90, now?: Date|string }} [options]
 * @returns {Promise<{ credentials: Array<Object>, generatedAt: string, source: "api"|"fallback" }>}
 */
export async function fetchExpiringMentorCredentials(options = {}) {
  const now = options.now ?? new Date();

  try {
    const response = await axiosInstance.get("/api/admin/mentors/credentials", {
      params: options.expiryWithinDays
        ? { expiryWithinDays: options.expiryWithinDays }
        : {},
    });
    return {
      credentials: normaliseMentors(response.data?.mentors, now),
      generatedAt: new Date().toISOString(),
      source: "api",
    };
  } catch (error) {
    const status = error?.response?.status;
    const isUnavailable =
      status === 404 ||
      error?.code === "ERR_NETWORK" ||
      error?.message === "Network Error" ||
      !error?.response;

    if (!isUnavailable) {
      throw new Error(
        error?.response?.data?.message ??
          error?.message ??
          "Failed to fetch mentor credentials"
      );
    }

    return {
      credentials: normaliseMentors(fallbackMentors(), now),
      generatedAt: new Date().toISOString(),
      source: "fallback",
    };
  }
}
