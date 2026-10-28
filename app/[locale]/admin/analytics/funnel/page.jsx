"use client";

import { useState, useEffect, useMemo } from "react";
import { PageShell } from "@/components/ui/page-shell";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell } from "recharts";
import {
  Filter,
  Users,
  UserPlus,
  ShoppingCart,
  Repeat,
  TrendingDown,
  Info,
  HelpCircle,
  Calendar,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { poppins_400, poppins_500, poppins_600 } from "@/lib/config/font.config";

const FUNNEL_STAGES = [
  {
    key: "visitor",
    label: "Visitors",
    icon: Users,
    color: "#009900",
    definition:
      "Unique users who loaded any page on the platform within the selected timeframe. Counted once per user regardless of session count.",
  },
  {
    key: "signup",
    label: "Signups",
    icon: UserPlus,
    color: "#00b359",
    definition:
      "Visitors who completed account registration (email verified or social OAuth). Only counted after the confirmation email is clicked or OAuth callback succeeds.",
  },
  {
    key: "first_purchase",
    label: "First Purchase",
    icon: ShoppingCart,
    color: "#00cc66",
    definition:
      "Signed-up users who completed at least one successful purchase (course or book) with payment confirmed. A user is counted once at this stage even if they make multiple purchases.",
  },
  {
    key: "repeat_buyer",
    label: "Repeat Buyer",
    icon: Repeat,
    color: "#265902",
    definition:
      "Users who completed two or more successful purchases within the selected timeframe. Indicates returning customer behaviour and product-market fit.",
  },
];

const ROLES = [
  { value: "all", label: "All Roles" },
  { value: "student", label: "Student" },
  { value: "teacher", label: "Teacher" },
  { value: "admin", label: "Admin" },
  { value: "guest", label: "Guest" },
];

const TIMEFRAMES = [
  { value: "7d", label: "Last 7 Days" },
  { value: "30d", label: "Last 30 Days" },
  { value: "90d", label: "Last 90 Days" },
  { value: "6m", label: "Last 6 Months" },
  { value: "1y", label: "Last Year" },
];

function getDropOff(from, to) {
  if (from === 0) return 0;
  return ((from - to) / from) * 100;
}

function getConversionRate(top, bottom) {
  if (top === 0) return 0;
  return (bottom / top) * 100;
}

function StatCard({ icon: Icon, label, value, subtext }) {
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
            <p className={cn(poppins_600.className, "text-3xl text-foreground")}>
              {value.toLocaleString()}
            </p>
            {subtext && (
              <p className={cn(poppins_400.className, "text-xs text-muted-foreground")}>
                {subtext}
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

function FunnelVisual({ stages, data }) {
  const maxValue = data.visitor || 1;

  return (
    <div className="space-y-3">
      {stages.map((stage, index) => {
        const value = data[stage.key] || 0;
        const width = Math.max(8, (value / maxValue) * 100);
        const Icon = stage.icon;

        return (
          <div key={stage.key} className="space-y-1">
            <div className="flex items-center gap-3">
              <span className={cn(poppins_500.className, "w-32 shrink-0 text-sm")}>
                {stage.label}
              </span>
              <div className="flex-1">
                <div className="h-10 w-full overflow-hidden rounded-lg bg-muted">
                  <div
                    className="h-full rounded-lg transition-all duration-500"
                    style={{
                      width: `${width}%`,
                      backgroundColor: stage.color,
                    }}
                  />
                </div>
              </div>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="shrink-0 text-muted-foreground hover:text-foreground transition-colors">
                    <Info className="h-4 w-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="left" className="max-w-xs">
                  <p>{stage.definition}</p>
                </TooltipContent>
              </Tooltip>
            </div>

            <div className="flex items-center justify-between pl-0 pr-1">
              <span className={cn(poppins_600.className, "text-sm tabular-nums")}>
                {value.toLocaleString()}
              </span>
              {index > 0 && (
                <span className={cn(poppins_400.className, "text-xs text-muted-foreground")}>
                  {getConversionRate(data[stages[0].key], value).toFixed(1)}% of visitors
                </span>
              )}
            </div>

            {index < stages.length - 1 && (
              <div className="flex items-center justify-center gap-2 py-1">
                <div className="h-px flex-1 bg-border" />
                <div className="flex items-center gap-1.5 rounded-full bg-destructive/10 px-3 py-1">
                  <TrendingDown className="h-3 w-3 text-destructive" />
                  <span
                    className={cn(poppins_500.className, "text-xs tabular-nums text-destructive")}
                  >
                    {getDropOff(value, data[stages[index + 1].key]).toFixed(1)}% drop-off
                  </span>
                </div>
                <div className="h-px flex-1 bg-border" />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function MetricDefinitions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <HelpCircle className="h-5 w-5" />
          Metric Definitions
        </CardTitle>
        <CardDescription>How each funnel stage and conversion rate is calculated</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2">
          {FUNNEL_STAGES.map((stage) => {
            const Icon = stage.icon;
            return (
              <div key={stage.key} className="rounded-lg border p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <div
                    className="flex h-7 w-7 items-center justify-center rounded-lg"
                    style={{ backgroundColor: `${stage.color}18` }}
                  >
                    <Icon className="h-4 w-4" style={{ color: stage.color }} />
                  </div>
                  <span className={cn(poppins_600.className, "text-sm")}>{stage.label}</span>
                </div>
                <p
                  className={cn(
                    poppins_400.className,
                    "text-xs text-muted-foreground leading-relaxed"
                  )}
                >
                  {stage.definition}
                </p>
              </div>
            );
          })}
        </div>

        <div className="mt-6 rounded-lg border border-dashed p-4">
          <div className="flex items-start gap-2">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
            <div className="space-y-1">
              <p className={cn(poppins_500.className, "text-sm")}>Conversion Rate</p>
              <p
                className={cn(
                  poppins_400.className,
                  "text-xs text-muted-foreground leading-relaxed"
                )}
              >
                The percentage of users at a given stage relative to the total number of visitors.
                For example, &quot;First Purchase conversion rate&quot; = (First Purchase count /
                Visitor count) × 100. Drop-off percentages show the percentage lost between two
                adjacent stages: ((Stage A - Stage B) / Stage A) × 100.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

const chartConfig = {
  visitor: { label: "Visitors", color: "#009900" },
  signup: { label: "Signups", color: "#00b359" },
  first_purchase: { label: "First Purchase", color: "#00cc66" },
  repeat_buyer: { label: "Repeat Buyer", color: "#265902" },
};

const EMPTY_FUNNEL = {
  visitor: 0,
  signup: 0,
  first_purchase: 0,
  repeat_buyer: 0,
};

export default function FunnelAnalyticsPage() {
  const [role, setRole] = useState("all");
  const [timeframe, setTimeframe] = useState("30d");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchFunnel() {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({ role, timeframe });
        const res = await fetch(`/api/admin/analytics/funnel?${params.toString()}`, {
          signal: controller.signal,
          credentials: "include",
        });
        if (!res.ok) {
          throw new Error(`Failed to load funnel data (${res.status})`);
        }
        const json = await res.json();
        setData(json?.data ?? json ?? EMPTY_FUNNEL);
      } catch (err) {
        if (err.name === "AbortError") return;
        setError(err.message || "Unable to load funnel data");
        setData(EMPTY_FUNNEL);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    fetchFunnel();
    return () => controller.abort();
  }, [role, timeframe]);

  const funnelData = data ?? EMPTY_FUNNEL;

  const chartData = useMemo(
    () =>
      FUNNEL_STAGES.map((stage) => ({
        name: stage.label,
        value: funnelData[stage.key] || 0,
        color: stage.color,
      })),
    [funnelData]
  );

  const hasData = FUNNEL_STAGES.some((stage) => (funnelData[stage.key] || 0) > 0);

  return (
    <PageShell>
      <PageHeader
        title="Funnel Analytics"
        description="Track user journey from visit to repeat purchase"
      />

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={role} onValueChange={setRole}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ROLES.map((r) => (
                <SelectItem key={r.value} value={r.value}>
                  {r.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TIMEFRAMES.map((t) => (
                <SelectItem key={t.value} value={t.value}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {error && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="flex items-center gap-3 p-5">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <p className={cn(poppins_500.className, "text-sm text-destructive")}>{error}</p>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <Card>
          <CardContent className="flex items-center justify-center gap-3 p-16">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            <span className={cn(poppins_400.className, "text-sm text-muted-foreground")}>
              Loading funnel data …
            </span>
          </CardContent>
        </Card>
      ) : hasData ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {FUNNEL_STAGES.map((stage) => (
              <StatCard
                key={stage.key}
                icon={stage.icon}
                label={stage.label}
                value={funnelData[stage.key] || 0}
                subtext={
                  stage.key === "visitor"
                    ? "Top of funnel"
                    : `${getConversionRate(funnelData.visitor, funnelData[stage.key] || 0).toFixed(
                        1
                      )}% of visitors`
                }
              />
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Conversion Funnel</CardTitle>
              <CardDescription>Stage-by-stage volumes and drop-off rates</CardDescription>
            </CardHeader>
            <CardContent>
              <FunnelVisual stages={FUNNEL_STAGES} data={funnelData} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Funnel Volumes</CardTitle>
              <CardDescription>Comparative volume across each funnel stage</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[300px] w-full">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <MetricDefinitions />
        </>
      ) : (
        <Card>
          <CardContent className="flex flex-column items-center justify-center gap-2 p-16">
            <Info className="h-6 w-6 text-muted-foreground" />
            <p className={cn(poppins_500.className, "text-sm")}>
              No funnel data for this selection
            </p>
            <p className={cn(poppins_400.className, "text-xs text-muted-foreground")}>
              Try a different role or timeframe.
            </p>
          </CardContent>
        </Card>
      )}
    </PageShell>
  );
}
