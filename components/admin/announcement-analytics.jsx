"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { RangeFilter } from "@/components/admin/range-filter";
import { fetchAnnouncementAnalytics } from "@/lib/actions/admin-announcements";
import {
  Eye,
  Users,
  XCircle,
  MousePointerClick,
  BarChart3,
  AlertTriangle,
  Megaphone,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { poppins_400, poppins_500, poppins_600 } from "@/lib/config/font.config";
import { format } from "date-fns";

const COLORS = {
  impressions: "#009900",
  uniqueViewers: "#265902",
};

const chartConfig = {
  impressions: { label: "Impressions", color: COLORS.impressions },
  uniqueViewers: { label: "Unique Viewers", color: COLORS.uniqueViewers },
};

function formatMetric(metric) {
  if (metric.unit === "percent") return `${metric.value.toFixed(1)}%`;
  return metric.value.toLocaleString();
}

function MetricCard({ icon: Icon, metric }) {
  return (
    <Card className="transition-all duration-300 hover:-translate-y-0.5 hover:border-secondary/30">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 space-y-1">
            <p
              className={cn(
                poppins_500.className,
                "text-xs uppercase tracking-wider text-muted-foreground"
              )}
            >
              {metric.label}
            </p>
            {metric.tracked ? (
              <p className={cn(poppins_600.className, "text-3xl text-foreground")}>
                {formatMetric(metric)}
              </p>
            ) : (
              <p
                className={cn(
                  poppins_600.className,
                  "text-3xl text-muted-foreground/40"
                )}
              >
                —
              </p>
            )}
            {!metric.tracked && (
              <p className={cn(poppins_400.className, "text-xs text-muted-foreground")}>
                Not tracked yet
              </p>
            )}
          </div>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-accent/5 bg-gradient-to-br from-secondary/15 to-highlight/10">
            <Icon className="h-5 w-5 text-accent" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function UntrackedCell() {
  return (
    <span className="text-muted-foreground/50" title="Event not instrumented yet">
      —
    </span>
  );
}

function AnnouncementAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [range, setRange] = useState({ from: null, to: null });

  useEffect(() => {
    let active = true;

    setLoading(true);
    fetchAnnouncementAnalytics({
      from: range.from?.toISOString(),
      to: range.to?.toISOString(),
    })
      .then((analytics) => {
        if (active) {
          setData(analytics);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (active) {
          setError(err?.message || "Failed to load announcement analytics");
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [range]);

  const chartData = useMemo(() => {
    if (!data) return [];
    return data.announcements.map((ann) => ({
      name:
        ann.title.length > 22 ? `${ann.title.slice(0, 22)}…` : ann.title,
      impressions: ann.impressions.tracked ? ann.impressions.value : 0,
      uniqueViewers: ann.uniqueViewers.tracked ? ann.uniqueViewers.value : 0,
    }));
  }, [data]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64 rounded-lg" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-32 w-full rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-[300px] w-full rounded-2xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  if (error) {
    return (
      <EmptyState
        icon={AlertTriangle}
        title="Failed to load announcement analytics"
        description={error}
      />
    );
  }

  const { totals, announcements } = data;

  return (
    <div className="space-y-6">
      {/* Range filter + event note */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <RangeFilter
          value={range}
          onChange={setRange}
          aria-label="Filter announcements by date range"
        />
        <p className={cn(poppins_400.className, "text-xs text-muted-foreground")}>
          Events: announcement.impression · announcement.view ·
          announcement.dismiss · announcement.link_click
        </p>
      </div>

      {/* Summary metrics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard icon={Eye} metric={totals.impressions} />
        <MetricCard icon={Users} metric={totals.uniqueViewers} />
        <MetricCard icon={XCircle} metric={totals.dismissRate} />
        <MetricCard icon={MousePointerClick} metric={totals.ctr} />
      </div>

      {/* Bar chart comparison */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <BarChart3 className="h-5 w-5" />
            Reach Comparison
          </CardTitle>
          <CardDescription>
            Impressions vs unique viewers across recent announcements
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <BarChart data={chartData}>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke={COLORS.uniqueViewers}
                strokeOpacity={0.12}
              />
              <XAxis
                dataKey="name"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                interval={0}
                angle={-18}
                height={60}
                textAnchor="end"
              />
              <YAxis tickLine={false} axisLine={false} tickMargin={8} allowDecimals={false} />
              <ChartTooltip
                cursor={{ fill: "rgba(0,153,0,0.06)" }}
                content={<ChartTooltipContent />}
              />
              <Legend />
              <Bar
                name="Impressions"
                dataKey="impressions"
                fill={COLORS.impressions}
                radius={[4, 4, 0, 0]}
              />
              <Bar
                name="Unique Viewers"
                dataKey="uniqueViewers"
                fill={COLORS.uniqueViewers}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Per-announcement stats */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Megaphone className="h-5 w-5" />
            Per-Announcement Stats
          </CardTitle>
          <CardDescription>
            Reach and engagement for each announcement in the selected range
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Announcement</TableHead>
                <TableHead>Sent</TableHead>
                <TableHead className="text-right">Impressions</TableHead>
                <TableHead className="text-right">Unique Viewers</TableHead>
                <TableHead className="text-right">Dismiss Rate</TableHead>
                <TableHead className="text-right">CTR</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {announcements.map((ann) => (
                <TableRow key={ann.id}>
                  <TableCell className="max-w-[260px] truncate font-medium">
                    {ann.title}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {format(new Date(ann.sentAt), "LLL dd, y")}
                  </TableCell>
                  <TableCell className="text-right">
                    {ann.impressions.tracked
                      ? ann.impressions.value.toLocaleString()
                      : <UntrackedCell />}
                  </TableCell>
                  <TableCell className="text-right">
                    {ann.uniqueViewers.tracked
                      ? ann.uniqueViewers.value.toLocaleString()
                      : <UntrackedCell />}
                  </TableCell>
                  <TableCell className="text-right">
                    {ann.dismissRate.tracked
                      ? `${ann.dismissRate.value.toFixed(1)}%`
                      : <UntrackedCell />}
                  </TableCell>
                  <TableCell className="text-right">
                    {ann.ctr.tracked
                      ? `${ann.ctr.value.toFixed(1)}%`
                      : <UntrackedCell />}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="border-t px-6 py-3">
            <p className={cn(poppins_400.className, "text-xs text-muted-foreground")}>
              — means the tracking event for that metric is not instrumented yet;
              it will populate automatically once the backend event is wired up.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export { AnnouncementAnalytics };
