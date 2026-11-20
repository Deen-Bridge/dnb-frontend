import { logger } from "@/lib/logger";
import axiosInstance from "@/lib/config/axios.config";
import { validateDocumentFile } from "@/lib/verification/documents/policy";

const DISPUTES_PATH = "/api/admin/payments/disputes";

export interface AdminDisputeListParams {
  page?: number;
  limit?: number;
  status?: string;
}

export interface AdminDisputeListResult {
  success: boolean;
  disputes: Array<Record<string, unknown>>;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNextPage?: boolean;
    hasPrevPage?: boolean;
  };
  error?: string;
}

function apiErrorMessage(error: any, fallback: string) {
  return error?.response?.data?.message || error?.response?.data?.error || error?.message || fallback;
}

function normalizePagination(data: any, params: AdminDisputeListParams) {
  const pagination = data?.pagination || {};
  const page = Number(pagination.page || params.page || 1);
  const limit = Number(pagination.limit || params.limit || 10);
  const total = Number(pagination.total || 0);
  const pages = Number(pagination.pages || pagination.totalPages || (total ? Math.ceil(total / limit) : 0));
  return {
    page,
    limit,
    total,
    pages,
    hasNextPage: pagination.hasNextPage ?? page < pages,
    hasPrevPage: pagination.hasPrevPage ?? page > 1,
  };
}

export async function listAdminDisputes(params: AdminDisputeListParams = {}): Promise<AdminDisputeListResult> {
  try {
    const res = await axiosInstance.get(DISPUTES_PATH, {
      params: {
        page: params.page || 1,
        limit: params.limit || 10,
        ...(params.status && params.status !== "all" ? { status: params.status } : {}),
      },
    });
    const data = res.data || {};
    return {
      success: data.success !== false,
      disputes: Array.isArray(data.disputes) ? data.disputes : Array.isArray(data.data) ? data.data : [],
      pagination: normalizePagination(data, params),
    };
  } catch (error: any) {
    const message = apiErrorMessage(error, "Failed to load disputes");
    const wrapped = new Error(message);
    (wrapped as any).status = error?.response?.status;
    throw wrapped;
  }
}

export async function getAdminDispute(disputeId: string) {
  if (!disputeId) throw new Error("disputeId is required");
  try {
    const res = await axiosInstance.get(`${DISPUTES_PATH}/${disputeId}`);
    return res.data;
  } catch (error: any) {
    throw new Error(apiErrorMessage(error, "Failed to load dispute"));
  }
}

export async function resolveAdminDispute(
  disputeId: string,
  decision: "approved" | "rejected" | "off_chain_resolved",
  notes = ""
) {
  if (!disputeId) throw new Error("disputeId is required");
  const idempotencyKey = `admin-dispute-resolution:${disputeId}:${decision}`;
  try {
    const res = await axiosInstance.patch(
      `${DISPUTES_PATH}/${disputeId}/resolution`,
      { decision, notes },
      { headers: { "Idempotency-Key": idempotencyKey } }
    );
    return res.data;
  } catch (error: any) {
    const message = apiErrorMessage(
      error,
      error?.response?.status === 409 ? "This dispute changed before it could be resolved. Refresh and review it again." : "Failed to resolve dispute"
    );
    const wrapped = new Error(message);
    (wrapped as any).status = error?.response?.status;
    throw wrapped;
  }
}

export async function requestDisputeEvidence(disputeId: string, target: "buyer" | "educator") {
  if (!disputeId) throw new Error("disputeId is required");
  try {
    const res = await axiosInstance.post(`${DISPUTES_PATH}/${disputeId}/evidence-request`, { target });
    return res.data;
  } catch (error: any) {
    throw new Error(apiErrorMessage(error, "Failed to request evidence"));
  }
}

export interface DisputeEvidenceSignedUrlResult {
  success: boolean;
  signedUrl: string;
  expiresAt: string;
  fileName?: string;
  fileType?: string;
  error?: string;
}

/**
 * Fetch a short-lived expiring signed URL for a dispute evidence attachment (#284).
 * Reuses security behavior & expiring-URL pattern from verification document viewer (#233).
 */
export async function fetchDisputeEvidenceSignedUrl(
  disputeId: string,
  evidenceId: string
): Promise<DisputeEvidenceSignedUrlResult> {
  if (!disputeId || !evidenceId) {
    throw new Error("disputeId and evidenceId are required");
  }

  try {
    const res = await axiosInstance.post(
      `/api/admin/payments/disputes/${disputeId}/evidence/${evidenceId}/signed-url`
    );
    if (res.data && res.data.signedUrl) {
      return { success: true, ...res.data };
    }
    return {
      success: false,
      signedUrl: "",
      expiresAt: "",
      error: res.data?.message || res.data?.error || "Signed URL not returned by server",
    };
  } catch (error: any) { // TODO(types): Error from signed URL fetch
    logger.error("Failed to fetch dispute evidence signed URL:", error);
    return {
      success: false,
      signedUrl: "",
      expiresAt: "",
      error: error.response?.data?.message || error.message || "Failed to fetch signed URL",
    };
  }
}

export interface UploadAdminDisputeEvidencePayload {
  file?: File;
  note?: string;
  senderRole?: string;
}

export interface UploadAdminDisputeEvidenceResult {
  success: boolean;
  evidence?: {
    id: string;
    fileName: string;
    fileType: string;
    uploadedAt: string;
    note: string;
    senderRole: string;
    signedUrl: string;
    expiresAt: string;
    [key: string]: any; // TODO(types): Evidence record payload
  };
  error?: string;
}

/**
 * Upload admin notes & evidence attachment for a dispute.
 * Pre-flight file validation ensures security parity with KYC verification policy (#233).
 */
export async function uploadAdminDisputeEvidence(
  disputeId: string,
  { file, note, senderRole = "admin" }: UploadAdminDisputeEvidencePayload = {}
): Promise<UploadAdminDisputeEvidenceResult> {
  if (!disputeId) {
    throw new Error("disputeId is required");
  }

  if (file) {
    const validation = await validateDocumentFile(file, {
      maxBytes: 10 * 1024 * 1024,
      allowedMimeTypes: ["application/pdf", "image/jpeg", "image/png"],
    });

    if (!validation.valid) {
      return {
        success: false,
        error: validation.error || "File validation failed",
      };
    }
  }

  try {
    const formData = new FormData();
    if (file) formData.append("file", file);
    if (note) formData.append("note", note);
    formData.append("senderRole", senderRole);

    const res = await axiosInstance.post(
      `/api/admin/payments/disputes/${disputeId}/evidence`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );

    if (res.data && res.data.success) {
      return res.data;
    }

    return {
      success: false,
      error: res.data?.message || res.data?.error || "Upload rejected by server",
    };
  } catch (error: any) { // TODO(types): Error from dispute evidence upload
    logger.error("Failed to upload admin dispute evidence:", error);
    return {
      success: false,
      error: error.response?.data?.message || error.message || "Failed to upload evidence",
    };
  }
}
