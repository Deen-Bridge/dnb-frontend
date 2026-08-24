/**
 * Truncates a string to `max` characters on a word boundary, appending an
 * ellipsis. Used to keep meta descriptions (and schema descriptions) within
 * the ~160 character guidance.
 */
export function truncateText(text, max = 160) {
  if (!text) return "";
  const cleaned = String(text).replace(/\s+/g, " ").trim();
  if (cleaned.length <= max) return cleaned;
  return `${cleaned.slice(0, max - 1).trimEnd()}…`;
}