import axios from "axios";

/**
 * Signed upload flow for sensitive educator documents.
 *
 * Unlike hooks/useCloudinaryUpload.js (which POSTs to Cloudinary with an
 * unsigned `upload_preset`), this flow uploads to a short-lived pre-signed URL
 * issued by our backend. No preset or secret is ever used client-side.
 */

/**
 * Hard guard: a signed flow must never carry an unsigned upload preset.
 * @param {object} [params] - signed-upload credentials
 */
export function assertNoUploadPreset(params = {}) {
  if (params && typeof params === "object") {
    const keys = Object.keys(params).map((k) => k.toLowerCase());
    if (keys.includes("upload_preset")) {
      throw new Error(
        "Sensitive documents must use the signed flow, not an unsigned upload preset"
      );
    }
  }
  return params;
}

/**
 * Build the upload request for a signed URL. Pure and node-safe for tests.
 *
 * @param {File|Blob} file
 * @param {object} credentials - { uploadUrl, publicId, method? }
 * @returns {object} { url, method, headers, body, publicId }
 */
export function buildSignedUploadRequest(file, credentials = {}) {
  const { uploadUrl, publicId, method = "PUT" } = credentials || {};

  if (!uploadUrl) {
    throw new Error("Missing signed upload URL");
  }

  return {
    url: uploadUrl,
    method,
    headers: {
      "Content-Type": file?.type || "application/octet-stream",
    },
    body: file,
    publicId: publicId ?? null,
  };
}

/**
 * Upload a file to its pre-signed URL.
 *
 * @param {File|Blob} file
 * @param {object} credentials - { uploadUrl, publicId, method? }
 * @param {function} [onProgress] - percent callback
 * @returns {Promise<object>} axios response
 */
export async function uploadSignedFile(file, credentials, onProgress) {
  assertNoUploadPreset(credentials);
  const request = buildSignedUploadRequest(file, credentials);

  return axios.request({
    url: request.url,
    method: request.method,
    data: request.body,
    headers: request.headers,
    onUploadProgress: (progressEvent) => {
      if (progressEvent.total && onProgress) {
        onProgress(Math.round((progressEvent.loaded / progressEvent.total) * 100));
      }
    },
  });
}
