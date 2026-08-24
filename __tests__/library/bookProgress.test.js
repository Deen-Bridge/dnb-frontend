/**
 * bookProgress — unit tests
 * -------------------------
 * Covers the pure reader helpers:
 *   - clampPage bounds and integer coercion
 *   - localStorage persistence round-trip and corruption tolerance
 *   - keyboard-key → target-page resolution
 *   - progress percentage
 */

import { describe, it, expect, beforeEach } from "vitest";
import {
  bookProgressKey,
  clampPage,
  clearBookProgress,
  nextPageForKey,
  progressPercent,
  readBookProgress,
  saveBookProgress,
} from "@/app/dashboard/library/read/[bookid]/bookProgress";

beforeEach(() => {
  window.localStorage.clear();
});

describe("clampPage", () => {
  it("clamps below 1 and above pageCount", () => {
    expect(clampPage(0, 10)).toBe(1);
    expect(clampPage(-5, 10)).toBe(1);
    expect(clampPage(999, 10)).toBe(10);
    expect(clampPage(5, 10)).toBe(5);
  });

  it("floors fractional pages", () => {
    expect(clampPage(3.9, 10)).toBe(3);
  });

  it("enforces a floor of 1 when pageCount is unknown", () => {
    expect(clampPage(7, 0)).toBe(7);
    expect(clampPage(0, 0)).toBe(1);
  });

  it("returns 1 for non-numeric input", () => {
    expect(clampPage("abc", 10)).toBe(1);
    expect(clampPage(NaN, 10)).toBe(1);
  });
});

describe("localStorage persistence", () => {
  it("saves and reads back the shape { page, updatedAt }", () => {
    saveBookProgress("book-1", 137, () => "2026-01-01T00:00:00.000Z");
    const stored = JSON.parse(window.localStorage.getItem(bookProgressKey("book-1")));
    expect(stored).toEqual({ page: 137, updatedAt: "2026-01-01T00:00:00.000Z" });

    const progress = readBookProgress("book-1");
    expect(progress.page).toBe(137);
    expect(progress.updatedAt).toBe("2026-01-01T00:00:00.000Z");
  });

  it("returns null when nothing is stored", () => {
    expect(readBookProgress("missing")).toBeNull();
  });

  it("does not persist invalid pages", () => {
    expect(saveBookProgress("book-1", 0)).toBe(false);
    expect(saveBookProgress("book-1", -3)).toBe(false);
    expect(saveBookProgress("book-1", "x")).toBe(false);
    expect(window.localStorage.getItem(bookProgressKey("book-1"))).toBeNull();
  });

  it("tolerates corrupt JSON", () => {
    window.localStorage.setItem(bookProgressKey("book-1"), "{not json");
    expect(readBookProgress("book-1")).toBeNull();
  });

  it("ignores stored entries with an invalid page", () => {
    window.localStorage.setItem(
      bookProgressKey("book-1"),
      JSON.stringify({ page: "nope", updatedAt: "x" })
    );
    expect(readBookProgress("book-1")).toBeNull();
  });

  it("clears a saved position", () => {
    saveBookProgress("book-1", 5);
    clearBookProgress("book-1");
    expect(readBookProgress("book-1")).toBeNull();
  });

  it("no-ops without a bookId", () => {
    expect(saveBookProgress("", 5)).toBe(false);
    expect(readBookProgress("")).toBeNull();
  });
});

describe("nextPageForKey", () => {
  it("maps prev/next keys", () => {
    expect(nextPageForKey("ArrowLeft", 5, 10)).toBe(4);
    expect(nextPageForKey("PageUp", 5, 10)).toBe(4);
    expect(nextPageForKey("ArrowRight", 5, 10)).toBe(6);
    expect(nextPageForKey("PageDown", 5, 10)).toBe(6);
  });

  it("maps Home/End to first/last", () => {
    expect(nextPageForKey("Home", 5, 10)).toBe(1);
    expect(nextPageForKey("End", 5, 10)).toBe(10);
  });

  it("clamps at the edges", () => {
    expect(nextPageForKey("ArrowLeft", 1, 10)).toBe(1);
    expect(nextPageForKey("ArrowRight", 10, 10)).toBe(10);
  });

  it("returns null for non-nav keys and empty docs", () => {
    expect(nextPageForKey("a", 5, 10)).toBeNull();
    expect(nextPageForKey("Enter", 5, 10)).toBeNull();
    expect(nextPageForKey("ArrowRight", 5, 0)).toBeNull();
  });
});

describe("progressPercent", () => {
  it("computes a whole-number percentage", () => {
    expect(progressPercent(137, 400)).toBe(34);
    expect(progressPercent(1, 400)).toBe(0);
    expect(progressPercent(400, 400)).toBe(100);
  });

  it("returns 0 when pageCount is unknown", () => {
    expect(progressPercent(5, 0)).toBe(0);
  });
});
