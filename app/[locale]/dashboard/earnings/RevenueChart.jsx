"use client";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";

const chartConfig = {
  revenue: { label: "Revenue", color: "#009900" },
};

export default function RevenueChart({ data }) {
  return (
    <ChartContainer config={chartConfig} className="h-72 w-full">
      <BarChart data={data}>
        <CartesianGrid
          strokeDasharray="3 3"
          vertical={false}
          stroke="#265902"
          strokeOpacity={0.12}
        />
        <XAxis
          dataKey="date"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tickFormatter={(val) => {
            const d = new Date(val + "T00:00:00");
            return d.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            });
          }}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tickFormatter={(val) => `$${val}`}
        />
        <ChartTooltip
          cursor={{ fill: "rgba(0,153,0,0.06)" }}
          content={
            <ChartTooltipContent
              formatter={(value) => `$${value.toFixed(2)}`}
            />
          }
        />
        <Bar
          dataKey="revenue"
          fill="var(--color-revenue)"
          radius={[6, 6, 0, 0]}
        />
      </BarChart>
    </ChartContainer>
  );
}
