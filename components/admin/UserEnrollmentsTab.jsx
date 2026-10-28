"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BookOpen } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { fetchCourses } from "@/lib/actions/courses/fetch-courses";

function getCourseId(entry) {
  if (typeof entry === "string") return entry;
  return String(entry?.courseId ?? entry?._id ?? "");
}

function formatDate(value) {
  if (!value) return "Not recorded";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not recorded";
  return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

/**
 * Read-only list of a learner's enrolled courses (#228).
 * Source: the `enrolledCourses` field already on the admin user record, which the
 * learner dashboard also reads (see hooks/usePurchases.ts). Course titles are
 * resolved from the course catalog via fetchCourses (the same call the admin
 * courses page uses).
 * TODO(backend): no admin-readable per-learner progress source exists yet, so
 * progress is shown as "Not tracked" unless the record carries a numeric `progress`.
 */
export default function UserEnrollmentsTab({ enrolledCourses }) {
  const entries = Array.isArray(enrolledCourses) ? enrolledCourses : [];
  const [catalog, setCatalog] = useState(null);

  useEffect(() => {
    let active = true;
    if (entries.length === 0) {
      setCatalog([]);
      return () => {
        active = false;
      };
    }
    setCatalog(null);
    fetchCourses().then((list) => {
      if (active) setCatalog(Array.isArray(list) ? list : []);
    });
    return () => {
      active = false;
    };
  }, [entries.length]);

  const loading = catalog === null;

  const rows = entries.map((entry) => {
    const id = getCourseId(entry);
    const match = catalog?.find((course) => String(course?._id) === id);
    return {
      id,
      title: entry?.title || entry?.courseTitle || match?.title || id || "Untitled course",
      enrolledAt: entry?.enrolledAt || entry?.createdAt || null,
      progress: typeof entry?.progress === "number" ? entry.progress : null,
    };
  });

  return (
    <Card className="border shadow-none">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold">Enrollments</CardTitle>
        <CardDescription className="text-xs">
          Courses this learner is enrolled in. Read-only.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        {loading ? (
          <div className="space-y-2 p-4">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        ) : rows.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="No enrollments"
            description="This user is not enrolled in any courses."
            className="border-0 shadow-none"
          />
        ) : (
          <Table aria-label="User course enrollments">
            <TableHeader>
              <TableRow>
                <TableHead>Course</TableHead>
                <TableHead>Enrolled</TableHead>
                <TableHead className="text-right">Progress</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="text-xs font-medium">
                    <Link
                      href={`/admin/courses/${row.id}`}
                      className="text-primary hover:underline"
                    >
                      {row.title}
                    </Link>
                  </TableCell>
                  <TableCell className="text-xs">{formatDate(row.enrolledAt)}</TableCell>
                  <TableCell className="text-right text-xs">
                    {row.progress !== null ? `${Math.round(row.progress)}%` : "Not tracked"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
