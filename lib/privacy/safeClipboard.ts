export type ClipboardClassification = "public" | "authenticated" | "sensitive";

const SECRET_MARKERS = /(?:^|[_-])(token|secret|password|private[_-]?key|api[_-]?key)(?:$|[_-])/i;

export function canCopyToClipboard(
  value: unknown,
  classification: ClipboardClassification = "public",
): value is string {
  if (typeof value !== "string" || value.length === 0) return false;
  if (classification === "sensitive") return false;
  return !SECRET_MARKERS.test(value);
}

export async function copySafeText(
  value: unknown,
  classification: ClipboardClassification = "public",
): Promise<boolean> {
  if (!canCopyToClipboard(value, classification) || typeof navigator === "undefined") {
    return false;
  }
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value);
    return true;
  }
  return false;
}
