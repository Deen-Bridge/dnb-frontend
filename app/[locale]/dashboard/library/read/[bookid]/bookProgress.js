/**
 * Book reader progress + navigation helpers.
 *
 * Pure, DOM-free logic extracted from BookReaderClient so it can be unit
 * tested and reused:
 *   - last-read position persistence in localStorage (`dnb:book-progress:<id>`)
 *   - page clamping
 *   - keyboard-key → target-page resolution
 *
 * All storage helpers guard `typeof window` so they are safe to call during
 * SSR / non-browser environments.
 */

export const PROGRESS_KEY_PREFIX = "dnb:book-progress:";

/** localStorage key for a given book. */
export const bookProgressKey = (bookId) => `${PROGRESS_KEY_PREFIX}${bookId}`;

/**
 * Clamp a page to the valid 1..pageCount range and coerce to an integer.
 * When pageCount is unknown (0/falsy) the lower bound of 1 is still enforced.
 */
export const clampPage = (page, pageCount) => {
  const max = Number.isFinite(pageCount) && pageCount > 0 ? Math.floor(pageCount) : Infinity;
  const value = Math.floor(Number(page));
  if (!Number.isFinite(value)) return 1;
  return Math.min(Math.max(value, 1), max);
};

/**
 * Read a saved reading position for a book.
 * Returns `{ page, updatedAt }` or `null` when absent/invalid.
 */
export const readBookProgress = (bookId) => {
  if (typeof window === "undefined" || !bookId) return null;
  try {
    const raw = window.localStorage.getItem(bookProgressKey(bookId));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    const page = Number(parsed?.page);
    if (!Number.isFinite(page) || page < 1) return null;
    return { page: Math.floor(page), updatedAt: parsed?.updatedAt ?? null };
  } catch {
    return null;
  }
};

/**
 * Persist the current reading position for a book as `{ page, updatedAt }`.
 * Returns true on success. Invalid pages and non-browser envs are no-ops.
 */
export const saveBookProgress = (bookId, page, now = () => new Date().toISOString()) => {
  if (typeof window === "undefined" || !bookId) return false;
  const value = Math.floor(Number(page));
  if (!Number.isFinite(value) || value < 1) return false;
  try {
    window.localStorage.setItem(
      bookProgressKey(bookId),
      JSON.stringify({ page: value, updatedAt: now() })
    );
    return true;
  } catch {
    return false;
  }
};

/** Remove any saved reading position for a book. */
export const clearBookProgress = (bookId) => {
  if (typeof window === "undefined" || !bookId) return false;
  try {
    window.localStorage.removeItem(bookProgressKey(bookId));
    return true;
  } catch {
    return false;
  }
};

/**
 * Resolve a keyboard key to the page it should navigate to.
 *
 * ArrowLeft / PageUp  → previous page
 * ArrowRight / PageDown → next page
 * Home → first page, End → last page
 *
 * Returns the clamped target page, or `null` when the key is not a navigation
 * key or there is no document (`pageCount` falsy).
 */
export const nextPageForKey = (key, current, pageCount) => {
  if (!Number.isFinite(pageCount) || pageCount <= 0) return null;
  let target;
  switch (key) {
    case "ArrowLeft":
    case "PageUp":
      target = current - 1;
      break;
    case "ArrowRight":
    case "PageDown":
      target = current + 1;
      break;
    case "Home":
      target = 1;
      break;
    case "End":
      target = pageCount;
      break;
    default:
      return null;
  }
  return clampPage(target, pageCount);
};

/** Reading progress as a whole-number percentage (0 when unknown). */
export const progressPercent = (page, pageCount) => {
  if (!Number.isFinite(pageCount) || pageCount <= 0) return 0;
  return Math.round((clampPage(page, pageCount) / pageCount) * 100);
};
