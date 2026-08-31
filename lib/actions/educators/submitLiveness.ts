import axiosInstance from "@/lib/config/axios.config";

export interface SubmitLivenessPayload {
  userId: string;
  verificationToken: string;
  consentAt: number;
  consentVersion: string;
}

export async function submitLiveness({
  userId,
  verificationToken,
  consentAt,
  consentVersion,
}: SubmitLivenessPayload): Promise<{ success: boolean; message?: string }> {
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
        verificationToken,
        consent: {
          recordedAt: consentAt,
          policyVersion: consentVersion,
        },
      }
    );

    return res.data ?? { success: true };
  } catch (err: any) { // TODO(types): Axios error on liveness submission
    const message =
      err?.response?.data?.message ??
      err?.message ??
      "Failed to submit verification result";
    throw new Error(message);
  }
}
