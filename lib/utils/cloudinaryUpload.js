import axios from "axios";
import { config } from "@/lib/config/env";

/**
 * Upload file directly to Cloudinary using axios
 * @param {File} file - The file to upload
 * @param {string} uploadPreset - Cloudinary upload preset name
 * @param {function} onProgress - Progress callback (percentage)
 * @returns {Promise<Object>} - Upload result with secure_url
 */
export const uploadToCloudinary = async (file, uploadPreset, onProgress) => {
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
    const response = await axios.post(url, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percentComplete = Math.round(
            (progressEvent.loaded / progressEvent.total) * 100
          );
          onProgress(percentComplete);
        }
      },
    });

    return response.data;
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    throw new Error(
      error.response?.data?.error?.message || error.message || "Upload failed"
    );
  }
};

/**
 * Upload with progress tracking using axios
 * @param {File} file - The file to upload
 * @param {string} uploadPreset - Cloudinary upload preset
 * @param {function} onProgress - Progress callback (0-100)
 * @returns {Promise<Object>} - Upload result
 */
export const uploadWithProgress = async (file, uploadPreset, onProgress) => {
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
    const response = await axios.post(url, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress: (progressEvent) => {
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
  } catch (error) {
    const errorMessage =
      error.response?.data?.error?.message ||
      error.response?.data?.message ||
      error.message ||
      "Upload failed";

    throw new Error(errorMessage);
  }
};

/**
 * Upload multiple files
 * @param {FileList|Array<File>} files - Files to upload
 * @param {string} uploadPreset - Cloudinary upload preset
 * @param {function} onProgress - Progress callback
 * @returns {Promise<Array>} - Array of upload results
 */
export const uploadMultipleFiles = async (files, uploadPreset, onProgress) => {
  const uploadPromises = Array.from(files).map((file, index) => {
    return uploadWithProgress(file, uploadPreset, (progress) => {
      if (onProgress) {
        onProgress(index, progress);
      }
    });
  });

  return Promise.all(uploadPromises);
};

/**
 * Validate file before upload
 * @param {File} file - File to validate
 * @param {Object} options - Validation options
 * @returns {Object} - { valid: boolean, error: string }
 */
export const validateFile = (file, options = {}) => {
  const {
    maxSize = 100 * 1024 * 1024, // 100MB default
    allowedTypes = ["image/*", "video/*"],
  } = options;

  // Check file size
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File size exceeds ${maxSize / 1024 / 1024}MB limit`,
    };
  }

  // Check file type
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

/**
 * Get resource type from file
 * @param {File} file - File object
 * @returns {string} - 'image' or 'video' or 'raw'
 */
export const getResourceType = (file) => {
  if (file.type.startsWith("image/")) return "image";
  if (file.type.startsWith("video/")) return "video";
  return "raw";
};

/**
 * Format file size for display
 * @param {number} bytes - File size in bytes
 * @returns {string} - Formatted size (e.g., "2.5 MB")
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
};

export default {
  uploadToCloudinary,
  uploadWithProgress,
  uploadMultipleFiles,
  validateFile,
  getResourceType,
  formatFileSize,
};
