import { useState } from "react";
import { toast } from "sonner";
import {
  assertTargetMatchesFile,
  requestUploadTarget,
  uploadToGovernedTarget,
  validateFile,
  FileValidationOptions,
  UploadTargetKind,
} from "@/lib/utils/cloudinaryUpload";

export type ValidationOptions = FileValidationOptions;
export interface UseCloudinaryUploadResult {
  uploadFile: (file: File | Blob) => Promise<string>;
  uploading: boolean; progress: number; uploadedUrl: string | null; error: string | null; reset: () => void;
}

export const useCloudinaryUpload = (kind: UploadTargetKind, validationOptions: ValidationOptions = {}): UseCloudinaryUploadResult => {
  const [uploading, setUploading] = useState(false); const [progress, setProgress] = useState(0);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null); const [error, setError] = useState<string | null>(null);
  const uploadFile = async (file: File | Blob): Promise<string> => {
    setError(null); setProgress(0); setUploading(true);
    try {
      const validation = typeof File !== "undefined" && file instanceof File ? validateFile(file, validationOptions) : { valid: true, error: null };
      if (!validation.valid) throw new Error(validation.error || "File validation failed");
      const target = await requestUploadTarget({ kind, size: file.size, mimeType: file.type });
      assertTargetMatchesFile(target, file, { kind, size: file.size, mimeType: file.type });
      const result = await uploadToGovernedTarget(file, target, setProgress);
      if (result.status !== "pending_scan" || !result.assetId) throw new Error("Upload was not accepted for scanning");
      setUploadedUrl(result.assetId); return result.assetId;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Upload failed"; setError(message); toast.error(message); throw err;
    } finally { setUploading(false); }
  };
  const reset = () => { setUploading(false); setProgress(0); setUploadedUrl(null); setError(null); };
  return { uploadFile, uploading, progress, uploadedUrl, error, reset };
};

export interface FileUploadError { file: string; error?: string | null }
export interface UseMultipleCloudinaryUploadResult { uploadFiles: (files: FileList | File[]) => Promise<string[]>; uploading: boolean; progress: Record<number, number>; uploadedUrls: string[]; errors: FileUploadError[]; reset: () => void }

export const useMultipleCloudinaryUpload = (kind: UploadTargetKind, validationOptions: ValidationOptions = {}): UseMultipleCloudinaryUploadResult => {
  const [uploading, setUploading] = useState(false); const [progress, setProgress] = useState<Record<number, number>>({});
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]); const [errors, setErrors] = useState<FileUploadError[]>([]);
  const uploadFiles = async (files: FileList | File[]): Promise<string[]> => {
    setErrors([]); setProgress({}); setUploading(true); const urls: string[] = [];
    try { for (const [index, file] of Array.from(files).entries()) { try { urls.push(await (async () => {
      const validation = validateFile(file, validationOptions); if (!validation.valid) throw new Error(validation.error || "File validation failed");
      const target = await requestUploadTarget({ kind, size: file.size, mimeType: file.type }); assertTargetMatchesFile(target, file, { kind, size: file.size, mimeType: file.type });
      const result = await uploadToGovernedTarget(file, target, (value) => setProgress((previous) => ({ ...previous, [index]: value })));
      if (result.status !== "pending_scan") throw new Error("Upload was not accepted for scanning"); return result.assetId;
    })()); } catch (error) { setErrors((previous) => [...previous, { file: file.name, error: error instanceof Error ? error.message : "Upload failed" }]); } }
      setUploadedUrls(urls); return urls;
    } finally { setUploading(false); }
  };
  const reset = () => { setUploading(false); setProgress({}); setUploadedUrls([]); setErrors([]); };
  return { uploadFiles, uploading, progress, uploadedUrls, errors, reset };
};

export default useCloudinaryUpload;
