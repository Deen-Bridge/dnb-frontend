/**
 * submitLiveness
 * --------------
 * Forwards the short-lived verification token (and the consent record) to the
 * backend EducatorApplication (C1) endpoint.
 *
 * Security invariants
 * -------------------
 * - ONLY the provider-issued token, userId, consentAt, and consentVersion are
 *   sent.  Raw video frames, face vectors, and any other biometric data are
 *   never present here.
 * - The token is a transient in-memory value; the caller (LivenessCapture) is
 *   responsible for clearing it from context immediately after this call
 *   returns (success or failure).
 * - This function never writes anything to localStorage, sessionStorage, or
 *   cookies.
 *
 * @param {Object} payload
 * @param {string} payload.userId            - Authenticated user's DB id.
 * @param {string} payload.verificationToken - Short-lived token from the liveness provider.
 * @param {number} payload.consentAt         - Unix-ms timestamp of explicit consent.
 * @param {string} payload.consentVersion    - Policy version the user consented to.
 * @returns {Promise<{ success: boolean, message?: string }>}
 */
import axiosInstance from "@/lib/config/axios.config";

export async function submitLiveness({
  userId,
  verificationToken,
  consentAt,
  consentVersion,
}) {
  if (!userId) throw new Error("submitLiveness: userId is required");
  if (!verificationToken)
    throw new Error("submitLiveness: verificationToken is required");
  if (!consentAt) throw new Error("submitLiveness: consentAt is required");
  if (!consentVersion)
    throw new Error("submitLiveness: consentVersion is required");

  try {
    const res = await axiosInstance.post(
      `/api/educators/applications/liveness`,
      {
        userId,
        // Token forwarded as-is — the backend verifies it with the provider.
        verificationToken,
        consent: {
          recordedAt: consentAt,
          policyVersion: consentVersion,
        },
      }
    );

    return res.data ?? { success: true };
  } catch (err) {
    const message =
      err?.response?.data?.message ??
      err?.message ??
      "Failed to submit verification result";
    throw new Error(message);
  }
}
