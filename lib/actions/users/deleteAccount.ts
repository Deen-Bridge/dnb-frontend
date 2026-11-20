import axiosInstance from "@/lib/config/axios.config";
import { reauthenticate } from "@/lib/actions/auth/reauth";

export interface DeleteAccountParams {
  userId: string;
  password: string;
}

export interface DeleteAccountResult {
  success: true;
  status: "completed";
  reauthAt: string;
}

/**
 * Step-up and submit the existing self-delete endpoint exactly once.
 * The idempotency key lets a backend that supports retries collapse duplicate
 * submissions without the UI issuing a second destructive request.
 */
export async function deleteAccount({ userId, password }: DeleteAccountParams): Promise<DeleteAccountResult> {
  if (!userId) throw new Error("A signed-in account is required.");
  const verification = await reauthenticate({ password });
  const idempotencyKey = `account-delete:${userId}:${verification.reauthAt}`;

  await axiosInstance.delete(`/api/users/${encodeURIComponent(userId)}`, {
    headers: {
      "Idempotency-Key": idempotencyKey,
      "X-Reauth-At": verification.reauthAt,
    },
  });

  return { success: true, status: "completed", reauthAt: verification.reauthAt };
}
