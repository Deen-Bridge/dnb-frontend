/**
 * Pure CSV helpers for the admin user directory export (issue #226).
 * No DOM or network access here so it can be unit tested directly.
 */

// Leading characters that spreadsheet apps treat as formulas (plus tab/CR,
// which some apps also interpret). Text starting with one of these is
// prefixed with a single quote so it is read as literal text.
const FORMULA_TRIGGER = /^[=+\-@\t\r]/;
const NEEDS_QUOTING = /[",\r\n]/;

function guardFormula(text) {
  return FORMULA_TRIGGER.test(text) ? `'${text}` : text;
}

function escapeCell(value) {
  if (value === null || value === undefined) return "";
  // Numbers and booleans cannot carry a formula, so leave them untouched
  // (this keeps negative amounts like -5 readable).
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  let text = guardFormula(String(value));
  if (NEEDS_QUOTING.test(text)) {
    text = `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

function readColumn(column, row) {
  return typeof column.value === "function" ? column.value(row) : row?.[column.key];
}

/**
 * Serialize rows to RFC 4180 CSV.
 * @param {Array<object>} rows
 * @param {Array<{ label: string, key?: string, value?: (row: object) => unknown }>} columns
 *   `value` takes precedence over `key` when both are given.
 * @returns {string}
 */
export function toCsv(rows, columns) {
  const header = columns.map((column) => escapeCell(column.label)).join(",");
  const body = (rows ?? []).map((row) =>
    columns.map((column) => escapeCell(readColumn(column, row))).join(",")
  );
  return [header, ...body].join("\r\n");
}

function formatSignupDate(value) {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 10);
}

/** Columns mirror the directory table, plus the internal id. */
export const USER_EXPORT_COLUMNS = [
  {
    label: "Name",
    value: (u) => u.fullName ?? u.name ?? u.username ?? "",
  },
  { label: "Email", value: (u) => u.email ?? "" },
  { label: "Role", value: (u) => u.role ?? "" },
  { label: "Status", value: (u) => u.status ?? "active" },
  { label: "Signed up", value: (u) => formatSignupDate(u.createdAt) },
  { label: "ID", value: (u) => u._id ?? u.id ?? "" },
];
