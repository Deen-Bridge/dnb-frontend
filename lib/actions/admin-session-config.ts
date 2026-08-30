const MOCK_DELAY_MS = 300;

export interface SessionSecurityConfig {
  idleTimeoutMinutes: number;
  idleWarningSeconds: number;
  reauthAfterMinutes: number;
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

let mockConfig: SessionSecurityConfig = { ...DEFAULT_SESSION_SECURITY_CONFIG };

function withMockDelay<T>(value: T): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), MOCK_DELAY_MS));
}

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

export async function getSessionSecurityConfig(): Promise<SessionSecurityConfig> {
  return withMockDelay({ ...mockConfig });
}

export async function updateSessionSecurityConfig(cfg: SessionSecurityConfig): Promise<SessionSecurityConfig> {
  const { valid, errors } = validateSessionSecurityConfig(cfg);
  if (!valid) {
    const err = new Error("Invalid session-security configuration.") as Error & { fieldErrors?: any }; // TODO(types): Field validation errors map
    err.fieldErrors = errors;
    throw err;
  }
  mockConfig = {
    idleTimeoutMinutes: cfg.idleTimeoutMinutes,
    idleWarningSeconds: cfg.idleWarningSeconds,
    reauthAfterMinutes: cfg.reauthAfterMinutes,
  };
  return withMockDelay({ ...mockConfig });
}
