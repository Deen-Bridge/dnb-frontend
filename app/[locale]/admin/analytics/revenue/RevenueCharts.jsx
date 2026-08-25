"use client";
/**
 * Revenue analytics charts — the recharts-dependent rendering, isolated (#332).
 * ---------------------------------------------------------------------------
 * PERFORMANCE BUDGET: this module is the ONLY place the admin revenue page
 * touches `recharts` (and the recharts-backed `@/components/ui/chart` wrapper),
 * which together are the single heaviest cost on that route. The page loads it
 * with `next/dynamic({ ssr: false })`, so recharts is code-split into its own
 * async chunk and NEVER ships in the route's initial JS — and, because it lives
 * under `app/[locale]/admin/...`, App Router route-level splitting guarantees it
 * can never leak into any learner-facing page's bundle either.
 *
 * Keep it that way: never import this file (or `recharts`, or
 * `@/components/ui/chart`) from the page's static graph or from a shared
 * learner surface. Charts are async-only.
 *
 * Chart-specific constants (colors, config) are passed in as props so the page
 * can keep its own copies for the non-chart table without pulling recharts back
 * into the static import graph.
 */
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";

/** Courses-vs-books split donut. */
export function RevenueSplitChart({ data, config, pieColors }) {
  return (
    <ChartContainer config={config} className="mx-auto h-[300px]">
      <PieChart>
        <Pie
          data={data}
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
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
          ))}
        </Pie>
        <ChartTooltip
          content={<ChartTooltipContent formatter={(value) => `$${value.toLocaleString()}`} />}
        />
      </PieChart>
    </ChartContainer>
  );
}

/** Monthly courses/books revenue bars. */
export function MonthlyTrendsChart({ data, config, colors }) {
  return (
    <ChartContainer config={config} className="h-[300px] w-full">
      <BarChart data={data}>
        <CartesianGrid
          strokeDasharray="3 3"
          vertical={false}
          stroke={colors.accent}
          strokeOpacity={0.12}
        />
        <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
        <YAxis
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`}
        />
        <ChartTooltip
          cursor={{ fill: "rgba(0,153,0,0.06)" }}
          content={<ChartTooltipContent formatter={(value) => `$${value.toLocaleString()}`} />}
        />
        <Bar dataKey="courses" fill={colors.courses} radius={[4, 4, 0, 0]} name="Courses" />
        <Bar dataKey="books" fill={colors.books} radius={[4, 4, 0, 0]} name="Books" />
        <ChartLegend content={<ChartLegendContent />} />
      </BarChart>
    </ChartContainer>
  );
}

/** Horizontal stacked bars: revenue per category. */
export function RevenueByCategoryChart({ data, config, colors }) {
  return (
    <ChartContainer config={config} className="h-[400px] w-full">
      <BarChart data={data} layout="vertical" margin={{ left: 120 }}>
        <CartesianGrid
          strokeDasharray="3 3"
          horizontal={true}
          vertical={false}
          stroke={colors.accent}
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
          content={<ChartTooltipContent formatter={(value) => `$${value.toLocaleString()}`} />}
        />
        <Bar dataKey="courses" fill={colors.courses} radius={[0, 4, 4, 0]} name="Courses" stackId="a" />
        <Bar dataKey="books" fill={colors.books} radius={[0, 4, 4, 0]} name="Books" stackId="a" />
        <ChartLegend content={<ChartLegendContent />} />
      </BarChart>
    </ChartContainer>
  );
}
