export type DateTimeValue = string | number | Date;

export interface DateTimeOptions {
  locale?: string;
  timeZone?: string;
  includeTimeZone?: boolean;
}

function toDate(value: DateTimeValue): Date | null {
  const date = value instanceof Date ? new Date(value.getTime()) : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatter(locale: string, options: Intl.DateTimeFormatOptions): Intl.DateTimeFormat {
  try {
    return new Intl.DateTimeFormat(locale, options);
  } catch {
    return new Intl.DateTimeFormat("en", { ...options, timeZone: "UTC" });
  }
}

export function formatDateTime(value: DateTimeValue, options: DateTimeOptions = {}): string {
  const date = toDate(value);
  if (!date) return "Invalid date";
  const locale = options.locale || "en";
  const timeZone = options.timeZone || undefined;
  const result = formatter(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone,
    timeZoneName: options.includeTimeZone === false ? undefined : "short",
  });
  return result.format(date);
}

export function formatDate(value: DateTimeValue, options: DateTimeOptions = {}): string {
  const date = toDate(value);
  if (!date) return "Invalid date";
  return formatter(options.locale || "en", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: options.timeZone || undefined,
  }).format(date);
}

export function formatDateRange(
  start: DateTimeValue,
  end: DateTimeValue,
  options: DateTimeOptions = {}
): string {
  const from = toDate(start);
  const until = toDate(end);
  if (!from || !until) return "Invalid date range";
  return formatter(options.locale || "en", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: options.timeZone || undefined,
    timeZoneName: options.includeTimeZone === false ? undefined : "short",
  }).formatRange(from, until);
}

export function formatRelativeTime(
  value: DateTimeValue,
  now: DateTimeValue = new Date(),
  locale = "en"
): string {
  const date = toDate(value);
  const reference = toDate(now);
  if (!date || !reference) return "Invalid date";
  const seconds = (date.getTime() - reference.getTime()) / 1000;
  const absolute = Math.abs(seconds);
  const [amount, unit] = absolute < 60
    ? [Math.round(seconds), "second"]
    : absolute < 3600
      ? [Math.round(seconds / 60), "minute"]
      : absolute < 86400
        ? [Math.round(seconds / 3600), "hour"]
        : [Math.round(seconds / 86400), "day"];
  return new Intl.RelativeTimeFormat(locale, { numeric: "auto" }).format(amount, unit as Intl.RelativeTimeFormatUnit);
}
