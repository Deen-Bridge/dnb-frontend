import axios, { AxiosProgressEvent } from "axios";
import axiosInstance from "@/lib/config/axios.config";

export type UploadTargetKind = "course-thumbnail" | "course-video" | "reel-poster";

export interface UploadIntent {
  kind: UploadTargetKind;
  size: number;
  mimeType: string;
}

export interface UploadTarget {
  url: string;
  method?: "PUT" | "POST";
  headers?: Record<string, string>;
  expiresAt: string;
  constraints: { kind: UploadTargetKind; maxBytes: number; mimeTypes: string[]; folder: string };
  assetId: string;
}

export interface UploadResult {
  assetId: string;
  status: "pending_scan";
  resourceType: "image" | "video";
}

export interface FileValidationOptions { maxSize?: number; allowedTypes?: string[] }
export interface FileValidationResult { valid: boolean; error: string | null }

function matchesMime(pattern: string, mimeType: string): boolean {
  return pattern.endsWith("/*") ? mimeType.startsWith(pattern.slice(0, -1)) : pattern === mimeType;
}

export const validateFile = (file: File, options: FileValidationOptions = {}): FileValidationResult => {
  const { maxSize = 100 * 1024 * 1024, allowedTypes = ["image/*", "video/*"] } = options;
  if (file.size > maxSize) return { valid: false, error: `File size exceeds ${maxSize / 1024 / 1024}MB limit` };
  if (!allowedTypes.some((type) => matchesMime(type, file.type))) return { valid: false, error: `File type ${file.type} is not allowed` };
  return { valid: true, error: null };
};

export const getResourceType = (file: File): "image" | "video" | "raw" =>
  file.type.startsWith("image/") ? "image" : file.type.startsWith("video/") ? "video" : "raw";

export function assertTargetMatchesFile(target: UploadTarget, file: File | Blob, intent: UploadIntent): void {
  if (!target?.url || !target.assetId || !target.expiresAt || !target.constraints) throw new Error("The upload service returned an incomplete target");
  if (Date.parse(target.expiresAt) <= Date.now()) throw new Error("The upload target has expired");
  const { constraints } = target;
  if (constraints.kind !== intent.kind || constraints.folder.trim() === "") throw new Error("The upload target is not authorized for this asset");
  if (file.size > constraints.maxBytes || file.size !== intent.size) throw new Error("The file exceeds the authorized upload size");
  if (!constraints.mimeTypes.some((type) => matchesMime(type, file.type))) throw new Error("The file type is not authorized by the upload target");
}

export async function requestUploadTarget(intent: UploadIntent): Promise<UploadTarget> {
  const response = await axiosInstance.post<UploadTarget>("/api/uploads/targets", intent);
  return response.data;
}

export async function uploadToGovernedTarget(file: File | Blob, target: UploadTarget, onProgress?: (progress: number) => void): Promise<UploadResult> {
  const response = await axios.request<UploadResult>({
    url: target.url,
    method: target.method ?? "PUT",
    data: file,
    headers: { "Content-Type": file.type || "application/octet-stream", ...target.headers },
    onUploadProgress: (event: AxiosProgressEvent) => { if (event.total && onProgress) onProgress(Math.round((event.loaded / event.total) * 100)); },
  });
  return response.data;
}

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024; const sizes = ["Bytes", "KB", "MB", "GB"]; const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${Math.round((bytes / Math.pow(k, i)) * 100) / 100} ${sizes[i]}`;
};

export default { requestUploadTarget, uploadToGovernedTarget, assertTargetMatchesFile, validateFile, getResourceType, formatFileSize };
