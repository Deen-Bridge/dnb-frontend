import { logger } from "@/lib/logger";
import axiosInstance from "@/lib/config/axios.config";
import { validateDocumentFile } from "@/lib/verification/documents/policy";

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
