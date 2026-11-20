"use client";

import { useEffect, useState, useMemo } from "react";
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
import { Button } from "@/components/ui/button";
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
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Line,
  LineChart,
} from "recharts";
import {
  Search,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Calendar,
  MousePointerClick,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  FileQuestion,
  Eye,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { poppins_400, poppins_500, poppins_600 } from "@/lib/config/font.config";
import { fetchSearchAnalytics } from "@/lib/actions/admin-search-analytics";

const COLORS = {
  queries: "#009900",
  zeroResults: "#dc2626",
  accent: "#265902",
  ctr: "#00cc66",
};

const trendsChartConfig = {
  queries: { label: "Queries", color: COLORS.queries },
  zeroResults: { label: "Zero Results", color: COLORS.zeroResults },
};

const ctrChartConfig = {
  clickThroughRate: { label: "Click-Through Rate", color: COLORS.ctr },
};

function TrendBadge({ value }) {
  if (value === null || value === undefined) return <span className="text-muted-foreground">—</span>;

  if (value > 0) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-secondary">
        <ArrowUpRight className="h-3 w-3" />
        {Math.abs(value).toFixed(1)}%
      </span>
    );
  }
  if (value < 0) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-red-600">
        <ArrowDownRight className="h-3 w-3" />
        {Math.abs(value).toFixed(1)}%
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground">
      <Minus className="h-3 w-3" />
      0%
    </span>
  );
}

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
                {metric.unit === "%"
                  ? metric.value !== null
                    ? `${metric.value.toFixed(1)}%`
                    : "—"
                  : metric.value.toLocaleString()}
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

function TopQueriesTable({ queries, tracked }) {
  if (!tracked || queries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-muted-foreground/30 bg-muted/30 px-6 py-12 text-center">
        <div className="flex size-12 items-center justify-center rounded-xl bg-muted">
          <Search className="h-6 w-6 text-muted-foreground" />
        </div>
        <div>
          <div className="flex items-center justify-center gap-2">
            <h3 className={cn(poppins_600.className, "text-base text-foreground")}>
              Top Queries
            </h3>
            <Badge variant="outline" className="text-xs text-muted-foreground">
              {tracked ? "No data yet" : "Not tracked yet"}
            </Badge>
          </div>
          <p className={cn(poppins_400.className, "mx-auto mt-1 max-w-md text-sm text-muted-foreground")}>
            {tracked
              ? "No search queries have been recorded in this period."
              : "Search query events are not being recorded yet, so no top queries are available."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-8">#</TableHead>
          <TableHead>Query</TableHead>
          <TableHead className="text-right">Searches</TableHead>
          <TableHead className="text-right">Click-Through Rate</TableHead>
          <TableHead className="text-right">Trend (WoW)</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {queries.map((q, index) => (
          <TableRow key={q.query}>
            <TableCell className="text-muted-foreground">{index + 1}</TableCell>
            <TableCell className={cn(poppins_500.className, "font-medium")}>
              {q.query}
            </TableCell>
            <TableCell className="text-right tabular-nums">
              {q.count.toLocaleString()}
            </TableCell>
            <TableCell className="text-right tabular-nums">
              {q.clickThroughRate !== null ? `${q.clickThroughRate.toFixed(1)}%` : "—"}
            </TableCell>
            <TableCell className="text-right">
              <TrendBadge value={q.trend} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function ZeroResultQueriesList({ queries, tracked }) {
  if (!tracked || queries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-muted-foreground/30 bg-muted/30 px-6 py-12 text-center">
        <div className="flex size-12 items-center justify-center rounded-xl bg-muted">
          <FileQuestion className="h-6 w-6 text-muted-foreground" />
        </div>
        <div>
          <div className="flex items-center justify-center gap-2">
            <h3 className={cn(poppins_600.className, "text-base text-foreground")}>
              Zero-Result Queries
            </h3>
            <Badge variant="outline" className="text-xs text-muted-foreground">
              {tracked ? "No data yet" : "Not tracked yet"}
            </Badge>
          </div>
          <p className={cn(poppins_400.className, "mx-auto mt-1 max-w-md text-sm text-muted-foreground")}>
            {tracked
              ? "No zero-result queries have been recorded in this period."
              : "Zero-result search events are not being recorded yet. This list will surface content gaps once tracking is enabled."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-8">#</TableHead>
          <TableHead>Query</TableHead>
          <TableHead className="text-right">Searches</TableHead>
          <TableHead className="text-right">Last Searched</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {queries.map((q, index) => (
          <TableRow key={q.query}>
            <TableCell className="text-muted-foreground">{index + 1}</TableCell>
            <TableCell className={cn(poppins_500.className, "font-medium")}>
              {q.query}
            </TableCell>
            <TableCell className="text-right tabular-nums">
              {q.count.toLocaleString()}
            </TableCell>
            <TableCell className="text-right text-sm text-muted-foreground">
              {new Date(q.lastSearched).toLocaleDateString()}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export default function SearchAnalyticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState("30d");

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);

    const now = new Date();
    let from;

    switch (timeRange) {
      case "7d":
        from = new Date(now);
        from.setDate(from.getDate() - 7);
        break;
      case "14d":
        from = new Date(now);
        from.setDate(from.getDate() - 14);
        break;
      case "30d":
        from = new Date(now);
        from.setDate(from.getDate() - 30);
        break;
      case "90d":
        from = new Date(now);
        from.setDate(from.getDate() - 90);
        break;
      case "1y":
        from = new Date(now);
        from.setFullYear(from.getFullYear() - 1);
        break;
      default:
        from = new Date(now);
        from.setDate(from.getDate() - 30);
    }

    fetchSearchAnalytics({ from: from.toISOString(), to: now.toISOString() })
      .then((analytics) => {
        if (active) {
          setData(analytics);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (active) {
          setError(err?.message || "Failed to load search analytics");
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [timeRange]);

  if (loading) {
    return (
      <PageShell>
        <PageHeader
          icon={Search}
          title="Search Analytics"
          subtitle="What users search for, content gaps, and query performance"
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
        <Skeleton className="h-[300px] w-full rounded-2xl" />
      </PageShell>
    );
  }

  if (error) {
    return (
      <PageShell>
        <PageHeader
          icon={Search}
          title="Search Analytics"
          subtitle="What users search for, content gaps, and query performance"
        />
        <EmptyState
          icon={AlertTriangle}
          title="Failed to load search analytics"
          description={error}
        />
      </PageShell>
    );
  }

  const { totals, topQueries, zeroResultQueries, weeklyTrends } = data;

  return (
    <PageShell>
      <PageHeader
        icon={Search}
        title="Search Analytics"
        subtitle="What users search for, content gaps, and query performance"
        actions={
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[140px]">
              <Calendar className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 Days</SelectItem>
              <SelectItem value="14d">Last 14 Days</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
              <SelectItem value="90d">Last 90 Days</SelectItem>
              <SelectItem value="1y">Last Year</SelectItem>
            </SelectContent>
          </Select>
        }
      />

      {/* Summary Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Search}
          label={totals.totalQueries.label}
          metric={totals.totalQueries}
        />
        <StatCard
          icon={Eye}
          label={totals.uniqueQueries.label}
          metric={totals.uniqueQueries}
        />
        <StatCard
          icon={FileQuestion}
          label={totals.zeroResultQueries.label}
          metric={totals.zeroResultQueries}
        />
        <StatCard
          icon={MousePointerClick}
          label={totals.avgClickThroughRate.label}
          metric={totals.avgClickThroughRate}
        />
      </div>

      {/* Weekly Trends Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Query Volume & Zero Results Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="h-5 w-5" />
              Weekly Query Volume
            </CardTitle>
            <CardDescription>
              Total searches and zero-result queries over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            {weeklyTrends.some((w) => w.queries > 0 || w.zeroResults > 0) ? (
              <ChartContainer config={trendsChartConfig} className="h-[260px] w-full">
                <BarChart data={weeklyTrends}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke={COLORS.accent}
                    strokeOpacity={0.12}
                  />
                  <XAxis dataKey="week" tickLine={false} axisLine={false} tickMargin={8} />
                  <YAxis tickLine={false} axisLine={false} tickMargin={8} allowDecimals={false} />
                  <ChartTooltip
                    cursor={{ fill: "rgba(0,153,0,0.06)" }}
                    content={<ChartTooltipContent />}
                  />
                  <Bar
                    dataKey="queries"
                    fill={COLORS.queries}
                    radius={[4, 4, 0, 0]}
                    name="Queries"
                  />
                  <Bar
                    dataKey="zeroResults"
                    fill={COLORS.zeroResults}
                    radius={[4, 4, 0, 0]}
                    name="Zero Results"
                  />
                  <ChartLegend content={<ChartLegendContent />} />
                </BarChart>
              </ChartContainer>
            ) : (
              <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-muted-foreground/30 bg-muted/30 px-6 py-12 text-center">
                <div className="flex size-12 items-center justify-center rounded-xl bg-muted">
                  <TrendingUp className="h-6 w-6 text-muted-foreground" />
                </div>
                <div>
                  <Badge variant="outline" className="text-xs text-muted-foreground">
                    Not tracked yet
                  </Badge>
                  <p className={cn(poppins_400.className, "mx-auto mt-2 max-w-md text-sm text-muted-foreground")}>
                    Search event tracking is not enabled yet. Once enabled, weekly query volume and zero-result trends will appear here.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Click-Through Rate Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <MousePointerClick className="h-5 w-5" />
              Click-Through Rate Trend
            </CardTitle>
            <CardDescription>
              Average click-through rate across search results per week
            </CardDescription>
          </CardHeader>
          <CardContent>
            {weeklyTrends.some((w) => w.clickThroughRate !== null) ? (
              <ChartContainer config={ctrChartConfig} className="h-[260px] w-full">
                <LineChart data={weeklyTrends}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke={COLORS.accent}
                    strokeOpacity={0.12}
                  />
                  <XAxis dataKey="week" tickLine={false} axisLine={false} tickMargin={8} />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    domain={[0, 100]}
                    tickFormatter={(val) => `${val}%`}
                  />
                  <ChartTooltip
                    cursor={{ fill: "rgba(0,153,0,0.06)" }}
                    content={
                      <ChartTooltipContent
                        formatter={(value) =>
                          value !== null ? `${Number(value).toFixed(1)}%` : "—"
                        }
                      />
                    }
                  />
                  <Line
                    type="monotone"
                    dataKey="clickThroughRate"
                    stroke={COLORS.ctr}
                    strokeWidth={2}
                    dot={{ fill: COLORS.ctr, strokeWidth: 0, r: 4 }}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                    connectNulls={false}
                    name="Click-Through Rate"
                  />
                  <ChartLegend content={<ChartLegendContent />} />
                </LineChart>
              </ChartContainer>
            ) : (
              <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-muted-foreground/30 bg-muted/30 px-6 py-12 text-center">
                <div className="flex size-12 items-center justify-center rounded-xl bg-muted">
                  <MousePointerClick className="h-6 w-6 text-muted-foreground" />
                </div>
                <div>
                  <Badge variant="outline" className="text-xs text-muted-foreground">
                    Not tracked yet
                  </Badge>
                  <p className={cn(poppins_400.className, "mx-auto mt-2 max-w-md text-sm text-muted-foreground")}>
                    Click-through rate data is not available yet. This chart will populate once search-result interactions are instrumented.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top Queries Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Search className="h-5 w-5" />
            Top Queries
          </CardTitle>
          <CardDescription>
            Most frequently searched terms with click-through rates and week-over-week trends
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TopQueriesTable queries={topQueries} tracked={totals.totalQueries.tracked} />
        </CardContent>
      </Card>

      {/* Zero-Result Queries — Content Gap Signal */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileQuestion className="h-5 w-5" />
            Zero-Result Queries
          </CardTitle>
          <CardDescription>
            Searches that returned no results — these signal content gaps that can inform acquisition decisions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ZeroResultQueriesList
            queries={zeroResultQueries}
            tracked={totals.zeroResultQueries.tracked}
          />
        </CardContent>
      </Card>
    </PageShell>
  );
}
