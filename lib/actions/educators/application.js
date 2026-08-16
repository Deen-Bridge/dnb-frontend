import axiosInstance from "@/lib/config/axios.config";

/**
 * Educator application client contract.
 *
 * The backend (EducatorApplication model, signed Cloudinary upload URL, and
 * liveness session token) lives in a separate service; this file is the single
 * client-side definition of that contract so the two repos can stay aligned.
 *
 * Endpoints (base = NEXT_PUBLIC_API_URL):
 *   POST   /api/educator-applications            -> create/submit (status "pending")
 *   POST   /api/educator-applications/skip       -> mark verification "not_started"
 *   GET    /api/educator-applications/me         -> current application + status
 *   POST   /api/educator-applications/upload-url -> signed upload credentials
 *   POST   /api/educator-applications/liveness   -> liveness session token
 *
 * Sensitive documents (gov ID, teaching certificate) MUST go through the
 * signed flow (requestSignedUpload + the returned pre-signed URL), never the
 * unsigned Cloudinary preset used for course thumbnails.
 */

/**
 * Submit a new educator application for review.
 *
 * @param {object} payload - { fullName, linkedinUrl, livenessToken, governmentIdUrl, teachingCertificateUrl }
 * @returns {Promise<object>} { success, application, message }
 */
export async function submitEducatorApplication(payload) {
  const res = await axiosInstance.post("/api/educator-applications", payload);
  return res.data;
}

/**
 * Mark verification as skipped / not started (Path B).
 * @returns {Promise<object>} { success, status, message }
 */
export async function skipEducatorVerification() {
  const res = await axiosInstance.post("/api/educator-applications/skip");
  return res.data;
}

/**
 * Fetch the current user's application and verification status.
 * @returns {Promise<object|null>} application or null when none exists
 */
export async function getEducatorApplication() {
  const res = await axiosInstance.get("/api/educator-applications/me");
  return res.data?.application ?? null;
}

/**
 * Request a pre-signed upload URL for a sensitive document.
 *
 * The server decides the destination (private bucket/folder) and returns a
 * short-lived pre-signed URL the client PUTs the file to directly. No upload
 * preset or Cloudinary secret ever touches the browser.
 *
 * @param {object} params - { purpose, fileName, fileType, fileSize }
 * @returns {Promise<object>} { uploadUrl, publicId, method? }
 */
export async function requestSignedUpload(params) {
  const res = await axiosInstance.post(
    "/api/educator-applications/upload-url",
    params
  );
  return res.data;
}

/**
 * Request a liveness/face-check session token from the verification provider.
 * @returns {Promise<object>} { token, sessionUrl?, message? }
 */
export async function requestLivenessToken() {
  const res = await axiosInstance.post("/api/educator-applications/liveness");
  return res.data;
}
