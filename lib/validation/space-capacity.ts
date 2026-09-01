export interface SettingRange {
  min: number;
  max: number;
}

export const PLATFORM_LIMITS: Record<string, SettingRange> = {
  maxConcurrentSpaces: { min: 1, max: 500 },
  defaultMaxParticipants: { min: 2, max: 1000 },
  minLeadTimeMinutes: { min: 0, max: 10080 },
};

export function validateSettingRange(name: string, value: unknown, { min, max }: SettingRange): string | null {
  if (value === "" || value === null || value === undefined) {
    return `${name} is required`;
  }
  const num = Number(value);
  if (!Number.isFinite(num) || !Number.isInteger(num)) {
    return `${name} must be a whole number`;
  }
  if (num < min) return `${name} must be at least ${min}`;
  if (num > max) return `${name} must be at most ${max}`;
  return null;
}

export interface CapacitySettingsParams {
  maxConcurrentSpaces?: unknown;
  defaultMaxParticipants?: unknown;
  minLeadTimeMinutes?: unknown;
}

export interface CapacitySettingsValidationResult {
  maxConcurrentSpaces: string | null;
  defaultMaxParticipants: string | null;
  minLeadTimeMinutes: string | null;
}

export function validateCapacitySettings({
  maxConcurrentSpaces,
  defaultMaxParticipants,
  minLeadTimeMinutes,
}: CapacitySettingsParams = {}): CapacitySettingsValidationResult {
  return {
    maxConcurrentSpaces: validateSettingRange(
      "Max concurrent live spaces",
      maxConcurrentSpaces,
      PLATFORM_LIMITS.maxConcurrentSpaces
    ),
    defaultMaxParticipants: validateSettingRange(
      "Default max participants",
      defaultMaxParticipants,
      PLATFORM_LIMITS.defaultMaxParticipants
    ),
    minLeadTimeMinutes: validateSettingRange(
      "Minimum lead time",
      minLeadTimeMinutes,
      PLATFORM_LIMITS.minLeadTimeMinutes
    ),
  };
}

export function hasValidationErrors(errors: Record<string, string | null>): boolean {
  return Object.values(errors).some(Boolean);
}

export function formatLeadTime(minutes: number): string {
  if (minutes === 0) return "No lead time";
  const days = Math.floor(minutes / 1440);
  const hours = Math.floor((minutes % 1440) / 60);
  const mins = minutes % 60;

  const parts: string[] = [];
  if (days) parts.push(`${days} day${days !== 1 ? "s" : ""}`);
  if (hours) parts.push(`${hours} hour${hours !== 1 ? "s" : ""}`);
  if (mins) parts.push(`${mins} min${mins !== 1 ? "s" : ""}`);
  return parts.join(" ");
}
