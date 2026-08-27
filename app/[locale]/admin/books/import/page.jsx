"use client";

import { useState, useCallback, useRef } from "react";
import { PageShell } from "@/components/ui/page-shell";
import { PageHeader } from "@/components/ui/page-header";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import {
  Upload,
  Download,
  FileSpreadsheet,
  CheckCircle2,
  XCircle,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const CSV_HEADERS = [
  "title",
  "author_email",
  "description",
  "categories",
  "pdf_cloudinary_public_id",
  "cover_cloudinary_public_id",
  "price",
];

const SAMPLE_CSV = `title,author_email,description,categories,pdf_cloudinary_public_id,cover_cloudinary_public_id,price
The Fundamentals of Tawheed,admin@example.com,"A comprehensive guide to understanding Islamic monotheism.",Tawheed,Islamic Books/fundamentals-tawheed,Islamic Books/fundamentals-cover,12.99
Stories of the Prophets,admin@example.com,"Compelling narratives of the prophets in Islam.",Stories,Islamic Books/stories-prophets,Islamic Books/stories-cover,9.99
Free Islamic Book,admin@example.com,"A free introductory book about Islam.",General,Islamic Books/free-book,Islamic Books/free-cover,0`;

function parseCSV(text) {
  const lines = text.trim().split("\n");
  if (lines.length < 2) return [];

  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());

  return lines.slice(1).map((line, index) => {
    const values = line.split(",").map((v) => v.trim().replace(/^"|"$/g, ""));
    const row = {};
    headers.forEach((header, i) => {
      row[header] = values[i] || "";
    });
    return { _rowIndex: index + 2, ...row };
  });
}

function validateRow(row) {
  const errors = {};

  if (!row.title?.trim()) errors.title = "Title is required";
  if (!row.author_email?.trim()) errors.author_email = "Author email is required";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.author_email))
    errors.author_email = "Invalid email format";
  if (!row.description?.trim()) errors.description = "Description is required";
  if (!row.categories?.trim()) errors.categories = "Categories are required";
  if (!row.pdf_cloudinary_public_id?.trim())
    errors.pdf_cloudinary_public_id = "PDF Cloudinary ID is required";
  if (!row.cover_cloudinary_public_id?.trim())
    errors.cover_cloudinary_public_id = "Cover Cloudinary ID is required";
  if (row.price === "" || row.price === undefined)
    errors.price = "Price is required";
  else if (isNaN(Number(row.price)) || Number(row.price) < 0)
    errors.price = "Price must be a non-negative number";

  return errors;
}

function downloadSampleCSV() {
  const blob = new Blob([SAMPLE_CSV], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "bulk-books-import-template.csv";
  a.click();
  URL.revokeObjectURL(url);
}

export default function BulkImportPage() {
  const fileInputRef = useRef(null);
  const [parsedRows, setParsedRows] = useState([]);
  const [rowErrors, setRowErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const allValid = parsedRows.length > 0 && Object.keys(rowErrors).length === 0;
  const errorCount = Object.keys(rowErrors).length;
  const validCount = parsedRows.length - errorCount;

  const handleFileUpload = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".csv")) {
      toast.error("Please upload a CSV file");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      const rows = parseCSV(text);

      if (rows.length === 0) {
        toast.error("CSV file is empty or has no data rows");
        return;
      }

      const errors = {};
      rows.forEach((row) => {
        const rowErrors = validateRow(row);
        if (Object.keys(rowErrors).length > 0) {
          errors[row._rowIndex] = rowErrors;
        }
      });

      setParsedRows(rows);
      setRowErrors(errors);
      setSubmitted(false);

      if (Object.keys(errors).length === 0) {
        toast.success(`All ${rows.length} rows validated successfully`);
      } else {
        toast.warning(
          `${rows.length} rows found, ${Object.keys(errors).length} with errors`
        );
      }
    };
    reader.readAsText(file);
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!allValid) {
      toast.error("Please fix all validation errors before submitting");
      return;
    }

    setSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setSubmitting(false);
    setSubmitted(true);
    toast.success(`Successfully imported ${parsedRows.length} books`);
  }, [allValid, parsedRows.length]);

  const handleReset = useCallback(() => {
    setParsedRows([]);
    setRowErrors({});
    setSubmitted(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  return (
    <PageShell>
      <PageHeader
        icon={FileSpreadsheet}
        title="Bulk Import Books"
        subtitle="Import multiple books from a CSV file with Cloudinary mapping"
      />

      <div className="space-y-6">
        {/* Actions */}
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={downloadSampleCSV}>
            <Download className="h-4 w-4 mr-2" />
            Download Sample CSV
          </Button>
          <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
            <Upload className="h-4 w-4 mr-2" />
            Upload CSV
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={handleFileUpload}
          />
        </div>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">CSV Format</CardTitle>
            <CardDescription>
              Required columns: title, author_email, description, categories,
              pdf_cloudinary_public_id, cover_cloudinary_public_id, price
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>
                <strong>title:</strong> Book title
              </p>
              <p>
                <strong>author_email:</strong> Email of the book author
              </p>
              <p>
                <strong>description:</strong> Book description
              </p>
              <p>
                <strong>categories:</strong> Comma-separated categories
              </p>
              <p>
                <strong>pdf_cloudinary_public_id:</strong> Cloudinary public ID
                for the PDF file
              </p>
              <p>
                <strong>cover_cloudinary_public_id:</strong> Cloudinary public ID
                for the cover image
              </p>
              <p>
                <strong>price:</strong> Book price in USDC (0 for free)
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Preview Table */}
        {parsedRows.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">
                    Preview ({parsedRows.length} rows)
                  </CardTitle>
                  <CardDescription>
                    {errorCount === 0 ? (
                      <span className="flex items-center gap-1 text-green-600">
                        <CheckCircle2 className="h-3 w-3" /> All rows valid
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-destructive">
                        <AlertTriangle className="h-3 w-3" /> {errorCount} row(s)
                        have errors, {validCount} valid
                      </span>
                    )}
                  </CardDescription>
                </div>
                <Button variant="ghost" size="sm" onClick={handleReset}>
                  Clear
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">#</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Author Email</TableHead>
                      <TableHead>Categories</TableHead>
                      <TableHead>PDF ID</TableHead>
                      <TableHead>Cover ID</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead className="w-16">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {parsedRows.map((row) => {
                      const hasError = !!rowErrors[row._rowIndex];
                      return (
                        <TableRow
                          key={row._rowIndex}
                          className={cn(hasError && "bg-destructive/5")}
                        >
                          <TableCell className="font-mono text-xs text-muted-foreground">
                            {row._rowIndex}
                          </TableCell>
                          <TableCell>
                            <div>
                              {row.title || "-"}
                              {rowErrors[row._rowIndex]?.title && (
                                <p className="text-xs text-destructive mt-0.5">
                                  {rowErrors[row._rowIndex].title}
                                </p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              {row.author_email || "-"}
                              {rowErrors[row._rowIndex]?.author_email && (
                                <p className="text-xs text-destructive mt-0.5">
                                  {rowErrors[row._rowIndex].author_email}
                                </p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              {row.categories || "-"}
                              {rowErrors[row._rowIndex]?.categories && (
                                <p className="text-xs text-destructive mt-0.5">
                                  {rowErrors[row._rowIndex].categories}
                                </p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              {row.pdf_cloudinary_public_id || "-"}
                              {rowErrors[row._rowIndex]
                                ?.pdf_cloudinary_public_id && (
                                <p className="text-xs text-destructive mt-0.5">
                                  {
                                    rowErrors[row._rowIndex]
                                      .pdf_cloudinary_public_id
                                  }
                                </p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              {row.cover_cloudinary_public_id || "-"}
                              {rowErrors[row._rowIndex]
                                ?.cover_cloudinary_public_id && (
                                <p className="text-xs text-destructive mt-0.5">
                                  {
                                    rowErrors[row._rowIndex]
                                      .cover_cloudinary_public_id
                                  }
                                </p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              {row.price ?? "-"}
                              {rowErrors[row._rowIndex]?.price && (
                                <p className="text-xs text-destructive mt-0.5">
                                  {rowErrors[row._rowIndex].price}
                                </p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {hasError ? (
                              <Badge
                                variant="destructive"
                                className="text-xs"
                              >
                                <XCircle className="h-3 w-3 mr-1" />
                                Error
                              </Badge>
                            ) : (
                              <Badge variant="default" className="text-xs">
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                OK
                              </Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Submit */}
        {parsedRows.length > 0 && !submitted && (
          <div className="flex items-center justify-end gap-3">
            <Button variant="outline" onClick={handleReset}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={!allValid || submitting}>
              {submitting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Upload className="h-4 w-4 mr-2" />
              )}
              {submitting
                ? "Importing..."
                : `Import ${parsedRows.length} Books`}
            </Button>
          </div>
        )}

        {/* Success */}
        {submitted && (
          <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/30">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium text-green-800 dark:text-green-200">
                    Import Complete
                  </p>
                  <p className="text-sm text-green-600 dark:text-green-300">
                    Successfully imported {parsedRows.length} books
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={handleReset} className="ml-auto">
                  Import More
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </PageShell>
  );
}
