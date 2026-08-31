import { useState } from "react";
import {
  uploadWithProgress,
  validateFile,
  FileValidationOptions,
} from "@/lib/utils/cloudinaryUpload";
import { toast } from "sonner";

export type ValidationOptions = FileValidationOptions;

export interface UseCloudinaryUploadResult {
  uploadFile: (file: File) => Promise<string>;
  uploading: boolean;
  progress: number;
  uploadedUrl: string | null;
  error: string | null;
  reset: () => void;
}

export const useCloudinaryUpload = (
  uploadPreset: string,
  validationOptions: ValidationOptions = {}
): UseCloudinaryUploadResult => {
  const [uploading, setUploading] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const uploadFile = async (file: File): Promise<string> => {
    setError(null);
    setProgress(0);
    setUploading(true);

    try {
      const validation = validateFile(file, validationOptions);
      if (!validation.valid) {
        throw new Error(validation.error || "File validation failed");
      }

      const result = await uploadWithProgress(file, uploadPreset, (percent) => {
        setProgress(percent);
      });

      setUploadedUrl(result.secure_url);

      return result.secure_url;
    } catch (err: any) { // TODO(types): Cloudinary upload error
      const errorMessage = err.message || "Upload failed";
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setUploading(false);
    }
  };

  const reset = (): void => {
    setUploading(false);
    setProgress(0);
    setUploadedUrl(null);
    setError(null);
  };

  return {
    uploadFile,
    uploading,
    progress,
    uploadedUrl,
    error,
    reset,
  };
};

export interface FileUploadError {
  file: string;
  error?: string | null;
}

export interface UseMultipleCloudinaryUploadResult {
  uploadFiles: (files: FileList | File[]) => Promise<string[]>;
  uploading: boolean;
  progress: Record<number, number>;
  uploadedUrls: string[];
  errors: FileUploadError[];
  reset: () => void;
}

export const useMultipleCloudinaryUpload = (
  uploadPreset: string,
  validationOptions: ValidationOptions = {}
): UseMultipleCloudinaryUploadResult => {
  const [uploading, setUploading] = useState<boolean>(false);
  const [progress, setProgress] = useState<Record<number, number>>({});
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);
  const [errors, setErrors] = useState<FileUploadError[]>([]);

  const uploadFiles = async (files: FileList | File[]): Promise<string[]> => {
    setErrors([]);
    setProgress({});
    setUploading(true);

    try {
      const fileArray = Array.from(files);
      const urls: string[] = [];

      for (let i = 0; i < fileArray.length; i++) {
        const file = fileArray[i];

        const validation = validateFile(file, validationOptions);
        if (!validation.valid) {
          setErrors((prev) => [
            ...prev,
            { file: file.name, error: validation.error || "File validation failed" },
          ]);
          continue;
        }

        toast.info(`Uploading ${file.name} (${i + 1}/${fileArray.length})`);

        const result = await uploadWithProgress(
          file,
          uploadPreset,
          (percent) => {
            setProgress((prev) => ({ ...prev, [i]: percent }));
          }
        );

        urls.push(result.secure_url);
      }

      setUploadedUrls(urls);
      return urls;
    } catch (err: any) { // TODO(types): Multiple cloudinary upload error
      const errorMessage = err.message || "Failed to upload some files";
      toast.error(errorMessage);
      throw err;
    } finally {
      setUploading(false);
    }
  };

  const reset = (): void => {
    setUploading(false);
    setProgress({});
    setUploadedUrls([]);
    setErrors([]);
  };

  return {
    uploadFiles,
    uploading,
    progress,
    uploadedUrls,
    errors,
    reset,
  };
};

export default useCloudinaryUpload;
