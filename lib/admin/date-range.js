/**
 * Serializable date-range state for admin analytics filters (#216).
 *
 * Shape: { from: "YYYY-MM-DD", to: "YYYY-MM-DD" } (inclusive, local days).
 * URL form: ?from=2025-01-01&to=2025-01-31. Missing or invalid params fall
 * back to the default preset (last 30 days), so the URL never breaks a page.
 */
import dayjs from "dayjs";

export const DATE_FORMAT = "YYYY-MM-DD";
export const DEFAULT_PRESET_DAYS = 30;

/** Presets offered by the filter bar. `days: null` means "custom". */
export const DATE_PRESETS = [
  { id: "7d", label: "Last 7 days", days: 7 },
  { id: "30d", label: "Last 30 days", days: 30 },
];

/** Range ending today and covering `days` days (inclusive). */
export function presetRange(days = DEFAULT_PRESET_DAYS, now = dayjs()) {
  return {
    from: now.subtract(days - 1, "day").format(DATE_FORMAT),
    to: now.format(DATE_FORMAT),
  };
}

function validDay(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const d = dayjs(value, DATE_FORMAT, true);
  return d.isValid() && d.format(DATE_FORMAT) === value ? value : null;
}

/**
 * Parse URLSearchParams (or a plain object, e.g. Next `searchParams`) into a
 * valid range. Invalid input, or from > to, yields the default preset.
 */
export function parseDateRange(params, now = dayjs()) {
  const get = (k) => {
    const v = typeof params?.get === "function" ? params.get(k) : params?.[k];
    return Array.isArray(v) ? v[0] : v;
  };
  const from = validDay(get("from"));
  const to = validDay(get("to"));
  if (from && to && from <= to) return { from, to };
  return presetRange(DEFAULT_PRESET_DAYS, now);
}

/** Write a range into a copy of the given params, preserving other keys. */
export function serializeDateRange(range, params) {
  const next = new URLSearchParams(params?.toString?.() ?? "");
  next.set("from", range.from);
  next.set("to", range.to);
  return next;
}

/** Id of the preset matching `range` ending today, or "custom". */
export function activePresetId(range, now = dayjs()) {
  const match = DATE_PRESETS.find((p) => {
    const r = presetRange(p.days, now);
    return r.from === range.from && r.to === range.to;
  });
  return match ? match.id : "custom";
}
