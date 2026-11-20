import axiosInstance from "@/lib/config/axios.config";

export const SESSION_SECURITY_ENDPOINT = "/api/admin/session-security";

export interface SessionSecurityConfig {
  idleTimeoutMinutes: number;
  idleWarningSeconds: number;
  reauthAfterMinutes: number;
  /** Server revision used to reject stale concurrent edits. */
  version?: number;
  /** Timestamp at which the backend made this policy effective. */
  updatedAt?: string;
}

export const DEFAULT_SESSION_SECURITY_CONFIG: SessionSecurityConfig = Object.freeze({
  idleTimeoutMinutes: 15,
  idleWarningSeconds: 60,
  reauthAfterMinutes: 30,
});

export const SESSION_SECURITY_BOUNDS = Object.freeze({
  idleTimeoutMinutes: Object.freeze({ min: 1, max: 480 }),
  idleWarningSeconds: Object.freeze({ min: 5, max: 600 }),
  reauthAfterMinutes: Object.freeze({ min: 1, max: 1440 }),
});

function isIntegerInRange(value: unknown, { min, max }: { min: number; max: number }): boolean {
  return typeof value === "number" && Number.isInteger(value) && value >= min && value <= max;
}

export interface SessionConfigValidationResult {
  valid: boolean;
  errors: {
    idleTimeoutMinutes?: string;
    idleWarningSeconds?: string;
    reauthAfterMinutes?: string;
  };
}

export function validateSessionSecurityConfig(cfg?: Partial<SessionSecurityConfig>): SessionConfigValidationResult {
  const errors: SessionConfigValidationResult["errors"] = {};
  const c = cfg || {};

  const idleT = SESSION_SECURITY_BOUNDS.idleTimeoutMinutes;
  const idleW = SESSION_SECURITY_BOUNDS.idleWarningSeconds;
  const reauth = SESSION_SECURITY_BOUNDS.reauthAfterMinutes;

  if (!isIntegerInRange(c.idleTimeoutMinutes, idleT)) {
    errors.idleTimeoutMinutes = `Enter a whole number between ${idleT.min} and ${idleT.max} minutes.`;
  }
  if (!isIntegerInRange(c.idleWarningSeconds, idleW)) {
    errors.idleWarningSeconds = `Enter a whole number between ${idleW.min} and ${idleW.max} seconds.`;
  }
  if (!isIntegerInRange(c.reauthAfterMinutes, reauth)) {
    errors.reauthAfterMinutes = `Enter a whole number between ${reauth.min} and ${reauth.max} minutes.`;
  }

  if (
    !errors.idleTimeoutMinutes &&
    !errors.idleWarningSeconds &&
    c.idleWarningSeconds !== undefined &&
    c.idleTimeoutMinutes !== undefined &&
    c.idleWarningSeconds >= c.idleTimeoutMinutes * 60
  ) {
    errors.idleWarningSeconds =
      "The warning lead time must be shorter than the idle timeout.";
  }

  return { valid: Object.keys(errors).length === 0, errors };
}

function policyFromResponse(data: unknown): SessionSecurityConfig {
  const payload = (data as { policy?: SessionSecurityConfig; config?: SessionSecurityConfig } | undefined) || {};
  const policy = payload.policy || payload.config || (data as SessionSecurityConfig);

  if (!policy || typeof policy !== "object") {
    throw new Error("The session-security policy response was invalid.");
  }

  const { valid, errors } = validateSessionSecurityConfig(policy);
  if (!valid) {
    throw new Error(`The server returned an invalid session-security policy: ${Object.values(errors).join(" ")}`);
  }

  return {
    idleTimeoutMinutes: policy.idleTimeoutMinutes,
    idleWarningSeconds: policy.idleWarningSeconds,
    reauthAfterMinutes: policy.reauthAfterMinutes,
    ...(typeof policy.version === "number" ? { version: policy.version } : {}),
    ...(typeof policy.updatedAt === "string" ? { updatedAt: policy.updatedAt } : {}),
  };
}

function serverError(error: any): Error { // TODO(types): Axios error response shape
  const status = error?.response?.status;
  const message = error?.response?.data?.message || error?.response?.data?.error;
  if (status === 409) {
    return Object.assign(
      new Error(message || "This policy changed while you were editing it. Reload the effective policy and try again."),
      { code: "SESSION_POLICY_CONFLICT", status }
    );
  }
  return new Error(message || error?.message || "Unable to load the session-security policy.");
}

export async function getSessionSecurityConfig(): Promise<SessionSecurityConfig> {
  try {
    const response = await axiosInstance.get(SESSION_SECURITY_ENDPOINT);
    return policyFromResponse(response.data);
  } catch (error) {
    throw serverError(error);
  }
}

export async function updateSessionSecurityConfig(
  cfg: SessionSecurityConfig
): Promise<SessionSecurityConfig> {
  const { valid, errors } = validateSessionSecurityConfig(cfg);
  if (!valid) {
    const err = new Error("Invalid session-security configuration.") as Error & {
      fieldErrors?: SessionConfigValidationResult["errors"];
    };
    err.fieldErrors = errors;
    throw err;
  }

  try {
    const response = await axiosInstance.put(SESSION_SECURITY_ENDPOINT, {
      idleTimeoutMinutes: cfg.idleTimeoutMinutes,
      idleWarningSeconds: cfg.idleWarningSeconds,
      reauthAfterMinutes: cfg.reauthAfterMinutes,
      ...(typeof cfg.version === "number" ? { version: cfg.version } : {}),
    });
    return policyFromResponse(response.data);
  } catch (error) {
    throw serverError(error);
  }
}
