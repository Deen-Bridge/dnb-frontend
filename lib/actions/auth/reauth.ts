import axiosInstance from "@/lib/config/axios.config";

const MOCK_DELAY_MS = 500;

export interface ReauthenticateParams {
  password?: string;
}

export interface ReauthenticateResult {
  ok: true;
  reauthAt: string;
}

export async function reauthenticate({ password }: ReauthenticateParams = {}): Promise<ReauthenticateResult> {
  void axiosInstance;

  await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY_MS));

  if (!password || !String(password).trim()) {
    const err = new Error("Incorrect password. Please try again.") as Error & { status?: number };
    err.status = 401;
    throw err;
  }

  return { ok: true, reauthAt: new Date().toISOString() };
}
