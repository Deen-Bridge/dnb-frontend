"use client";

import { useEffect, useState } from "react";
import { PageShell } from "@/components/ui/page-shell";
import { PageHeader } from "@/components/ui/page-header";
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
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import {
  GraduationCap,
  BookOpen,
  Clock,
  Users,
  Activity,
  CheckCircle2,
  BarChart3,
  Eye,
  AlertTriangle,
  Globe,
  MapPin,
  Calendar,
  DollarSign,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { poppins_400, poppins_500, poppins_600 } from "@/lib/config/font.config";
import { fetchEngagementAnalytics } from "@/lib/actions/admin-learning-analytics";

const COLORS = {
  enrolled: "#009900",
  accent: "#265902",
};

const lessonsChartConfig = {
  learners: { label: "Learners", color: COLORS.enrolled },
};

const readingChartConfig = {
  readers: { label: "Readers", color: COLORS.enrolled },
};

function StatCard({ icon: Icon, label, metric }) {
  return (
    <Card className="transition-all duration-300 hover:-translate-y-0.5 hover:border-secondary/30">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p
              className={cn(
                poppins_500.className,
                "text-xs uppercase tracking-wider text-muted-foreground"
              )}
            >
              {label}
            </p>
            {metric.tracked ? (
              <p className={cn(poppins_600.className, "text-3xl text-foreground")}>
                {metric.value.toLocaleString()}
              </p>
            ) : (
              <p className={cn(poppins_600.className, "text-3xl text-muted-foreground/40")}>
                —
              </p>
            )}
            {!metric.tracked && (
              <p className={cn(poppins_400.className, "text-xs text-muted-foreground")}>
                Not tracked yet
              </p>
            )}
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-accent/5 bg-gradient-to-br from-secondary/15 to-highlight/10">
            <Icon className="h-5 w-5 text-accent" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function NotTrackedPlaceholder({ icon: Icon, title, description }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-muted-foreground/30 bg-muted/30 px-6 py-12 text-center">
      <div className="flex size-12 items-center justify-center rounded-xl bg-muted">
        <Icon className="h-6 w-6 text-muted-foreground" />
      </div>
      <div>
        <div className="flex items-center justify-center gap-2">
          <h3 className={cn(poppins_600.className, "text-base text-foreground")}>
            {title}
          </h3>
          <Badge variant="outline" className="text-xs text-muted-foreground">
            Not tracked yet
          </Badge>
        </div>
        <p className={cn(poppins_400.className, "mx-auto mt-1 max-w-md text-sm text-muted-foreground")}>
          {description}
        </p>
      </div>
    </div>
  );
}

function CourseCompletionFunnel({ funnel }) {
  const maxValue = Math.max(
    ...funnel.map((stage) => (stage.tracked ? stage.value : 0)),
    1
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Activity className="h-5 w-5" />
          Course Completion Funnel
        </CardTitle>
        <CardDescription>
          Learner progression across each stage of course completion
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {funnel.map((stage) => {
          const width = stage.tracked
            ? Math.max(8, (stage.value / maxValue) * 100)
            : 100;
          return (
            <div key={stage.stage} className="flex items-center gap-4">
              <span className={cn(poppins_500.className, "w-28 shrink-0 text-sm")}>
                {stage.label}
              </span>
              <div className="flex-1">
                {stage.tracked ? (
                  <div className="h-9 w-full overflow-hidden rounded-lg bg-muted">
                    <div
                      className="h-full rounded-lg bg-gradient-to-r from-secondary/80 to-accent transition-all"
                      style={{ width: `${width}%` }}
                    />
                  </div>
                ) : (
                  <div
                    aria-label="not tracked"
                    className="h-9 w-full rounded-lg border-2 border-dashed border-muted-foreground/30"
                  />
                )}
              </div>
              <div className="flex w-36 shrink-0 justify-end">
                {stage.tracked ? (
                  <span className={cn(poppins_600.className, "text-sm")}>
                    {stage.value.toLocaleString()}
                  </span>
                ) : (
                  <Badge variant="outline" className="text-xs text-muted-foreground">
                    Not tracked yet
                  </Badge>
                )}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

function DistributionChart({
  tracked,
  data,
  config,
  icon: Icon,
  title,
  description,
  placeholderTitle,
  placeholderDescription,
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Icon className="h-5 w-5" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {tracked ? (
          <ChartContainer config={config} className="h-[260px] w-full">
            <BarChart data={data}>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke={COLORS.accent}
                strokeOpacity={0.12}
              />
              <XAxis dataKey="range" tickLine={false} axisLine={false} tickMargin={8} />
              <YAxis tickLine={false} axisLine={false} tickMargin={8} allowDecimals={false} />
              <ChartTooltip
                cursor={{ fill: "rgba(0,153,0,0.06)" }}
                content={<ChartTooltipContent />}
              />
              <Bar dataKey="value" fill={COLORS.enrolled} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ChartContainer>
        ) : (
          <NotTrackedPlaceholder
            icon={Icon}
            title={placeholderTitle}
            description={placeholderDescription}
          />
        )}
      </CardContent>
    </Card>
  );
}

const DATE_PRESETS = [
  { label: "Last 30 Days", days: 30 },
  { label: "Last 90 Days", days: 90 },
  { label: "Last 6 Months", days: 180 },
  { label: "Last Year", days: 365 },
  { label: "All Time", days: 0 },
];

function GeographicDistribution({ geographic }) {
  const { tracked, coverage, countries } = geographic;

  if (!tracked) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Globe className="h-5 w-5" />
            Geographic Distribution
          </CardTitle>
          <CardDescription>
            Where learners are located around the world
          </CardDescription>
        </CardHeader>
        <CardContent>
          <NotTrackedPlaceholder
            icon={Globe}
            title="Geographic Distribution"
            description="Country data from learner profiles isn't instrumented yet, so geographic distribution can't be computed."
          />
        </CardContent>
      </Card>
    );
  }

  const maxLearners = Math.max(...countries.map((c) => c.learners), 1);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Globe className="h-5 w-5" />
          Geographic Distribution
        </CardTitle>
        <CardDescription>
          Learner distribution across countries (bar-list fallback view)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Coverage indicator */}
        <div className="flex items-center justify-between rounded-lg border border-accent/10 bg-muted/30 px-4 py-3">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-accent" />
            <span className={cn(poppins_500.className, "text-sm")}>
              {coverage.label}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-2 w-32 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-gradient-to-r from-secondary/80 to-accent"
                style={{ width: `${coverage.value}%` }}
              />
            </div>
            <Badge
              variant={coverage.value >= 70 ? "secondary" : "outline"}
              className="text-xs"
            >
              {coverage.value}%
            </Badge>
          </div>
        </div>

        {coverage.value < 100 && (
          <p className={cn(poppins_400.className, "text-xs text-muted-foreground")}>
            Country data is available for {coverage.value}% of learners. The
            remaining learners have no country on file and are excluded from the
            distribution below.
          </p>
        )}

        {/* Bar-list fallback */}
        <div className="space-y-3">
          {countries.map((country) => {
            const width = Math.max(4, (country.learners / maxLearners) * 100);
            return (
              <div key={country.code} className="flex items-center gap-3">
                <span className={cn(poppins_500.className, "w-40 shrink-0 truncate text-sm")}>
                  {country.name}
                </span>
                <div className="flex-1">
                  <div className="h-7 w-full overflow-hidden rounded-md bg-muted">
                    <div
                      className="h-full rounded-md bg-gradient-to-r from-secondary/80 to-accent"
                      style={{ width: `${width}%` }}
                    />
                  </div>
                </div>
                <span className={cn(poppins_600.className, "w-16 shrink-0 text-right text-sm")}>
                  {country.learners.toLocaleString()}
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

function TopCountriesTable({ countries }) {
  const totalLearners = countries.reduce((sum, c) => sum + c.learners, 0);
  const totalRevenue = countries.reduce((sum, c) => sum + c.revenue, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <DollarSign className="h-5 w-5" />
          Top Countries
        </CardTitle>
        <CardDescription>
          Learner counts with revenue overlay for the selected period
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[60px]">#</TableHead>
                <TableHead>Country</TableHead>
                <TableHead className="text-right">Learners</TableHead>
                <TableHead className="text-right">Revenue</TableHead>
                <TableHead className="w-[140px]">Share</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {countries.map((country, index) => {
                const share = totalLearners > 0
                  ? Math.round((country.learners / totalLearners) * 100)
                  : 0;
                return (
                  <TableRow key={country.code}>
                    <TableCell className="text-muted-foreground">{index + 1}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className={cn(poppins_500.className, "text-sm")}>
                          {country.name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {country.code}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className={cn(poppins_600.className, "text-sm")}>
                        {country.learners.toLocaleString()}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className={cn(poppins_500.className, "text-sm text-secondary")}>
                        ${country.revenue.toLocaleString()}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full rounded-full bg-accent"
                            style={{ width: `${share}%` }}
                          />
                        </div>
                        <span className="w-9 text-right text-xs text-muted-foreground">
                          {share}%
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
          <p className={cn(poppins_400.className, "text-xs text-muted-foreground")}>
            Showing {countries.length} countries with country data on file.
          </p>
          <div className="flex items-center gap-4">
            <span className={cn(poppins_500.className, "text-xs text-muted-foreground")}>
              Total learners:{" "}
              <span className={cn(poppins_600.className, "text-foreground")}>
                {totalLearners.toLocaleString()}
              </span>
            </span>
            <span className={cn(poppins_500.className, "text-xs text-muted-foreground")}>
              Total revenue:{" "}
              <span className={cn(poppins_600.className, "text-secondary")}>
                ${totalRevenue.toLocaleString()}
              </span>
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function LearningAnalyticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState(90);

  useEffect(() => {
    let active = true;
    setLoading(true);
    const to = new Date().toISOString();
    const from = dateRange > 0
      ? new Date(Date.now() - dateRange * 24 * 60 * 60 * 1000).toISOString()
      : undefined;
    fetchEngagementAnalytics({ from, to })
      .then((engagement) => {
        if (active) {
          setData(engagement);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (active) {
          setError(err?.message || "Failed to load analytics");
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, [dateRange]);

  if (loading) {
    return (
      <PageShell>
        <PageHeader
          icon={BarChart3}
          title="Learning Analytics"
          subtitle="How learners engage with courses and content"
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-32 w-full rounded-2xl" />
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-[380px] w-full rounded-2xl" />
          <Skeleton className="h-[380px] w-full rounded-2xl" />
        </div>
        <Skeleton className="h-[300px] w-full rounded-2xl" />
      </PageShell>
    );
  }

  if (error) {
    return (
      <PageShell>
        <PageHeader
          icon={BarChart3}
          title="Learning Analytics"
          subtitle="How learners engage with courses and content"
        />
        <EmptyState
          icon={AlertTriangle}
          title="Failed to load analytics"
          description={error}
        />
      </PageShell>
    );
  }

  const { totals, funnel, sessionLength, lessonsCompleted, readingDepth, geographic } = data;

  return (
    <PageShell>
      <PageHeader
        icon={BarChart3}
        title="Learning Analytics"
        subtitle="How learners engage with courses and content"
        actions={
          <Select value={String(dateRange)} onValueChange={(v) => setDateRange(Number(v))}>
            <SelectTrigger className="w-[160px]">
              <Calendar className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Date range" />
            </SelectTrigger>
            <SelectContent>
              {DATE_PRESETS.map((preset) => (
                <SelectItem key={preset.days} value={String(preset.days)}>
                  {preset.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
      />

      {/* Summary Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Users} label={totals.students.label} metric={totals.students} />
        <StatCard
          icon={GraduationCap}
          label={totals.coursesEnrolled.label}
          metric={totals.coursesEnrolled}
        />
        <StatCard
          icon={CheckCircle2}
          label={totals.lessonsCompleted.label}
          metric={totals.lessonsCompleted}
        />
        <StatCard
          icon={Clock}
          label={totals.avgSessionLength.label}
          metric={totals.avgSessionLength}
        />
      </div>

      {/* Course Completion Funnel */}
      <CourseCompletionFunnel funnel={funnel} />

      {/* Geographic Distribution */}
      <GeographicDistribution geographic={geographic} />

      {/* Top Countries Table */}
      <TopCountriesTable countries={geographic.countries} />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Average Session Length */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Clock className="h-5 w-5" />
              Average Session Length
            </CardTitle>
            <CardDescription>
              How long learners stay in a single session
            </CardDescription>
          </CardHeader>
          <CardContent>
            <NotTrackedPlaceholder
              icon={Clock}
              title="Average Session Length"
              description="Session duration is not instrumented yet, so no average is available."
            />
          </CardContent>
        </Card>

        {/* Library Reading Depth */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <BookOpen className="h-5 w-5" />
              Library Reading Depth
            </CardTitle>
            <CardDescription>
              How far learners read into books from reader progress events
            </CardDescription>
          </CardHeader>
          <CardContent>
            {readingDepth.tracked ? (
              <ChartContainer config={readingChartConfig} className="h-[260px] w-full">
                <BarChart data={readingDepth.buckets}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke={COLORS.accent}
                    strokeOpacity={0.12}
                  />
                  <XAxis dataKey="range" tickLine={false} axisLine={false} tickMargin={8} />
                  <YAxis tickLine={false} axisLine={false} tickMargin={8} allowDecimals={false} />
                  <ChartTooltip
                    cursor={{ fill: "rgba(0,153,0,0.06)" }}
                    content={<ChartTooltipContent />}
                  />
                  <Bar dataKey="value" fill={COLORS.enrolled} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ChartContainer>
            ) : (
              <NotTrackedPlaceholder
                icon={Eye}
                title="Library Reading Depth"
                description="Reader progress events are only stored on the learner's device, so reading depth can't be aggregated yet."
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Lessons-Completed Distribution */}
      <DistributionChart
        tracked={lessonsCompleted.tracked}
        data={lessonsCompleted.buckets}
        config={lessonsChartConfig}
        icon={CheckCircle2}
        title="Lessons-Completed Distribution"
        description="How many lessons learners complete per course"
        placeholderTitle="Lessons-Completed Distribution"
        placeholderDescription="Per-lesson completion isn't tracked yet, so the distribution can't be computed."
      />
    </PageShell>
  );
}
