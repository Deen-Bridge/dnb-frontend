import axiosInstance from "@/lib/config/axios.config";

export const MAX_BATCH_SIZE = 25;
export const VERIFICATION_STATUS = Object.freeze({ PENDING: "pending", UNDER_REVIEW: "under_review", APPROVED: "approved", REJECTED: "rejected" });
export type VerificationStatus = typeof VERIFICATION_STATUS[keyof typeof VERIFICATION_STATUS];
export interface RejectionReasonCategory { value: string; label: string; }
export const REJECTION_REASON_CATEGORIES: readonly RejectionReasonCategory[] = Object.freeze([
  { value: "identity", label: "Identity could not be verified" },
  { value: "credentials", label: "Credentials could not be verified" },
  { value: "incomplete", label: "Application is incomplete" },
  { value: "quality", label: "Quality requirements were not met" },
  { value: "other", label: "Other" },
]);
export const REJECTION_REASON_MAP = Object.freeze(Object.fromEntries(REJECTION_REASON_CATEGORIES.map(({ value, label }) => [value, label])));
export interface VerificationDocument { type: string; url: string; status?: string; }
export interface VerificationApplication { id: string; status: VerificationStatus | string; name?: string; email?: string; documents?: VerificationDocument[]; [key: string]: unknown; }
export interface FetchVerificationQueueParams { page?: number; limit?: number; status?: string; search?: string; }
export interface VerificationQueueCounts { all: number; pending: number; under_review: number; approved: number; rejected: number; }
export interface FetchVerificationQueueResult { applications: VerificationApplication[]; pagination?: Record<string, unknown>; counts?: VerificationQueueCounts; }
export interface VerificationContext { name?: string; email?: string; }
export interface RejectVerificationPayload { reasonCategory: string; notes?: string; }
export interface BulkDecisionItem { id: string; name?: string; email?: string; }
export interface BulkDecisionProgressEvent { current: number; total: number; percent: number; currentItem: BulkDecisionItem | null; results: BulkDecisionItemResult[]; }
export interface BulkDecisionItemResult { item: BulkDecisionItem; success: boolean; error?: string; }
export interface SequentialBulkDecisionsOptions { items?: BulkDecisionItem[]; action: "approve" | "reject" | string; reasonCategory?: string; notes?: string; onProgress?: (progress: BulkDecisionProgressEvent) => void; }
export interface SequentialBulkDecisionsResult { succeeded: BulkDecisionItemResult[]; failed: BulkDecisionItemResult[]; total: number; }

function requireApiData<T>(data: T | undefined, message: string): T { if (data === undefined || data === null) throw new Error(message); return data; }
export async function fetchVerificationQueue(params: FetchVerificationQueueParams = {}): Promise<FetchVerificationQueueResult> {
  const response = await axiosInstance.get("/api/admin/educator-verification", { params });
  return requireApiData(response.data, "The verification queue is unavailable.");
}
export async function fetchVerificationDetail(applicationId: string): Promise<{ application: VerificationApplication }> {
  if (!applicationId) throw new Error("applicationId is required");
  const response = await axiosInstance.get(`/api/admin/educator-verification/${encodeURIComponent(applicationId)}`);
  return requireApiData(response.data, "The verification application is unavailable.");
}
type DecisionError = { response?: { status?: number; data?: { status?: string } } };
async function getCurrentVerificationStatus(applicationId: string): Promise<string> { return (await fetchVerificationDetail(applicationId)).application.status; }
function statusFromDecisionConflict(error: DecisionError): string | undefined { return error.response?.data?.status; }
export async function approveVerification(applicationId: string, _context: VerificationContext = {}) {
  if (!applicationId) throw new Error("applicationId is required");
  try { const response = await axiosInstance.post(`/api/admin/educator-verification/${encodeURIComponent(applicationId)}/approve`); return requireApiData(response.data, "The server did not confirm approval."); }
  catch (caught) { const error = caught as DecisionError; if (error.response?.status === 409) return { application: { id: applicationId, status: statusFromDecisionConflict(error) || await getCurrentVerificationStatus(applicationId) }, conflict: true }; throw caught; }
}
export async function rejectVerification(applicationId: string, payload: RejectVerificationPayload, _context: VerificationContext = {}) {
  if (!applicationId) throw new Error("applicationId is required");
  if (!payload?.reasonCategory) throw new Error("reasonCategory is required");
  try { const response = await axiosInstance.post(`/api/admin/educator-verification/${encodeURIComponent(applicationId)}/reject`, { reasonCategory: payload.reasonCategory, notes: payload.notes || "" }); return requireApiData(response.data, "The server did not confirm rejection."); }
  catch (caught) { const error = caught as DecisionError; if (error.response?.status === 409) return { application: { id: applicationId, status: statusFromDecisionConflict(error) || await getCurrentVerificationStatus(applicationId) }, conflict: true }; throw caught; }
}
export async function executeSequentialBulkDecisions({ items = [], action, reasonCategory, notes, onProgress }: SequentialBulkDecisionsOptions): Promise<SequentialBulkDecisionsResult> {
  if (action === "reject" && !reasonCategory) throw new Error("Bulk reject requires choosing one shared reason category.");
  const batch = items.slice(0, MAX_BATCH_SIZE), succeeded: BulkDecisionItemResult[] = [], failed: BulkDecisionItemResult[] = [];
  for (let index = 0; index < batch.length; index += 1) { const item = batch[index]; onProgress?.({ current: index, total: batch.length, percent: Math.round(index / batch.length * 100), currentItem: item, results: [...succeeded, ...failed] }); try { if (action === "approve") await approveVerification(item.id, item); else if (action === "reject") await rejectVerification(item.id, { reasonCategory: reasonCategory!, notes }, item); else throw new Error(`Unsupported bulk action: ${action}`); succeeded.push({ item, success: true }); } catch (error) { failed.push({ item, success: false, error: error instanceof Error ? error.message : "Failed to process decision" }); } }
  onProgress?.({ current: batch.length, total: batch.length, percent: 100, currentItem: null, results: [...succeeded, ...failed] });
  return { succeeded, failed, total: batch.length };
}
