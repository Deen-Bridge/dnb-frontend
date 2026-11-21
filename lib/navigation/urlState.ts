const DEFAULT_MAX_LENGTH = 120;

export function readSafeParam(
  params: { get: (key: string) => string | null },
  key: string,
  options: { maxLength?: number; allowed?: readonly string[]; pattern?: RegExp; fallback?: string } = {},
): string {
  const value = params.get(key);
  if (value === null || value.length > (options.maxLength ?? DEFAULT_MAX_LENGTH)) return options.fallback ?? "";
  if (options.allowed && !options.allowed.includes(value)) return options.fallback ?? "";
  if (options.pattern && !options.pattern.test(value)) return options.fallback ?? "";
  return value;
}

export function readSafePage(params: { get: (key: string) => string | null }): number {
  const raw = readSafeParam(params, "page", { maxLength: 3, pattern: /^[1-9]\d{0,2}$/ });
  const page = Number(raw || 1);
  return Number.isSafeInteger(page) && page > 0 && page <= 999 ? page : 1;
}
