"use client";

import { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const chartConfig = {
  amount: {
    label: "USDC donated",
    color: "var(--color-secondary)",
  },
};

function toDayKey(iso) {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString().slice(0, 10);
}

/**
 * Donations over the recent window (last 14 days), bucketed per day.
 * Source: the recent Horizon payments already shown in the feed, so the chart
 * stays perfectly consistent with the rows above it and updates live as new
 * donations stream in.
 */
export default function DonationChart({ items }) {
  const data = useMemo(() => {
    const buckets = new Map();

    const now = Date.now();
    for (let i = 13; i >= 0; i -= 1) {
      const date = new Date(now - i * 24 * 60 * 60 * 1000);
      const key = date.toISOString().slice(0, 10);
      buckets.set(key, { label: formatDay(date), amount: 0, donations: 0 });
    }

    for (const item of items || []) {
      const key = toDayKey(item.createdAt);
      if (!key || !buckets.has(key)) continue;
      const bucket = buckets.get(key);
      bucket.amount = round(bucket.amount + (Number(item.amount) || 0));
      bucket.donations += 1;
    }

    return Array.from(buckets.values());
  }, [items]);

  return (
    <ChartContainer config={chartConfig} className="h-56 w-full">
      <BarChart data={data} margin={{ top: 8, right: 4, left: 0, bottom: 0 }}>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis
          dataKey="label"
          tickLine={false}
          axisLine={false}
          interval="preserveStartEnd"
          tick={{ fontSize: 11 }}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          width={44}
          tick={{ fontSize: 11 }}
        />
        <ChartTooltip content={<ChartTooltipContent />} cursor={{ fill: "var(--color-accent)", opacity: 0.06 }} />
        <Bar
          dataKey="amount"
          fill="var(--color-amount)"
          radius={[5, 5, 0, 0]}
          maxBarSize={40}
        />
      </BarChart>
    </ChartContainer>
  );
}

function formatDay(date) {
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function round(value) {
  return Math.round(value * 100) / 100;
}
