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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";
import {
  TrendingUp,
  DollarSign,
  BookOpen,
  GraduationCap,
  PieChart as PieChartIcon,
  BarChart3,
  Calendar,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { poppins_400, poppins_500, poppins_600 } from "@/lib/config/font.config";

// Mock revenue data
const revenueByType = [
  { name: "Courses", value: 45230, percentage: 62 },
  { name: "Books", value: 27840, percentage: 38 },
];

const revenueByCategory = [
  { category: "Quran Studies", courses: 12500, books: 8200 },
  { category: "Arabic Language", courses: 9800, books: 6500 },
  { category: "Islamic History", courses: 7200, books: 5100 },
  { category: "Fiqh", courses: 8500, books: 4200 },
  { category: "Hadith Sciences", courses: 4200, books: 2400 },
  { category: "Tafsir", courses: 3030, books: 1440 },
];

const monthlyTrends = [
  { month: "Aug", courses: 5200, books: 3100 },
  { month: "Sep", courses: 6100, books: 3800 },
  { month: "Oct", courses: 7300, books: 4200 },
  { month: "Nov", courses: 8100, books: 4900 },
  { month: "Dec", courses: 9200, books: 5400 },
  { month: "Jan", courses: 9330, books: 6240 },
];

const COLORS = {
  courses: "#009900",
  books: "#00cc66",
  accent: "#265902",
};

const PIE_COLORS = ["#009900", "#00cc66"];

const chartConfig = {
  courses: { label: "Courses", color: COLORS.courses },
  books: { label: "Books", color: COLORS.books },
};

function StatCard({ icon: Icon, label, value, subtext, trend }) {
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
              {value}
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
        {trend !== undefined && (
          <div className={cn(poppins_500.className, "mt-4 flex items-center gap-1 text-sm")}>
            <TrendingUp className="h-4 w-4 text-secondary" />
            <span className="text-secondary">{trend}%</span>
            <span className={cn(poppins_400.className, "ml-1 text-muted-foreground")}>
              vs last period
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function RevenueAnalyticsPage() {
  const [timeRange, setTimeRange] = useState("6m");

  const totalRevenue = revenueByType.reduce((sum, item) => sum + item.value, 0);
  const coursesRevenue = revenueByType.find((r) => r.name === "Courses")?.value || 0;
  const booksRevenue = revenueByType.find((r) => r.name === "Books")?.value || 0;

  return (
    <PageShell>
      <PageHeader
        icon={BarChart3}
        title="Revenue Analytics"
        subtitle="Breakdown of platform revenue by product type and category"
        actions={
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[140px]">
              <Calendar className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1m">Last Month</SelectItem>
              <SelectItem value="3m">Last 3 Months</SelectItem>
              <SelectItem value="6m">Last 6 Months</SelectItem>
              <SelectItem value="1y">Last Year</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>
        }
      />

      {/* Summary Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={DollarSign}
          label="Total Revenue"
          value={`$${totalRevenue.toLocaleString()}`}
          subtext="All confirmed transactions"
          trend={12.5}
        />
        <StatCard
          icon={GraduationCap}
          label="Course Revenue"
          value={`$${coursesRevenue.toLocaleString()}`}
          subtext={`${revenueByType[0].percentage}% of total`}
          trend={15.2}
        />
        <StatCard
          icon={BookOpen}
          label="Book Revenue"
          value={`$${booksRevenue.toLocaleString()}`}
          subtext={`${revenueByType[1].percentage}% of total`}
          trend={8.7}
        />
        <StatCard
          icon={TrendingUp}
          label="Avg. Order Value"
          value="$34.50"
          subtext="Across all products"
          trend={3.2}
        />
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Pie Chart - Courses vs Books Split */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <PieChartIcon className="h-5 w-5" />
              Revenue Split
            </CardTitle>
            <CardDescription>
              Distribution between courses and books
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="mx-auto h-[300px]">
              <PieChart>
                <Pie
                  data={revenueByType}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={4}
                  dataKey="value"
                  nameKey="name"
                  label={({ name, percentage }) => `${name}: ${percentage}%`}
                  labelLine={false}
                >
                  {revenueByType.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={PIE_COLORS[index % PIE_COLORS.length]}
                    />
                  ))}
                </Pie>
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value) => `$${value.toLocaleString()}`}
                    />
                  }
                />
              </PieChart>
            </ChartContainer>
            <div className="mt-4 flex justify-center gap-6">
              {revenueByType.map((item, index) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: PIE_COLORS[index] }}
                  />
                  <span className={cn(poppins_500.className, "text-sm")}>
                    {item.name}
                  </span>
                  <Badge variant="secondary" className="text-xs">
                    ${item.value.toLocaleString()}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Monthly Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="h-5 w-5" />
              Monthly Trends
            </CardTitle>
            <CardDescription>
              Revenue comparison over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <BarChart data={monthlyTrends}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke={COLORS.accent}
                  strokeOpacity={0.12}
                />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`}
                />
                <ChartTooltip
                  cursor={{ fill: "rgba(0,153,0,0.06)" }}
                  content={
                    <ChartTooltipContent
                      formatter={(value) => `$${value.toLocaleString()}`}
                    />
                  }
                />
                <Bar
                  dataKey="courses"
                  fill={COLORS.courses}
                  radius={[4, 4, 0, 0]}
                  name="Courses"
                />
                <Bar
                  dataKey="books"
                  fill={COLORS.books}
                  radius={[4, 4, 0, 0]}
                  name="Books"
                />
                <ChartLegend content={<ChartLegendContent />} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Revenue by Category */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <BarChart3 className="h-5 w-5" />
            Revenue by Category
          </CardTitle>
          <CardDescription>
            Breakdown of courses and books revenue per category
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[400px] w-full">
            <BarChart
              data={revenueByCategory}
              layout="vertical"
              margin={{ left: 120 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                horizontal={true}
                vertical={false}
                stroke={COLORS.accent}
                strokeOpacity={0.12}
              />
              <XAxis
                type="number"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`}
              />
              <YAxis
                type="category"
                dataKey="category"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                width={110}
              />
              <ChartTooltip
                cursor={{ fill: "rgba(0,153,0,0.06)" }}
                content={
                  <ChartTooltipContent
                    formatter={(value) => `$${value.toLocaleString()}`}
                  />
                }
              />
              <Bar
                dataKey="courses"
                fill={COLORS.courses}
                radius={[0, 4, 4, 0]}
                name="Courses"
                stackId="a"
              />
              <Bar
                dataKey="books"
                fill={COLORS.books}
                radius={[0, 4, 4, 0]}
                name="Books"
                stackId="a"
              />
              <ChartLegend content={<ChartLegendContent />} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Category Breakdown Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Category Performance</CardTitle>
          <CardDescription>
            Detailed revenue breakdown by category
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {revenueByCategory.map((cat) => {
              const total = cat.courses + cat.books;
              const coursesPercent = Math.round((cat.courses / total) * 100);
              const booksPercent = 100 - coursesPercent;
              const maxTotal = Math.max(
                ...revenueByCategory.map((c) => c.courses + c.books)
              );
              const barWidth = (total / maxTotal) * 100;

              return (
                <div key={cat.category}>
                  <div className="mb-2 flex items-center justify-between">
                    <span className={cn(poppins_500.className, "text-sm")}>
                      {cat.category}
                    </span>
                    <span className={cn(poppins_600.className, "text-sm")}>
                      ${total.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex h-3 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full transition-all"
                      style={{
                        width: `${(barWidth * coursesPercent) / 100}%`,
                        backgroundColor: COLORS.courses,
                      }}
                    />
                    <div
                      className="h-full transition-all"
                      style={{
                        width: `${(barWidth * booksPercent) / 100}%`,
                        backgroundColor: COLORS.books,
                      }}
                    />
                  </div>
                  <div className="mt-1 flex justify-between text-xs text-muted-foreground">
                    <span>
                      Courses: ${cat.courses.toLocaleString()} ({coursesPercent}%)
                    </span>
                    <span>
                      Books: ${cat.books.toLocaleString()} ({booksPercent}%)
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </PageShell>
  );
}
