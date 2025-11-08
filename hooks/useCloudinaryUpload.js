import { useState } from "react";
import {
  uploadWithProgress,
  validateFile,
  formatFileSize,
} from "@/lib/utils/cloudinaryUpload";
import { toast } from "sonner";

/**
 * Custom hook for uploading files to Cloudinary
 * @param {string} uploadPreset - Cloudinary upload preset
 * @param {Object} validationOptions - File validation options
 * @returns {Object} - Upload state and functions
 */
export const useCloudinaryUpload = (uploadPreset, validationOptions = {}) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadedUrl, setUploadedUrl] = useState(null);
  const [error, setError] = useState(null);

  /**
   * Upload a single file
   * @param {File} file - File to upload
   * @returns {Promise<string>} - Uploaded file URL
   */
  const uploadFile = async (file) => {
    setError(null);
    setProgress(0);
    setUploading(true);

    try {
      // Validate file
      const validation = validateFile(file, validationOptions);
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      // Upload with progress
      const result = await uploadWithProgress(file, uploadPreset, (percent) => {
        setProgress(percent);
      });

      setUploadedUrl(result.secure_url);

      return result.secure_url;
    } catch (err) {
      const errorMessage = err.message || "Upload failed";
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setUploading(false);
    }
  };

  /**
   * Reset upload state
   */
  const reset = () => {
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

/**
 * Hook for uploading multiple files
 */
export const useMultipleCloudinaryUpload = (
  uploadPreset,
  validationOptions = {}
) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState({});
  const [uploadedUrls, setUploadedUrls] = useState([]);
  const [errors, setErrors] = useState([]);

  /**
   * Upload multiple files
   * @param {FileList|Array<File>} files - Files to upload
   * @returns {Promise<Array<string>>} - Array of uploaded URLs
   */
  const uploadFiles = async (files) => {
    setErrors([]);
    setProgress({});
    setUploading(true);

    try {
      const fileArray = Array.from(files);
      const urls = [];

      // Upload files sequentially for better progress tracking
      for (let i = 0; i < fileArray.length; i++) {
        const file = fileArray[i];

        // Validate file
        const validation = validateFile(file, validationOptions);
        if (!validation.valid) {
          setErrors((prev) => [
            ...prev,
            { file: file.name, error: validation.error },
          ]);
          continue;
        }

        toast.info(`Uploading ${file.name} (${i + 1}/${fileArray.length})`);

        const result = await uploadWithProgress(
          file,
          uploadPreset,
          (percent) => {
            setProgress((prev) => ({
              ...prev,
              [i]: percent,
            }));
          }
        );

        urls.push(result.secure_url);
      }

      setUploadedUrls(urls);
      toast.success(`${urls.length} file(s) uploaded successfully!`);

      return urls;
    } catch (err) {
      toast.error("Some files failed to upload");
      throw err;
    } finally {
      setUploading(false);
    }
  };

  const reset = () => {
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
