import axiosInstance from "@/lib/config/axios.config";

export const PRIVACY_REQUEST_LIMIT = 25;

const REQUEST_PATHS = {
  export: "/api/admin/privacy/exports",
  deletion: "/api/admin/privacy/deletions",
} as const;

export type PrivacyRequestType = keyof typeof REQUEST_PATHS;

export interface PrivacyRequest {
  id: string;
  userEmail: string;
  status: "pending" | "processing" | "completed" | "failed" | "expired" | string;
  requestedAt: string;
  completedAt?: string | null;
  downloadUrl?: string | null;
  expiresAt?: string | null;
  reason?: string | null;
  [key: string]: unknown;
}

export interface PrivacyRequestPage {
  requests: PrivacyRequest[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasNextPage: boolean;
  };
}

function errorMessage(error: any, fallback: string): string {
  return error?.response?.data?.message || error?.message || fallback;
}

function normalizePage(data: any, page: number, limit: number): PrivacyRequestPage {
  const requests = Array.isArray(data) ? data : data?.requests ?? data?.items ?? [];
  const pagination = data?.pagination ?? {};
  const total = Number(pagination.total ?? data?.total ?? requests.length);

  return {
    requests,
    pagination: {
      page: Number(pagination.page ?? page),
      limit: Number(pagination.limit ?? limit),
      total,
      hasNextPage: Boolean(pagination.hasNextPage ?? page * limit < total),
    },
  };
}

export async function listPrivacyRequests(
  type: PrivacyRequestType,
  { page = 1, limit = PRIVACY_REQUEST_LIMIT, status }: { page?: number; limit?: number; status?: string } = {}
): Promise<PrivacyRequestPage> {
  try {
    const response = await axiosInstance.get(REQUEST_PATHS[type], {
      params: { page, limit, ...(status ? { status } : {}) },
    });
    return normalizePage(response.data, page, limit);
  } catch (error) {
    throw new Error(errorMessage(error, `Failed to load ${type} privacy requests`));
  }
}

export async function processPrivacyRequest(type: PrivacyRequestType, requestId: string) {
  if (!requestId) throw new Error("A privacy request ID is required");

  try {
    const response = await axiosInstance.post(
      `${REQUEST_PATHS[type]}/${encodeURIComponent(requestId)}/process`,
      {},
      {
        // The backend must treat this key as the operation identity. Replaying
        // a completed operation is therefore safe and returns its current state.
        headers: { "Idempotency-Key": `${type}:${requestId}` },
        retryOnServerError: true,
      }
    );
    return response.data?.request ?? response.data;
  } catch (error) {
    throw new Error(errorMessage(error, `Failed to process ${type} privacy request`));
  }
}
