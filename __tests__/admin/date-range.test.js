import dayjs from "dayjs";
import { describe, expect, it } from "vitest";
import {
  activePresetId,
  parseDateRange,
  presetRange,
  serializeDateRange,
} from "@/lib/admin/date-range";

const now = dayjs("2025-03-31");

describe("date-range helpers", () => {
  it("defaults to the last 30 days when params are missing or invalid", () => {
    const expected = { from: "2025-03-02", to: "2025-03-31" };
    expect(parseDateRange(new URLSearchParams(), now)).toEqual(expected);
    expect(parseDateRange(new URLSearchParams("from=nope&to=2025-02-30"), now)).toEqual(expected);
    expect(parseDateRange(new URLSearchParams("from=2025-03-10&to=2025-03-01"), now)).toEqual(expected);
  });

  it("round-trips a valid range and preserves other params", () => {
    const params = serializeDateRange(
      { from: "2025-01-01", to: "2025-01-31" },
      new URLSearchParams("tab=x")
    );
    expect(params.get("tab")).toBe("x");
    expect(parseDateRange(params, now)).toEqual({ from: "2025-01-01", to: "2025-01-31" });
  });

  it("detects presets", () => {
    expect(activePresetId(presetRange(7, now), now)).toBe("7d");
    expect(activePresetId({ from: "2025-01-01", to: "2025-01-02" }, now)).toBe("custom");
  });
});
