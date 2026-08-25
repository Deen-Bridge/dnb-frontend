/**
 * CSV export helpers — the standard DeenBridge export path.
 * ---------------------------------------------------------------------------
 * Extracted from the export handlers in the audit-log and reconciliation admin
 * pages so report-style surfaces (including the report builder, #329) share one
 * quoting/escaping implementation instead of duplicating it inline.
 */

/**
 * Quote-escape a single cell for CSV (double-quote wrap + "" escaping).
 * @param {unknown} cell
 * @returns {string}
 */
function escapeCell(cell) {
  return `"${String(cell ?? "").replace(/"/g, '""')}"`;
}

/**
 * Build a CSV document from headers and row arrays.
 *
 * @param {string[]} headers
 * @param {Array<Array<unknown>>} rows
 * @returns {string}
 */
export function rowsToCsv(headers, rows) {
  const lines = [headers.map(escapeCell).join(",")];
  for (const row of rows) {
    lines.push(row.map(escapeCell).join(","));
  }
  return lines.join("\n");
}

/**
 * Serialize and trigger a browser download of the given rows as CSV.
 *
 * @param {{filename: string, headers: string[], rows: Array<Array<unknown>>}} options
 */
export function downloadCsv({ filename, headers, rows }) {
  const csv = rowsToCsv(headers, rows);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
