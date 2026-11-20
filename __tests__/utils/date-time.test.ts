import { describe, expect, it } from "vitest";
import { formatDate, formatDateRange, formatDateTime, formatRelativeTime } from "@/lib/utils/date-time";

const timestamp = "2026-03-08T01:30:00.000Z";

describe("date-time policy", () => {
  it("formats the same instant deterministically in the requested timezone", () => {
    expect(formatDateTime(timestamp, { locale: "en-US", timeZone: "America/New_York" }))
      .toContain("Mar 7, 2026");
    expect(formatDateTime(timestamp, { locale: "ar", timeZone: "Africa/Lagos" }))
      .not.toBe("Invalid date");
  });

  it("handles DST and date-boundary ranges without local parsing", () => {
    expect(formatDateRange(
      "2026-03-08T06:30:00.000Z",
      "2026-03-08T07:30:00.000Z",
      { locale: "en-US", timeZone: "America/New_York" }
    )).toContain("Mar 8, 2026");
  });

  it("returns truthful values for invalid dates and relative times", () => {
    expect(formatDate("not-a-date")).toBe("Invalid date");
    expect(formatRelativeTime("2026-03-08T01:31:00.000Z", timestamp, "en")).toBe("in 60 seconds");
  });
});
