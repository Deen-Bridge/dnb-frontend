"use client";

import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Users } from "lucide-react";

const BUCKETS = [
  { key: "day", label: "Day" },
  { key: "week", label: "Week" },
  { key: "month", label: "Month" },
];

function bucketStart(value, interval) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  if (interval === "month") {
    date.setDate(1);
  } else if (interval === "week") {
    const daysSinceMonday = (date.getDay() + 6) % 7;
    date.setDate(date.getDate() - daysSinceMonday);
  }
  date.setHours(0, 0, 0, 0);
  return date;
}

function formatBucket(date, interval) {
  if (interval === "month") {
    return new Intl.DateTimeFormat(undefined, { month: "short", year: "numeric" }).format(date);
  }
  return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(date);
}

function groupRegistrations(registrations, interval) {
  const buckets = new Map();

  for (const registration of registrations) {
    const date = bucketStart(registration.createdAt, interval);
    if (!date) continue;
    const key = date.toISOString();
    const current = buckets.get(key) || {
      date: key,
      label: formatBucket(date, interval),
      students: 0,
      mentors: 0,
    };
    const role = String(registration.role || "student").toLowerCase();
    current[role === "mentor" || role === "educator" ? "mentors" : "students"] += 1;
    buckets.set(key, current);
  }

  return [...buckets.values()].sort((left, right) => left.date.localeCompare(right.date));
}

export default function RegistrationTrendChart({ registrations = [] }) {
  const [interval, setInterval] = useState("day");
  const chartData = useMemo(
    () => groupRegistrations(registrations, interval),
    [registrations, interval]
  );

  return (
    <Card>
      <CardHeader className="gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <CardTitle>Signups over time</CardTitle>
          <CardDescription className="mt-1">
            New student and educator registrations by period.
          </CardDescription>
        </div>
        <div className="inline-flex rounded-md border p-1" aria-label="Signup chart interval">
          {BUCKETS.map((bucket) => (
            <button
              key={bucket.key}
              type="button"
              aria-pressed={interval === bucket.key}
              onClick={() => setInterval(bucket.key)}
              className="rounded px-3 py-1.5 text-sm aria-pressed:bg-primary aria-pressed:text-primary-foreground"
            >
              {bucket.label}
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No signup data yet"
            description="Registration activity will appear here when signup records are available."
          />
        ) : (
          <div className="h-72 w-full" role="img" aria-label="Student and educator signups over time">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="label" tickLine={false} axisLine={false} minTickGap={24} />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
                <Tooltip />
                <Area type="monotone" dataKey="students" name="Students" stackId="signups" stroke="hsl(var(--primary))" fill="hsl(var(--primary) / 0.25)" />
                <Area type="monotone" dataKey="mentors" name="Educators" stackId="signups" stroke="hsl(var(--accent))" fill="hsl(var(--accent) / 0.2)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
