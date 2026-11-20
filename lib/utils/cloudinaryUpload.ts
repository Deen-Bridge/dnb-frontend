import axios, { AxiosProgressEvent } from "axios";
import { config } from "@/lib/config/env";

export interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
  format?: string;
  width?: number;
  height?: number;
  bytes?: number;
  duration?: number;
  [key: string]: any; // TODO(types): Cloudinary upload response properties
}

export interface FileValidationOptions {
  maxSize?: number;
  allowedTypes?: string[];
}

export interface FileValidationResult {
  valid: boolean;
  error: string | null;
}

export const uploadToCloudinary = async (
  file: File | Blob,
  uploadPreset: string,
  onProgress?: (progress: number) => void
): Promise<CloudinaryUploadResult> => {
  const cloudName = config.cloudinaryCloudName;
  const url = `https://api.cloudinary.com/v1_1/${cloudName}/upload`;

  if (!cloudName) {
    throw new Error("Cloudinary cloud name not configured");
  }

  if (!uploadPreset) {
    throw new Error("Upload preset is required");
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);

  try {
    const response = await axios.post<CloudinaryUploadResult>(url, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress: (progressEvent: AxiosProgressEvent) => {
        if (onProgress && progressEvent.total) {
          const percentComplete = Math.round(
            (progressEvent.loaded / progressEvent.total) * 100
          );
          onProgress(percentComplete);
        }
      },
    });

    return response.data;
  } catch (error: any) { // TODO(types): Cloudinary upload error
    console.error("Cloudinary upload error:", error);
    throw new Error(
      error.response?.data?.error?.message || error.message || "Upload failed"
    );
  }
};

export const uploadWithProgress = async (
  file: File | Blob,
  uploadPreset: string,
  onProgress?: (progress: number) => void
): Promise<CloudinaryUploadResult> => {
  const cloudName = config.cloudinaryCloudName;
  const url = `https://api.cloudinary.com/v1_1/${cloudName}/upload`;

  if (!cloudName) {
    throw new Error("Cloudinary cloud name not configured");
  }

  if (!uploadPreset) {
    throw new Error("Upload preset is required");
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);

  try {
    const response = await axios.post<CloudinaryUploadResult>(url, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress: (progressEvent: AxiosProgressEvent) => {
        if (progressEvent.total) {
          const percentComplete = Math.round(
            (progressEvent.loaded / progressEvent.total) * 100
          );
          if (onProgress) {
            onProgress(percentComplete);
          }
        }
      },
    });

    return response.data;
  } catch (error: any) { // TODO(types): Cloudinary upload error
    const errorMessage =
      error.response?.data?.error?.message ||
      error.response?.data?.message ||
      error.message ||
      "Upload failed";

    throw new Error(errorMessage);
  }
};

export const uploadMultipleFiles = async (
  files: FileList | Array<File>,
  uploadPreset: string,
  onProgress?: (index: number, progress: number) => void
): Promise<CloudinaryUploadResult[]> => {
  const uploadPromises = Array.from(files).map((file, index) => {
    return uploadWithProgress(file, uploadPreset, (progress) => {
      if (onProgress) {
        onProgress(index, progress);
      }
    });
  });

  return Promise.all(uploadPromises);
};

export const validateFile = (file: File, options: FileValidationOptions = {}): FileValidationResult => {
  const {
    maxSize = 100 * 1024 * 1024,
    allowedTypes = ["image/*", "video/*"],
  } = options;

  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File size exceeds ${maxSize / 1024 / 1024}MB limit`,
    };
  }

  const isValidType = allowedTypes.some((type) => {
    if (type.endsWith("/*")) {
      const category = type.split("/")[0];
      return file.type.startsWith(category);
    }
    return file.type === type;
  });

  if (!isValidType) {
    return {
      valid: false,
      error: `File type ${file.type} is not allowed`,
    };
  }

  return { valid: true, error: null };
};

export const getResourceType = (file: File): "image" | "video" | "raw" => {
  if (file.type.startsWith("image/")) return "image";
  if (file.type.startsWith("video/")) return "video";
  return "raw";
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
};

const cloudinaryUpload = {
  uploadToCloudinary,
  uploadWithProgress,
  uploadMultipleFiles,
  validateFile,
  getResourceType,
  formatFileSize,
};

export default cloudinaryUpload;
