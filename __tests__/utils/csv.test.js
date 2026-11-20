/**
 * CSV export helpers (#329).
 * ------------------------------------------------------------------
 * The report builder and the existing admin export handlers share the same
 * quoting/escaping path; these tests pin the shared serializer.
 */
import { describe, it, expect } from "vitest";
import { rowsToCsv } from "@/lib/utils/csv";

describe("rowsToCsv", () => {
  it("serializes headers and rows", () => {
    const csv = rowsToCsv(["Name", "Role"], [["Amina", "student"]]);
    expect(csv).toBe('"Name","Role"\n"Amina","student"');
  });

  it("quote-escapes cells containing commas and quotes", () => {
    const csv = rowsToCsv(["Note"], [['He said "hi", ok']]);
    expect(csv).toBe('"Note"\n"He said ""hi"", ok"');
  });

  it("treats null/undefined cells as empty strings", () => {
    const csv = rowsToCsv(["A", "B"], [[null, undefined]]);
    expect(csv).toBe('"A","B"\n"",""');
  });
});
