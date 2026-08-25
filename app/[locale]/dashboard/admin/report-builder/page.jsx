"use client";
/**
 * Admin custom report builder (saved queries) (#329).
 * ---------------------------------------------------------------------------
 * Super-admin surface (wrapped in `AdminTierGuard`) that composes the existing
 * report datasets (users / transactions / reports) into a named, saved query:
 * pick a dataset, tune its filters, choose output columns, preview the rows,
 * and export via the standard CSV path. Strict scope discipline — no
 * cross-dataset joins, no custom SQL, no scheduling.
 *
 * Mirrors the structure/styling of the audit-logs admin page.
 */
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import {
  Table2,
  Save,
  Download,
  Trash2,
  Play,
  Plus,
  ListChecks,
  Filter,
  Eye,
} from "lucide-react";
import { toast } from "sonner";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import AdminTierGuard from "@/components/auth/AdminTierGuard";
import {
  REPORT_DATASETS,
  defaultFiltersFor,
  fetchReportRows,
  listSavedQueries,
  saveQuery,
  deleteSavedQuery,
} from "@/lib/actions/admin-reports";
import { downloadCsv } from "@/lib/utils/csv";
import { cn } from "@/lib/utils";
import { poppins_400, poppins_500, poppins_600 } from "@/lib/config/font.config";

const PREVIEW_LIMIT = 50;
const DEFAULT_DATASET = "users";

function formatDate(iso) {
  const date = iso ? new Date(iso) : null;
  if (!date || Number.isNaN(date.getTime())) return "Unknown";
  return date.toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" });
}

function SavedQueriesPanel({ queries, activeQueryId, onLoad, onDelete, onOpenSave }) {
  return (
    <Card className="h-fit lg:sticky lg:top-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <ListChecks className="h-5 w-5" />
          Saved queries
        </CardTitle>
        <CardDescription>
          Rerun a previously saved report
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          type="button"
          size="sm"
          className="mb-4 w-full rounded-full"
          onClick={onOpenSave}
        >
          <Plus className="mr-1 h-4 w-4" />
          Save current query
        </Button>

        {queries.length === 0 ? (
          <p className={cn(poppins_400.className, "text-sm text-ink-muted")}>
            No saved queries yet. Compose a report and save it to rerun it here.
          </p>
        ) : (
          <ul className="space-y-2">
            {queries.map((query) => {
              const dataset = REPORT_DATASETS.find((d) => d.id === query.datasetId);
              const isActive = query.id === activeQueryId;
              return (
                <li
                  key={query.id}
                  className={cn(
                    "flex items-start justify-between gap-2 rounded-xl border p-3 transition-colors",
                    isActive
                      ? "border-accent/30 bg-accent/5"
                      : "border-accent/10 bg-surface-raised hover:border-accent/20"
                  )}
                >
                  <button
                    type="button"
                    className="min-w-0 flex-1 text-left"
                    onClick={() => onLoad(query)}
                    aria-label={`Run query ${query.name}`}
                  >
                    <p className={cn(poppins_500.className, "truncate text-sm text-ink")}>
                      {query.name}
                    </p>
                    <p className={cn(poppins_400.className, "mt-0.5 text-xs text-ink-muted")}>
                      {dataset?.label || query.datasetId} · {formatDate(query.createdAt)}
                    </p>
                  </button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 shrink-0 rounded-full text-ink-muted hover:text-destructive"
                    onClick={() => onDelete(query.id)}
                    aria-label={`Delete query ${query.name}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

function DatasetSelector({ value, onChange }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Table2 className="h-5 w-5" />
          Dataset
        </CardTitle>
        <CardDescription>
          Choose which report to compose
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger id="report-dataset" className="w-full" aria-label="Select report dataset">
            <SelectValue placeholder="Select a dataset" />
          </SelectTrigger>
          <SelectContent>
            {REPORT_DATASETS.map((dataset) => (
              <SelectItem key={dataset.id} value={dataset.id}>
                {dataset.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className={cn(poppins_400.className, "mt-2 text-xs text-ink-muted")}>
          {REPORT_DATASETS.find((d) => d.id === value)?.description}
        </p>
      </CardContent>
    </Card>
  );
}

function FilterControls({ dataset, filters, onChange }) {
  return (
    <div className="grid grid-cols-1 gap-4 rounded-2xl border border-accent/10 bg-surface-raised p-4 shadow-sm sm:grid-cols-2 lg:grid-cols-4">
      {dataset.filters.map((filter) => {
        if (filter.type === "date") {
          const isFrom = filter.key === "from";
          return (
            <div key={filter.key} className="space-y-1.5">
              <Label
                htmlFor={`report-filter-${dataset.id}-${filter.key}`}
                className={cn(poppins_500.className, "text-ink")}
              >
                {filter.label}
              </Label>
              <Input
                id={`report-filter-${dataset.id}-${filter.key}`}
                type="date"
                value={filters[filter.key] || ""}
                max={!isFrom ? undefined : filters.to || undefined}
                min={isFrom ? undefined : filters.from || undefined}
                onChange={(event) => onChange(filter.key, event.target.value)}
                aria-label={`${filter.label} filter`}
              />
            </div>
          );
        }

        return (
          <div key={filter.key} className="space-y-1.5">
            <Label
              htmlFor={`report-filter-${dataset.id}-${filter.key}`}
              className={cn(poppins_500.className, "text-ink")}
            >
              {filter.label}
            </Label>
            <Select
              value={filters[filter.key] || "all"}
              onValueChange={(value) => onChange(filter.key, value)}
            >
              <SelectTrigger
                id={`report-filter-${dataset.id}-${filter.key}`}
                className="w-full"
                aria-label={`${filter.label} filter`}
              >
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                {filter.options.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );
      })}
    </div>
  );
}

function ColumnChooser({ dataset, selected, onToggle, onToggleAll }) {
  const allSelected = selected.length === dataset.columns.length;

  return (
    <div className="space-y-3 rounded-2xl border border-accent/10 bg-surface-raised p-4 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <p className={cn(poppins_500.className, "text-sm text-ink")}>
          Output columns
        </p>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="rounded-full text-xs"
          onClick={onToggleAll}
        >
          {allSelected ? "Clear all" : "Select all"}
        </Button>
      </div>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {dataset.columns.map((column) => (
          <label
            key={column.key}
            className="flex cursor-pointer items-center gap-2 rounded-lg border border-accent/10 px-3 py-2 text-sm transition-colors hover:border-accent/30"
          >
            <Checkbox
              checked={selected.includes(column.key)}
              onCheckedChange={() => onToggle(column.key)}
            />
            <span className={cn(poppins_400.className, "text-ink")}>{column.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

function PreviewTable({ dataset, columns, rows, loading, error }) {
  const visibleColumns = dataset.columns.filter((column) =>
    columns.includes(column.key)
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Eye className="h-5 w-5" />
          Preview
        </CardTitle>
        <CardDescription>
          Validating query results · up to {PREVIEW_LIMIT} matching rows
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error ? (
          <EmptyState icon={Table2} title="Failed to load preview" description={error} />
        ) : loading ? (
          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  {visibleColumns.map((column) => (
                    <TableHead key={column.key}>{column.label}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from({ length: 4 }).map((_, index) => (
                  <TableRow key={index}>
                    {visibleColumns.map((column) => (
                      <TableCell key={column.key} className="py-3">
                        <Skeleton className="h-4 w-full rounded-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : rows.length === 0 ? (
          <EmptyState
            icon={Table2}
            title="No matching rows"
            description="No rows match these filters and columns. Try adjusting them."
          />
        ) : (
          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  {visibleColumns.map((column) => (
                    <TableHead key={column.key}>{column.label}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row, index) => (
                  <TableRow key={`${row.id || index}`}>
                    {visibleColumns.map((column) => (
                      <TableCell
                        key={column.key}
                        className={cn(poppins_400.className, "text-sm text-ink")}
                      >
                        {row[column.key] ?? "—"}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ReportBuilderContent() {
  const { user } = useAuth();
  const userId = user?._id || user?.id;

  const [datasetId, setDatasetId] = useState(DEFAULT_DATASET);
  const [filters, setFilters] = useState(() => defaultFiltersFor(DEFAULT_DATASET));
  const [selectedColumns, setSelectedColumns] = useState(() =>
    REPORT_DATASETS[0].columns.map((column) => column.key)
  );

  const [rows, setRows] = useState([]);
  const [rowsLoading, setRowsLoading] = useState(true);
  const [rowsError, setRowsError] = useState(null);

  const [savedQueries, setSavedQueries] = useState([]);
  const [activeQueryId, setActiveQueryId] = useState(null);

  const [saveOpen, setSaveOpen] = useState(false);
  const [queryName, setQueryName] = useState("");

  const dataset = useMemo(
    () => REPORT_DATASETS.find((d) => d.id === datasetId),
    [datasetId]
  );

  useEffect(() => {
    let active = true;
    if (!userId) return undefined;

    listSavedQueries(userId)
      .then(({ queries }) => {
        if (active) setSavedQueries(queries);
      })
      .catch(() => {
        if (active) setSavedQueries([]);
      });

    return () => {
      active = false;
    };
  }, [userId]);

  useEffect(() => {
    let active = true;
    setRowsLoading(true);
    setRowsError(null);

    fetchReportRows(datasetId, filters, { limit: PREVIEW_LIMIT })
      .then(({ rows: nextRows }) => {
        if (active) {
          setRows(nextRows);
          setRowsLoading(false);
        }
      })
      .catch((err) => {
        if (active) {
          setRowsError(err?.message || "Failed to load preview");
          setRowsLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [datasetId, filters]);

  const selectDataset = (id) => {
    const nextDataset = REPORT_DATASETS.find((d) => d.id === id);
    setDatasetId(id);
    setFilters(defaultFiltersFor(id));
    setSelectedColumns(nextDataset.columns.map((column) => column.key));
    setActiveQueryId(null);
  };

  const updateFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const toggleColumn = (key) => {
    setSelectedColumns((prev) =>
      prev.includes(key) ? prev.filter((c) => c !== key) : [...prev, key]
    );
  };

  const toggleAllColumns = () => {
    setSelectedColumns((prev) =>
      prev.length === dataset.columns.length
        ? []
        : dataset.columns.map((column) => column.key)
    );
  };

  const handleSave = async () => {
    const name = queryName.trim();
    if (!name) return;
    try {
      const { query } = await saveQuery(userId, {
        name,
        datasetId,
        filters,
        columns: selectedColumns,
      });
      setSavedQueries((prev) => [query, ...prev]);
      setActiveQueryId(query.id);
      setQueryName("");
      setSaveOpen(false);
      toast.success("Query saved");
    } catch (err) {
      toast.error(err?.message || "Failed to save query");
    }
  };

  const handleLoad = (query) => {
    setDatasetId(query.datasetId);
    setFilters(query.filters || defaultFiltersFor(query.datasetId));
    setSelectedColumns(query.columns || []);
    setActiveQueryId(query.id);
    toast.success(`Running "${query.name}"`);
  };

  const handleDelete = async (queryId) => {
    try {
      await deleteSavedQuery(userId, queryId);
      setSavedQueries((prev) => prev.filter((q) => q.id !== queryId));
      if (activeQueryId === queryId) setActiveQueryId(null);
      toast.success("Query deleted");
    } catch (err) {
      toast.error(err?.message || "Failed to delete query");
    }
  };

  const handleExport = () => {
    const visibleColumns = dataset.columns.filter((column) =>
      selectedColumns.includes(column.key)
    );
    const headers = visibleColumns.map((column) => column.label);
    const exportRows = rows.map((row) =>
      visibleColumns.map((column) => row[column.key] ?? "")
    );
    downloadCsv({
      filename: `${datasetId}-report-${new Date().toISOString().slice(0, 10)}.csv`,
      headers,
      rows: exportRows,
    });
    toast.success("Report exported as CSV");
  };

  return (
    <PageShell>
      <PageHeader
        icon={Table2}
        title="Report builder"
        subtitle="Compose, save, and rerun custom reports from existing datasets"
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              className="rounded-full"
              onClick={handleExport}
              disabled={rowsLoading || rows.length === 0 || selectedColumns.length === 0}
            >
              <Download className="mr-1 h-4 w-4" />
              Export CSV
            </Button>
            <Button
              type="button"
              className="rounded-full"
              onClick={() => setSaveOpen(true)}
              disabled={selectedColumns.length === 0}
            >
              <Save className="mr-1 h-4 w-4" />
              Save query
            </Button>
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,280px)_1fr]">
        <SavedQueriesPanel
          queries={savedQueries}
          activeQueryId={activeQueryId}
          onLoad={handleLoad}
          onDelete={handleDelete}
          onOpenSave={() => setSaveOpen(true)}
        />

        <div className="min-w-0 space-y-6">
          <DatasetSelector value={datasetId} onChange={selectDataset} />

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Filter className="h-5 w-5" />
                Filters
              </CardTitle>
              <CardDescription>
                Tune the report with the dataset&apos;s filter set
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FilterControls dataset={dataset} filters={filters} onChange={updateFilter} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <ListChecks className="h-5 w-5" />
                Columns
              </CardTitle>
              <CardDescription>
                Choose which columns appear in the output
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ColumnChooser
                dataset={dataset}
                selected={selectedColumns}
                onToggle={toggleColumn}
                onToggleAll={toggleAllColumns}
              />
            </CardContent>
          </Card>

          <PreviewTable
            dataset={dataset}
            columns={selectedColumns}
            rows={rows}
            loading={rowsLoading}
            error={rowsError}
          />
        </div>
      </div>

      <Dialog open={saveOpen} onOpenChange={setSaveOpen}>
        <DialogContent className="border border-accent/10 bg-surface-raised sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Save query</DialogTitle>
            <DialogDescription>
              Give this report a name so you can rerun it from the saved list.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <Label htmlFor="query-name" className={cn(poppins_500.className, "text-ink")}>
              Query name
            </Label>
            <Input
              id="query-name"
              value={queryName}
              onChange={(event) => setQueryName(event.target.value)}
              placeholder={`e.g. ${dataset.label} — last 30 days`}
              onKeyDown={(event) => {
                if (event.key === "Enter" && queryName.trim() && selectedColumns.length > 0) {
                  handleSave();
                }
              }}
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              className="rounded-full"
              onClick={() => setSaveOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="rounded-full"
              onClick={handleSave}
              disabled={!queryName.trim() || selectedColumns.length === 0}
            >
              <Save className="mr-1 h-4 w-4" />
              Save query
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}

export default function ReportBuilderPage() {
  return (
    <AdminTierGuard>
      <ReportBuilderContent />
    </AdminTierGuard>
  );
}
