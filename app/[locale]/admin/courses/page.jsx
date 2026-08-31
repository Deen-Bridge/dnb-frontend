"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Flag, GraduationCap, RotateCcw } from "lucide-react";
import { PageShell } from "@/components/ui/page-shell";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
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
import { fetchCourses } from "@/lib/actions/courses/fetch-courses";
import { ISLAMIC_CATEGORIES, resolveCategorySlug } from "@/lib/categories";
import { cn } from "@/lib/utils";
import {
  poppins_400,
  poppins_500,
  poppins_600,
} from "@/lib/config/font.config";

const PAGE_SIZE = 20;
const STATUS_OPTIONS = ["draft", "published", "unpublished", "taken-down"];

const statusStyles = {
  draft: "border-ink-muted/20 bg-ink-muted/10 text-ink-muted",
  published: "border-emerald-600/20 bg-emerald-600/10 text-emerald-700",
  unpublished: "border-amber-600/20 bg-amber-600/10 text-amber-700",
  "taken-down": "border-destructive/20 bg-destructive/10 text-destructive",
};

function normalizeStatus(course) {
  const value = String(
    course?.moderationStatus || course?.status || ""
  )
    .trim()
    .toLowerCase()
    .replaceAll("_", "-")
    .replaceAll(" ", "-");

  if (value === "taken-down" || value === "takedown" || value === "removed") {
    return "taken-down";
  }
  if (value === "unpublished" || value === "inactive") return "unpublished";
  if (value === "published" || value === "active") return "published";
  if (value === "draft") return "draft";

  if (course?.isTakenDown || course?.takenDownAt) return "taken-down";
  if (course?.published === true || course?.isPublished === true) return "published";
  if (course?.published === false || course?.isPublished === false) {
    return "unpublished";
  }
  return "draft";
}

function getEnrollmentCount(course) {
  if (Number.isFinite(Number(course?.enrollmentsCount))) {
    return Number(course.enrollmentsCount);
  }
  if (Number.isFinite(Number(course?.enrollmentCount))) {
    return Number(course.enrollmentCount);
  }
  if (Array.isArray(course?.enrollments)) return course.enrollments.length;
  if (Array.isArray(course?.students)) return course.students.length;
  return 0;
}

function getFlagCount(course) {
  if (Number.isFinite(Number(course?.flagsCount))) return Number(course.flagsCount);
  if (Number.isFinite(Number(course?.flagCount))) return Number(course.flagCount);
  if (Array.isArray(course?.flags)) return course.flags.length;
  if (Array.isArray(course?.reports)) return course.reports.length;
  return 0;
}

function getUpdatedTime(course) {
  const value = course?.updatedAt || course?.modifiedAt || course?.createdAt;
  const time = value ? new Date(value).getTime() : 0;
  return Number.isNaN(time) ? 0 : time;
}

function formatPrice(price) {
  const amount = Number(price);
  if (!Number.isFinite(amount)) return "0 USDC";
  return `${new Intl.NumberFormat("en-US", {
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(amount)} USDC`;
}

function displayStatus(status) {
  if (status === "taken-down") return "Taken down";
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function LoadingRows() {
  return [...Array(6)].map((_, index) => (
    <TableRow key={index}>
      <TableCell colSpan={7} className="py-3">
        <Skeleton className="h-12 w-full rounded-lg" />
      </TableCell>
    </TableRow>
  ));
}

export default function AdminCoursesPage() {
  const params = useParams();
  const locale = typeof params?.locale === "string" ? params.locale : "en";
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [status, setStatus] = useState("all");
  const [category, setCategory] = useState("all");
  const [flaggedOnly, setFlaggedOnly] = useState(false);
  const [page, setPage] = useState(1);

  const loadCourses = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const response = await fetchCourses();
      const list = Array.isArray(response)
        ? response
        : response?.courses || response?.data || [];
      setCourses(Array.isArray(list) ? list : []);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCourses();
  }, [loadCourses]);

  useEffect(() => {
    setPage(1);
  }, [status, category, flaggedOnly]);

  const filteredCourses = useMemo(() => {
    return courses
      .filter((course) => {
        if (status !== "all" && normalizeStatus(course) !== status) return false;
        if (
          category !== "all" &&
          resolveCategorySlug(course?.category) !== category
        ) {
          return false;
        }
        if (flaggedOnly && getFlagCount(course) === 0) return false;
        return true;
      })
      .sort((left, right) => getUpdatedTime(right) - getUpdatedTime(left));
  }, [courses, status, category, flaggedOnly]);

  const totalPages = Math.max(1, Math.ceil(filteredCourses.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const visibleCourses = filteredCourses.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );
  const firstResult = filteredCourses.length
    ? (currentPage - 1) * PAGE_SIZE + 1
    : 0;
  const lastResult = Math.min(currentPage * PAGE_SIZE, filteredCourses.length);
  const hasFilters = status !== "all" || category !== "all" || flaggedOnly;

  const clearFilters = () => {
    setStatus("all");
    setCategory("all");
    setFlaggedOnly(false);
  };

  return (
    <PageShell>
      <PageHeader
        icon={GraduationCap}
        title="Courses moderation"
        subtitle="Review every course on the platform"
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={loadCourses}
            disabled={loading}
          >
            <RotateCcw
              className={cn("mr-2 h-4 w-4", loading && "animate-spin")}
              aria-hidden="true"
            />
            Refresh
          </Button>
        }
      />

      <section
        aria-label="Course filters"
        className="grid grid-cols-1 gap-4 rounded-2xl border border-accent/10 bg-surface-raised p-4 shadow-sm sm:grid-cols-2 lg:grid-cols-[minmax(12rem,1fr)_minmax(12rem,1fr)_auto_auto] lg:items-end"
      >
        <div className="space-y-1.5">
          <Label htmlFor="course-status" className={cn(poppins_500, "text-ink")}>
            Status
          </Label>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger id="course-status" aria-label="Filter by status">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {STATUS_OPTIONS.map((option) => (
                <SelectItem key={option} value={option}>
                  {displayStatus(option)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="course-category" className={cn(poppins_500, "text-ink")}>
            Category
          </Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger id="course-category" aria-label="Filter by category">
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {ISLAMIC_CATEGORIES.map((item) => (
                <SelectItem key={item.slug} value={item.slug}>
                  {item.shortLabel || item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex h-10 items-center gap-3 rounded-md border border-accent/10 px-3">
          <Switch
            id="flagged-only"
            checked={flaggedOnly}
            onCheckedChange={setFlaggedOnly}
          />
          <Label
            htmlFor="flagged-only"
            className={cn(poppins_500, "whitespace-nowrap text-sm text-ink")}
          >
            Flagged only
          </Label>
        </div>

        <Button
          type="button"
          variant="ghost"
          onClick={clearFilters}
          disabled={!hasFilters}
        >
          Clear filters
        </Button>
      </section>

      <div className="overflow-hidden rounded-2xl border border-accent/10 bg-surface-raised shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-accent/10 px-4 py-3">
          <p className={cn(poppins_500, "text-sm text-ink")}>
            {loading ? "Loading courses…" : `${filteredCourses.length} courses`}
          </p>
          <p className={cn(poppins_400, "text-xs text-ink-muted")}>
            Sorted by most recently updated
          </p>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-24">Thumbnail</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Educator</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Enrollments</TableHead>
                <TableHead className="text-right">Flags</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <LoadingRows />
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-48 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <p className={cn(poppins_500, "text-ink")}>
                        Courses could not be loaded.
                      </p>
                      <Button variant="outline" size="sm" onClick={loadCourses}>
                        Try again
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : visibleCourses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="p-0">
                    <EmptyState
                      icon={GraduationCap}
                      title="No courses found"
                      description={
                        hasFilters
                          ? "No courses match the selected moderation filters."
                          : "There are no courses on the platform yet."
                      }
                      action={
                        hasFilters ? (
                          <Button variant="outline" onClick={clearFilters}>
                            Clear filters
                          </Button>
                        ) : undefined
                      }
                    />
                  </TableCell>
                </TableRow>
              ) : (
                visibleCourses.map((course) => {
                  const courseId = course?._id || course?.id;
                  const educator = course?.createdBy || course?.educator || {};
                  const educatorId = educator?._id || educator?.id;
                  const educatorName =
                    educator?.name || educator?.displayName || "Unknown educator";
                  const courseStatus = normalizeStatus(course);
                  const flags = getFlagCount(course);

                  return (
                    <TableRow key={courseId || `${course?.title}-${course?.createdAt}`}>
                      <TableCell>
                        <div className="relative h-12 w-20 overflow-hidden rounded-lg border border-accent/10 bg-surface">
                          <Image
                            src={course?.thumbnail || "/images/dnb.png"}
                            alt=""
                            fill
                            sizes="80px"
                            className="object-cover"
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        {courseId ? (
                          <Link
                            href={`/${locale}/dashboard/courses/${courseId}`}
                            className={cn(
                              poppins_500,
                              "line-clamp-2 min-w-44 text-sm text-ink underline-offset-2 hover:text-accent hover:underline"
                            )}
                          >
                            {course?.title || "Untitled course"}
                          </Link>
                        ) : (
                          <span className={cn(poppins_500, "text-sm text-ink")}>
                            {course?.title || "Untitled course"}
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        {educatorId ? (
                          <Link
                            href={`/${locale}/admin/users/${educatorId}`}
                            className={cn(
                              poppins_400,
                              "whitespace-nowrap text-sm text-accent underline-offset-2 hover:underline"
                            )}
                          >
                            {educatorName}
                          </Link>
                        ) : (
                          <span className={cn(poppins_400, "text-sm text-ink-muted")}>
                            {educatorName}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className={cn(poppins_500, "whitespace-nowrap text-sm text-ink")}>
                        {formatPrice(course?.price)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn(
                            "whitespace-nowrap rounded-full",
                            statusStyles[courseStatus]
                          )}
                        >
                          {displayStatus(courseStatus)}
                        </Badge>
                      </TableCell>
                      <TableCell className={cn(poppins_400, "text-right text-sm text-ink")}>
                        {getEnrollmentCount(course).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <span
                          className={cn(
                            poppins_500,
                            "inline-flex items-center justify-end gap-1 text-sm",
                            flags > 0 ? "text-destructive" : "text-ink-muted"
                          )}
                        >
                          <Flag className="h-3.5 w-3.5" aria-hidden="true" />
                          {flags.toLocaleString()}
                        </span>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {!loading && !error && filteredCourses.length > 0 && (
          <div className="flex flex-col gap-3 border-t border-accent/10 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <p className={cn(poppins_400, "text-sm text-ink-muted")}>
              Showing {firstResult}–{lastResult} of {filteredCourses.length}
            </p>
            <nav className="flex items-center gap-2" aria-label="Courses pagination">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((value) => Math.max(1, value - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <span className={cn(poppins_500, "px-2 text-sm text-ink")}>
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </nav>
          </div>
        )}
      </div>
    </PageShell>
  );
}
