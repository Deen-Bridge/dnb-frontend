import axiosInstance from "@/lib/config/axios.config";

export const CREDENTIAL_EXPIRY_STATUS = {
  EXPIRED: "expired",
  EXPIRING: "expiring",
  VALID: "valid",
  MISSING: "missing",
} as const;

export type CredentialExpiryStatus = typeof CREDENTIAL_EXPIRY_STATUS[keyof typeof CREDENTIAL_EXPIRY_STATUS];

const DAY_MS = 24 * 60 * 60 * 1000;

function toUtcDay(value: Date | string | number): number | null {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
}

export interface ComputedExpiryResult {
  status: CredentialExpiryStatus;
  daysRemaining: number | null;
}

/**
 * Compute the calendar-day expiry state for a credential.
 */
export function computeCredentialExpiry(
  expiresAt?: string | null,
  now: Date | string = new Date()
): ComputedExpiryResult {
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

export interface CredentialExpiryFilterItem {
  expiryStatus: string;
  daysRemaining: number | null;
  [key: string]: any; // TODO(types): Credential item filter payload
}

/**
 * Return whether a computed credential row matches an admin expiry filter.
 */
export function matchesCredentialExpiryFilter(
  credential: CredentialExpiryFilterItem,
  filter: "all" | "30" | "60" | "90" | "expired" | string
): boolean {
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

function dateFromNow(days: number): string {
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

export interface NormalisedMentorCredential {
  mentorId: string;
  mentorName: string;
  mentorEmail: string;
  credentialId: string;
  credentialType: string;
  expiresAt: string | null;
  expiryStatus: CredentialExpiryStatus;
  daysRemaining: number | null;
}

function normaliseMentors(
  rawMentors: any[] | undefined, // TODO(types): Raw mentor payload from backend
  now: Date | string
): NormalisedMentorCredential[] {
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

      return credentials.map((credential: any, index: number) => { // TODO(types): Nested credential payload
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

export interface FetchExpiringMentorCredentialsOptions {
  expiryWithinDays?: 30 | 60 | 90 | number;
  now?: Date | string;
}

export interface FetchExpiringMentorCredentialsResult {
  credentials: NormalisedMentorCredential[];
  generatedAt: string;
  source: "api" | "fallback";
}

/**
 * Fetch verified mentors and return one computed row per credential.
 */
export async function fetchExpiringMentorCredentials(
  options: FetchExpiringMentorCredentialsOptions = {}
): Promise<FetchExpiringMentorCredentialsResult> {
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
  } catch (error: any) { // TODO(types): Error from mentor credentials fetch
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
