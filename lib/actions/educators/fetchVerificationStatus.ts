import axiosInstance from "@/lib/config/axios.config";

export const VERIFICATION_STATUS = {
  NOT_STARTED: "not_started",
  INCOMPLETE: "incomplete",
  PENDING: "pending",
  UNDER_REVIEW: "under_review",
  REJECTED: "rejected",
  VERIFIED: "verified",
} as const;

export type VerificationStatusValue = typeof VERIFICATION_STATUS[keyof typeof VERIFICATION_STATUS];

export interface ApplicationDocument {
  id: string;
  type: string;
  filename: string;
  uploadedAt: string;
  signedUrlEndpoint?: string;
  [key: string]: any; // TODO(types): Additional document metadata
}

export interface ApplicationTimelineItem {
  status: string;
  label: string;
  ts: string | null;
  done: boolean;
}

export interface VerificationStatusResult {
  status: VerificationStatusValue;
  lastCompletedStep: number;
  totalSteps: number;
  rejectionReason: string | null;
  submittedAt: string | null;
  reviewedAt: string | null;
  documents: ApplicationDocument[];
  timeline: ApplicationTimelineItem[];
}

const NOT_STARTED_FALLBACK: VerificationStatusResult = {
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
};

function normalise(raw: any): VerificationStatusResult { // TODO(types): Raw verification status response payload
  const knownStatuses = Object.values(VERIFICATION_STATUS) as string[];
  return {
    status: (knownStatuses.includes(raw.status)
      ? raw.status
      : VERIFICATION_STATUS.NOT_STARTED) as VerificationStatusValue,
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

export async function fetchVerificationStatus(): Promise<VerificationStatusResult> {
  try {
    const res = await axiosInstance.get(
      "/api/educators/applications/status"
    );
    return normalise(res.data);
  } catch (err: any) { // TODO(types): Axios error on verification status
    const status = err?.response?.status;
    if (status === 404 || status === 403) {
      return NOT_STARTED_FALLBACK;
    }
    throw new Error(
      err?.response?.data?.message ??
        err?.message ??
        "Failed to fetch verification status"
    );
  }
}

export async function fetchDocumentSignedUrl(documentId: string): Promise<{ signedUrl: string; expiresAt: string }> {
  if (!documentId) throw new Error("documentId is required");
  try {
    const res = await axiosInstance.post(
      `/api/educators/applications/documents/${documentId}/signed-url`
    );
    return res.data;
  } catch (err: any) { // TODO(types): Axios error on signed url
    throw new Error(
      err?.response?.data?.message ??
        err?.message ??
        "Failed to obtain document URL"
    );
  }
}
