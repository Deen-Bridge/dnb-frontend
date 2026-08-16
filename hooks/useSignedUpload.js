import { useState } from "react";
import { toast } from "sonner";
import { requestSignedUpload } from "@/lib/actions/educators/application";
import { uploadSignedFile } from "@/lib/utils/signed-upload";

/**
 * Upload a sensitive document through the backend-issued signed URL.
 *
 * This is intentionally NOT built on useCloudinaryUpload: government IDs and
 * teaching certificates must never go through the unsigned public preset.
 *
 * @param {string} purpose - document purpose ("government-id" | "teaching-certificate")
 */
export function useSignedUpload(purpose) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadedRef, setUploadedRef] = useState(null);
  const [error, setError] = useState(null);

  /**
   * @param {File} file
   * @returns {Promise<string>} the stored reference (publicId) to send to the backend
   */
  const uploadFile = async (file) => {
    setError(null);
    setProgress(0);
    setUploading(true);

    try {
      const credentials = await requestSignedUpload({
        purpose,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
      });

      await uploadSignedFile(file, credentials, (percent) => setProgress(percent));

      const reference = credentials.publicId ?? credentials.uploadUrl ?? null;
      setUploadedRef(reference);
      return reference;
    } catch (err) {
      const message = err?.message || "Upload failed";
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setUploading(false);
    }
  };

  const reset = () => {
    setUploading(false);
    setProgress(0);
    setUploadedRef(null);
    setError(null);
  };

  return { uploadFile, uploading, progress, uploadedRef, error, reset };
}

export default useSignedUpload;
