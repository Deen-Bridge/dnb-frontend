import { describe, expect, it } from "vitest";
import { toCsv, USER_EXPORT_COLUMNS } from "@/lib/admin/usersCsv";

describe("usersCsv.toCsv", () => {
  const columns = [
    { label: "Name", key: "name" },
    { label: "Note", value: (row) => row.note },
  ];

  it("quotes cells containing commas, quotes and newlines", () => {
    const csv = toCsv([{ name: "Doe, Jane", note: 'says "hi"\nnext line' }], columns);
    expect(csv).toBe('Name,Note\r\n"Doe, Jane","says ""hi""\nnext line"');
  });

  it("guards cells that start with formula triggers", () => {
    const csv = toCsv(
      [
        { name: '=HYPERLINK("x")', note: "+1" },
        { name: "-cmd", note: "@SUM(A1)" },
        { name: "\tTAB", note: "\rCR" },
      ],
      columns
    );
    const lines = csv.split("\r\n");
    expect(lines[1]).toBe(`"'=HYPERLINK(""x"")",'+1`);
    expect(lines[2]).toBe("'-cmd,'@SUM(A1)");
    expect(lines[3]).toBe("'\tTAB,\"'\rCR\"");
  });

  it("leaves numbers, nulls and plain text unchanged", () => {
    const csv = toCsv(
      [
        { name: -5, note: null },
        { name: "plain", note: undefined },
      ],
      columns
    );
    expect(csv.split("\r\n")).toEqual(["Name,Note", "-5,", "plain,"]);
  });

  it("returns only the header for zero rows", () => {
    expect(toCsv([], columns)).toBe("Name,Note");
  });

  it("exports the table columns plus the internal id", () => {
    const csv = toCsv(
      [
        {
          _id: "u1",
          fullName: "Amina Yusuf",
          email: "amina@example.com",
          role: "mentor",
          status: "active",
          createdAt: "2025-03-04T10:00:00.000Z",
        },
      ],
      USER_EXPORT_COLUMNS
    );
    expect(csv.split("\r\n")).toEqual([
      "Name,Email,Role,Status,Signed up,ID",
      "Amina Yusuf,amina@example.com,mentor,active,2025-03-04,u1",
    ]);
  });
});
