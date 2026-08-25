"use client";

import { useState, useMemo } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
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

const MOCK_DATA = {
  all: {
    "7d":   { visitor: 12400, signup: 3720, first_purchase: 890, repeat_buyer: 215 },
    "30d":  { visitor: 48200, signup: 14460, first_purchase: 3470, repeat_buyer: 830 },
    "90d":  { visitor: 134000, signup: 40200, first_purchase: 9650, repeat_buyer: 2310 },
    "6m":   { visitor: 261000, signup: 78300, first_purchase: 18790, repeat_buyer: 4510 },
    "1y":   { visitor: 498000, signup: 149400, first_purchase: 35860, repeat_buyer: 8610 },
  },
  student: {
    "7d":   { visitor: 8700, signup: 2910, first_purchase: 710, repeat_buyer: 175 },
    "30d":  { visitor: 33800, signup: 11590, first_purchase: 2830, repeat_buyer: 690 },
    "90d":  { visitor: 94000, signup: 32640, first_purchase: 7920, repeat_buyer: 1920 },
    "6m":   { visitor: 183000, signup: 63420, first_purchase: 15500, repeat_buyer: 3750 },
    "1y":   { visitor: 349000, signup: 120800, first_purchase: 29520, repeat_buyer: 7170 },
  },
  teacher: {
    "7d":   { visitor: 2100, signup: 520, first_purchase: 120, repeat_buyer: 28 },
    "30d":  { visitor: 8200, signup: 2050, first_purchase: 470, repeat_buyer: 110 },
    "90d":  { visitor: 22800, signup: 5700, first_purchase: 1310, repeat_buyer: 310 },
    "6m":   { visitor: 44400, signup: 11100, first_purchase: 2550, repeat_buyer: 600 },
    "1y":   { visitor: 84600, signup: 21150, first_purchase: 4860, repeat_buyer: 1150 },
  },
  admin: {
    "7d":   { visitor: 320, signup: 45, first_purchase: 8, repeat_buyer: 2 },
    "30d":  { visitor: 1200, signup: 170, first_purchase: 30, repeat_buyer: 7 },
    "90d":  { visitor: 3400, signup: 480, first_purchase: 85, repeat_buyer: 20 },
    "6m":   { visitor: 6600, signup: 930, first_purchase: 165, repeat_buyer: 40 },
    "1y":   { visitor: 12600, signup: 1770, first_purchase: 315, repeat_buyer: 76 },
  },
  guest: {
    "7d":   { visitor: 1280, signup: 245, first_purchase: 52, repeat_buyer: 10 },
    "30d":  { visitor: 5000, signup: 650, first_purchase: 140, repeat_buyer: 23 },
    "90d":  { visitor: 13800, signup: 1380, first_purchase: 335, repeat_buyer: 60 },
    "6m":   { visitor: 27000, signup: 2850, first_purchase: 575, repeat_buyer: 120 },
    "1y":   { visitor: 51800, signup: 5680, first_purchase: 1165, repeat_buyer: 214 },
  },
};

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
                <span
                  className={cn(
                    poppins_400.className,
                    "text-xs text-muted-foreground"
                  )}
                >
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
                    className={cn(
                      poppins_500.className,
                      "text-xs tabular-nums text-destructive"
                    )}
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
        <CardDescription>
          How each funnel stage and conversion rate is calculated
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2">
          {FUNNEL_STAGES.map((stage) => {
            const Icon = stage.icon;
            return (
              <div
                key={stage.key}
                className="rounded-lg border p-4 space-y-2"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="flex h-7 w-7 items-center justify-center rounded-lg"
                    style={{ backgroundColor: `${stage.color}18` }}
                  >
                    <Icon className="h-4 w-4" style={{ color: stage.color }} />
                  </div>
                  <span className={cn(poppins_600.className, "text-sm")}>
                    {stage.label}
                  </span>
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
              <p className={cn(poppins_500.className, "text-sm")}>
                Conversion Rate
              </p>
              <p
                className={cn(
                  poppins_400.className,
                  "text-xs text-muted-foreground leading-relaxed"
                )}
              >
                The percentage of users at a given stage relative to the total
                number of visitors. For example, &quot;First Purchase conversion rate&quot;
                = (First Purchase count / Visitor count) × 100. Drop-off
                percentages show the percentage lost between two adjacent
                stages: ((Stage A - Stage B) / Stage A) × 100.
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

export default function FunnelAnalyticsPage() {
  const [role, setRole] = useState("all");
  const [timeframe, setTimeframe] = useState("30d");

  const data = useMemo(
    () => MOCK_DATA[role]?.[timeframe] || MOCK_DATA.all["30d"],
    [role, timeframe]
  );

  const chartData = useMemo(
    () =>
      FUNNEL_STAGES.map((stage) => ({
        name: stage.label,
        value: data[stage.key],
        fill: stage.color,
      })),
    [data]
  );

  return (
    <PageShell>
      <PageHeader
        icon={Filter}
        title="Conversion Funnel"
        subtitle="Visitor-to-purchase conversion tracking across signup, purchase, and retention stages"
        actions={
          <div className="flex items-center gap-2">
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger className="w-[150px]">
                <Users className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                {ROLES.map((r) => (
                  <SelectItem key={r.value} value={r.value}>
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={timeframe} onValueChange={setTimeframe}>
              <SelectTrigger className="w-[160px]">
                <Calendar className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Timeframe" />
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
        }
      />

      {/* Summary Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {FUNNEL_STAGES.map((stage) => {
          const Icon = stage.icon;
          return (
            <StatCard
              key={stage.key}
              icon={Icon}
              label={stage.label}
              value={data[stage.key]}
              subtext={`${getConversionRate(
                data.visitor,
                data[stage.key]
              ).toFixed(1)}% of visitors`}
            />
          );
        })}
      </div>

      {/* Funnel Visual + Chart */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Visual Funnel */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Funnel Stages</CardTitle>
            <CardDescription>
              User progression from visitor to repeat buyer
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FunnelVisual stages={FUNNEL_STAGES} data={data} />
          </CardContent>
        </Card>

        {/* Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Stage Comparison</CardTitle>
            <CardDescription>
              Absolute user counts at each funnel stage
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[380px] w-full">
              <BarChart
                data={chartData}
                layout="vertical"
                margin={{ left: 20, right: 20 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  horizontal={true}
                  vertical={false}
                  stroke="#265902"
                  strokeOpacity={0.12}
                />
                <XAxis
                  type="number"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(val) =>
                    val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val
                  }
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  width={120}
                />
                <ChartTooltip
                  cursor={{ fill: "rgba(0,153,0,0.06)" }}
                  content={
                    <ChartTooltipContent
                      formatter={(value) => value.toLocaleString()}
                    />
                  }
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Conversion Rate Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Conversion Rates</CardTitle>
          <CardDescription>
            Drop-off and conversion between each funnel stage
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FUNNEL_STAGES.slice(0, -1).map((stage, index) => {
              const next = FUNNEL_STAGES[index + 1];
              const fromValue = data[stage.key];
              const toValue = data[next.key];
              const stageDropOff = getDropOff(fromValue, toValue);
              const overallConversion = getConversionRate(data.visitor, toValue);

              return (
                <div
                  key={`${stage.key}-${next.key}`}
                  className="rounded-lg border p-4 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className={cn(poppins_500.className, "text-xs text-muted-foreground")}>
                      {stage.label} → {next.label}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className={cn(poppins_600.className, "text-2xl tabular-nums")}>
                      {stageDropOff.toFixed(1)}%
                    </span>
                    <span
                      className={cn(poppins_400.className, "text-xs text-muted-foreground")}
                    >
                      drop-off
                    </span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{stage.label}:</span>
                      <span className="tabular-nums">{fromValue.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{next.label}:</span>
                      <span className="tabular-nums">{toValue.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-secondary/80 to-accent transition-all"
                      style={{ width: `${100 - stageDropOff}%` }}
                    />
                  </div>
                  <p
                    className={cn(
                      poppins_400.className,
                      "text-xs text-muted-foreground"
                    )}
                  >
                    {overallConversion.toFixed(1)}% of all visitors reach {next.label}
                  </p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Metric Definitions */}
      <MetricDefinitions />
    </PageShell>
  );
}
