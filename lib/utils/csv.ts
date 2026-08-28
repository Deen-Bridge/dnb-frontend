function escapeCell(cell: unknown): string {
  return `"${String(cell ?? "").replace(/"/g, '""')}"`;
}

export function rowsToCsv(headers: string[], rows: Array<Array<unknown>>): string {
  const lines = [headers.map(escapeCell).join(",")];
  for (const row of rows) {
    lines.push(row.map(escapeCell).join(","));
  }
  return lines.join("\n");
}

export interface DownloadCsvOptions {
  filename: string;
  headers: string[];
  rows: Array<Array<unknown>>;
}

export function downloadCsv({ filename, headers, rows }: DownloadCsvOptions): void {
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
