"use client";
import { useState } from "react";
import {
  DollarSign,
  ShoppingCart,
  TrendingUp,
  TrendingDown,
  Wallet,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import Button from "@/components/atoms/form/Button";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import WalletConnectButton from "@/components/stellar/WalletConnectButton";
import useEarnings from "@/hooks/useEarnings";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  poppins_400,
  poppins_500,
  poppins_600,
} from "@/lib/config/font.config";

const statusStyles = {
  confirmed: "bg-secondary/10 text-secondary border-secondary/20",
  pending: "bg-amber-100 text-amber-700 border-amber-200",
  submitted: "bg-sky-100 text-sky-700 border-sky-200",
  failed: "bg-red-100 text-red-600 border-red-200",
  expired: "bg-ink/5 text-ink-muted border-accent/10",
};

/* ── building blocks (design-system consistent) ── */

const Panel = ({ className, children }) => (
  <div
    className={cn(
      "rounded-2xl border border-accent/10 bg-surface-raised shadow-sm",
      className
    )}
  >
    {children}
  </div>
);

const PageHeader = () => (
  <div className="flex items-center gap-3">
    <div className="flex size-11 items-center justify-center rounded-2xl border border-accent/5 bg-gradient-to-br from-secondary/20 to-highlight/10">
      <DollarSign className="h-5 w-5 text-accent" />
    </div>
    <div>
      <h1
        className={cn(
          poppins_600,
          "bg-gradient-to-r from-secondary via-highlight to-accent bg-clip-text text-2xl text-transparent"
        )}
      >
        Earnings Dashboard
      </h1>
      <p className={cn(poppins_400, "text-sm text-ink-muted")}>
        Track your sales, revenue, and payout analytics
      </p>
    </div>
  </div>
);

const SectionHeading = ({ title, subtitle, right }) => (
  <div className="mb-5 flex items-start justify-between gap-3">
    <div>
      <h2 className={cn(poppins_600, "text-lg text-ink")}>{title}</h2>
      {subtitle && (
        <p className={cn(poppins_400, "mt-1 text-sm text-ink-muted")}>
          {subtitle}
        </p>
      )}
    </div>
    {right}
  </div>
);

const StatusBadge = ({ status, small }) => (
  <span
    className={cn(
      poppins_500,
      "inline-flex items-center rounded-full border capitalize",
      small ? "px-2 py-0.5 text-[11px]" : "px-3 py-1 text-xs",
      statusStyles[status] || statusStyles.expired
    )}
  >
    {status}
  </span>
);

function SummaryTile({ icon: Icon, label, value, subtext, trend, trendLabel }) {
  return (
    <Panel className="p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-secondary/30">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p
            className={cn(
              poppins_500,
              "text-xs uppercase tracking-wider text-ink-muted"
            )}
          >
            {label}
          </p>
          <p className={cn(poppins_600, "text-3xl text-ink")}>{value}</p>
          {subtext && (
            <p className={cn(poppins_400, "text-xs text-ink-muted")}>
              {subtext}
            </p>
          )}
        </div>
        <div className="flex size-10 items-center justify-center rounded-xl border border-accent/5 bg-gradient-to-br from-secondary/15 to-highlight/10">
          <Icon className="h-5 w-5 text-accent" />
        </div>
      </div>
      {trend !== undefined && (
        <div className={cn(poppins_500, "mt-4 flex items-center gap-1 text-sm")}>
          {trend >= 0 ? (
            <TrendingUp className="h-4 w-4 text-secondary" />
          ) : (
            <TrendingDown className="h-4 w-4 text-red-600" />
          )}
          <span className={trend >= 0 ? "text-secondary" : "text-red-600"}>
            {Math.abs(trend)}%
          </span>
          <span className={cn(poppins_400, "ml-1 text-ink-muted")}>
            {trendLabel}
          </span>
        </div>
      )}
    </Panel>
  );
}

function SummarySkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {[...Array(4)].map((_, i) => (
        <Panel key={i} className="space-y-3 p-5">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-3 w-20" />
        </Panel>
      ))}
    </div>
  );
}

export default function EarningsPage() {
  const {
    isLoading,
    error,
    hasWallet,
    totalEarned,
    salesCount,
    thisMonthRevenue,
    monthOverMonthChange,
    revenueChartData,
    topItems,
    findItemLink,
    statusBreakdown,
    withdrawableBalance,
  } = useEarnings();

  const [chartRange, setChartRange] = useState("30d");
  const chartData = revenueChartData(chartRange);

  if (!hasWallet && !isLoading) {
    return (
      <div className="space-y-6 bg-surface p-4 sm:p-6">
        <PageHeader />
        <Panel className="flex flex-col items-center justify-center gap-4 py-16 text-center">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-secondary/15 to-highlight/10">
            <Wallet className="h-7 w-7 text-accent" />
          </div>
          <div>
            <h3 className={cn(poppins_600, "text-lg text-ink")}>
              Connect Your Wallet
            </h3>
            <p className={cn(poppins_400, "mt-1 text-sm text-ink-muted")}>
              Connect your Stellar wallet to view your earnings and sales
              analytics
            </p>
          </div>
          <WalletConnectButton />
        </Panel>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 bg-surface p-4 sm:p-6">
        <PageHeader />
        <Panel className="flex flex-col items-center justify-center gap-4 py-16 text-center">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-red-50">
            <TrendingDown className="h-7 w-7 text-red-600" />
          </div>
          <div>
            <h3 className={cn(poppins_600, "text-lg text-ink")}>
              Failed to Load Data
            </h3>
            <p className={cn(poppins_400, "mt-1 text-sm text-ink-muted")}>
              {error}
            </p>
          </div>
          <Button round outlined onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </Panel>
      </div>
    );
  }

  const chartConfig = {
    revenue: {
      label: "Revenue",
      theme: {
        light: "var(--color-secondary)",
        dark: "var(--color-secondary)",
      },
    },
  };

  return (
    <div className="space-y-6 bg-surface p-4 sm:p-6">
      <PageHeader />

      {isLoading ? (
        <>
          <SummarySkeleton />
          <Panel className="p-6">
            <Skeleton className="mb-4 h-6 w-48" />
            <Skeleton className="h-64 w-full rounded-xl" />
          </Panel>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {[...Array(2)].map((_, i) => (
              <Panel key={i} className="space-y-4 p-6">
                <Skeleton className="h-6 w-32" />
                {[...Array(4)].map((_, j) => (
                  <Skeleton key={j} className="h-10 w-full rounded-lg" />
                ))}
              </Panel>
            ))}
          </div>
        </>
      ) : totalEarned === 0 && salesCount === 0 ? (
        <>
          <SummarySkeleton />
          <Panel className="flex flex-col items-center justify-center gap-4 py-16 text-center">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-secondary/15 to-highlight/10">
              <DollarSign className="h-7 w-7 text-accent" />
            </div>
            <div>
              <h3 className={cn(poppins_600, "text-lg text-ink")}>
                No Sales Yet
              </h3>
              <p className={cn(poppins_400, "mt-1 text-sm text-ink-muted")}>
                Your earnings will appear here once students purchase your
                courses or books
              </p>
            </div>
          </Panel>
        </>
      ) : (
        <>
          {/* Summary tiles */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <SummaryTile
              icon={DollarSign}
              label="Total Earned (USDC)"
              value={`$${totalEarned.toFixed(2)}`}
              subtext="Confirmed transactions only"
            />
            <SummaryTile
              icon={ShoppingCart}
              label="Sales Count"
              value={salesCount}
              subtext="Total confirmed sales"
            />
            <SummaryTile
              icon={TrendingUp}
              label="This Month"
              value={`$${thisMonthRevenue.toFixed(2)}`}
              trend={monthOverMonthChange}
              trendLabel="vs last month"
            />
            <SummaryTile
              icon={Wallet}
              label="Withdrawable Balance"
              value={`$${withdrawableBalance.toFixed(2)}`}
              subtext="USDC in your wallet"
            />
          </div>

          {/* Revenue chart */}
          <Panel className="p-6">
            <SectionHeading
              title="Revenue Over Time"
              subtitle="Confirmed sales revenue aggregated over time"
              right={
                <div className="flex gap-1.5">
                  {["7d", "30d", "all"].map((range) => (
                    <button
                      key={range}
                      onClick={() => setChartRange(range)}
                      className={cn(
                        poppins_500,
                        "rounded-lg px-3 py-1.5 text-sm transition-all",
                        chartRange === range
                          ? "bg-accent text-white shadow-sm"
                          : "border border-accent/15 bg-surface text-ink-muted hover:border-secondary/40 hover:text-ink"
                      )}
                    >
                      {range === "all" ? "All" : range}
                    </button>
                  ))}
                </div>
              }
            />
            {chartData.length === 0 ? (
              <div
                className={cn(
                  poppins_400,
                  "flex h-64 items-center justify-center text-ink-muted"
                )}
              >
                No revenue data for this period
              </div>
            ) : (
              <ChartContainer config={chartConfig} className="h-72 w-full">
                <BarChart data={chartData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    className="stroke-accent"
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
            )}
          </Panel>

          {/* Bottom grid */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Top items */}
            <Panel className="p-6">
              <SectionHeading
                title="Top Items"
                subtitle="Revenue and units sold per course or book"
              />
              {topItems.length === 0 ? (
                <p
                  className={cn(
                    poppins_400,
                    "py-8 text-center text-sm text-ink-muted"
                  )}
                >
                  No items sold yet
                </p>
              ) : (
                <div className="space-y-4">
                  {topItems.slice(0, 10).map((item, index) => {
                    const link = findItemLink(item.itemTitle, item.itemType);
                    const maxRevenue = topItems[0]?.revenue || 1;
                    const barWidth = (item.revenue / maxRevenue) * 100;
                    return (
                      <div key={`${item.itemType}:${item.itemTitle}`}>
                        <div className="mb-1.5 flex items-center justify-between">
                          <div className="flex min-w-0 flex-1 items-center gap-2">
                            <span
                              className={cn(
                                poppins_600,
                                "text-sm text-ink-muted"
                              )}
                            >
                              #{index + 1}
                            </span>
                            <div className="min-w-0 flex-1">
                              {link ? (
                                <Link
                                  href={link}
                                  className={cn(
                                    poppins_500,
                                    "block truncate text-sm text-ink hover:text-secondary hover:underline"
                                  )}
                                >
                                  {item.itemTitle}
                                </Link>
                              ) : (
                                <p
                                  className={cn(
                                    poppins_500,
                                    "truncate text-sm text-ink"
                                  )}
                                >
                                  {item.itemTitle}
                                </p>
                              )}
                              <span
                                className={cn(
                                  poppins_400,
                                  "text-xs capitalize text-ink-muted"
                                )}
                              >
                                {item.itemType}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4 flex-shrink-0 text-right">
                            <p className={cn(poppins_600, "text-sm text-ink")}>
                              ${item.revenue.toFixed(2)}
                            </p>
                            <p
                              className={cn(
                                poppins_400,
                                "text-xs text-ink-muted"
                              )}
                            >
                              {item.units} sold
                            </p>
                          </div>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-accent/10">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-secondary to-highlight transition-all"
                            style={{ width: `${barWidth}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Panel>

            {/* Status breakdown */}
            <Panel className="p-6">
              <SectionHeading
                title="Transaction Status"
                subtitle="Overview of all your creator transactions by status"
              />
              <div className="space-y-2.5">
                {Object.entries(statusBreakdown)
                  .filter(([, count]) => count > 0)
                  .sort(([, a], [, b]) => b - a)
                  .map(([status, count]) => (
                    <div
                      key={status}
                      className="flex items-center justify-between rounded-xl border border-accent/10 bg-surface p-3"
                    >
                      <StatusBadge status={status} />
                      <span className={cn(poppins_600, "text-ink")}>{count}</span>
                    </div>
                  ))}
                {Object.values(statusBreakdown).every((c) => c === 0) && (
                  <p
                    className={cn(
                      poppins_400,
                      "py-8 text-center text-sm text-ink-muted"
                    )}
                  >
                    No transactions yet
                  </p>
                )}
              </div>
              <div className="mt-4 rounded-xl border border-accent/10 bg-surface p-3">
                <p
                  className={cn(
                    poppins_400,
                    "flex flex-wrap items-center gap-1 text-xs text-ink-muted"
                  )}
                >
                  <strong className={cn(poppins_500, "text-ink")}>Note:</strong>{" "}
                  Only <StatusBadge status="confirmed" small /> transactions
                  count toward your earnings totals.
                </p>
              </div>
            </Panel>
          </div>
        </>
      )}
    </div>
  );
}
