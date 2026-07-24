"use client";
import { useState } from "react";
import { DollarSign, ShoppingCart, TrendingUp, TrendingDown, Wallet } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import WalletConnectButton from "@/components/stellar/WalletConnectButton";
import useEarnings from "@/hooks/useEarnings";
import Link from "next/link";

const statusColors = {
  confirmed: "bg-green-100 text-green-800",
  pending: "bg-yellow-100 text-yellow-800",
  submitted: "bg-blue-100 text-blue-800",
  failed: "bg-red-100 text-red-800",
  expired: "bg-gray-100 text-gray-800",
};

function SummaryTile({ icon: Icon, label, value, subtext, trend, trendLabel }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="text-3xl font-bold">{value}</p>
            {subtext && (
              <p className="text-xs text-muted-foreground">{subtext}</p>
            )}
          </div>
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Icon className="h-5 w-5 text-primary" />
          </div>
        </div>
        {trend !== undefined && (
          <div className="mt-4 flex items-center gap-1 text-sm">
            {trend >= 0 ? (
              <TrendingUp className="h-4 w-4 text-green-600" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600" />
            )}
            <span className={trend >= 0 ? "text-green-600" : "text-red-600"}>
              {Math.abs(trend)}%
            </span>
            <span className="text-muted-foreground ml-1">{trendLabel}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function SummarySkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <Card key={i}>
          <CardContent className="pt-6 space-y-3">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-3 w-20" />
          </CardContent>
        </Card>
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
      <div className="p-4 sm:p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Earnings Dashboard</h1>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center space-y-4">
            <Wallet className="h-12 w-12 text-muted-foreground" />
            <div>
              <h3 className="font-semibold text-lg">Connect Your Wallet</h3>
              <p className="text-muted-foreground text-sm mt-1">
                Connect your Stellar wallet to view your earnings and sales analytics
              </p>
            </div>
            <WalletConnectButton variant="default" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 sm:p-6 space-y-6">
        <h1 className="text-2xl font-bold">Earnings Dashboard</h1>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center space-y-4">
            <div className="rounded-full bg-red-100 p-3">
              <TrendingDown className="h-8 w-8 text-red-600" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Failed to Load Data</h3>
              <p className="text-muted-foreground text-sm mt-1">{error}</p>
            </div>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const chartConfig = {
    revenue: {
      label: "Revenue",
      color: "hsl(var(--primary))",
    },
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Earnings Dashboard</h1>
          <p className="text-muted-foreground text-sm">
            Track your sales, revenue, and payout analytics
          </p>
        </div>
      </div>

      {isLoading ? (
        <>
          <SummarySkeleton />
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-36" />
              </CardHeader>
              <CardContent className="space-y-3">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-8 w-full" />
                ))}
              </CardContent>
            </Card>
          </div>
        </>
      ) : totalEarned === 0 && salesCount === 0 ? (
        <>
          <SummarySkeleton />
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16 text-center space-y-4">
              <DollarSign className="h-12 w-12 text-muted-foreground" />
              <div>
                <h3 className="font-semibold text-lg">No Sales Yet</h3>
                <p className="text-muted-foreground text-sm mt-1">
                  Your earnings will appear here once students purchase your courses or books
                </p>
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <>
          {/* Summary Tiles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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

          {/* Revenue Chart */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Revenue Over Time</CardTitle>
                  <CardDescription>
                    Confirmed sales revenue aggregated over time
                  </CardDescription>
                </div>
                <div className="flex gap-1">
                  {["7d", "30d", "all"].map((range) => (
                    <Button
                      key={range}
                      variant={chartRange === range ? "default" : "outline"}
                      size="sm"
                      onClick={() => setChartRange(range)}
                    >
                      {range === "all" ? "All" : range}
                    </Button>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {chartData.length === 0 ? (
                <div className="flex items-center justify-center h-64 text-muted-foreground">
                  No revenue data for this period
                </div>
              ) : (
                <ChartContainer config={chartConfig} className="h-72">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
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
                      cursor={{ fill: "hsl(var(--muted))" }}
                      content={
                        <ChartTooltipContent
                          formatter={(value) => `$${value.toFixed(2)}`}
                        />
                      }
                    />
                    <Bar
                      dataKey="revenue"
                      fill="var(--color-revenue)"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ChartContainer>
              )}
            </CardContent>
          </Card>

          {/* Bottom Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Items */}
            <Card>
              <CardHeader>
                <CardTitle>Top Items</CardTitle>
                <CardDescription>
                  Revenue and units sold per course or book
                </CardDescription>
              </CardHeader>
              <CardContent>
                {topItems.length === 0 ? (
                  <p className="text-muted-foreground text-sm py-8 text-center">
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
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2 min-w-0 flex-1">
                              <span className="text-sm text-muted-foreground font-medium">
                                #{index + 1}
                              </span>
                              <div className="min-w-0 flex-1">
                                {link ? (
                                  <Link
                                    href={link}
                                    className="text-sm font-medium truncate block hover:underline"
                                  >
                                    {item.itemTitle}
                                  </Link>
                                ) : (
                                  <p className="text-sm font-medium truncate">
                                    {item.itemTitle}
                                  </p>
                                )}
                                <span className="text-xs text-muted-foreground capitalize">
                                  {item.itemType}
                                </span>
                              </div>
                            </div>
                            <div className="text-right flex-shrink-0 ml-4">
                              <p className="text-sm font-semibold">
                                ${item.revenue.toFixed(2)}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {item.units} sold
                              </p>
                            </div>
                          </div>
                          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary rounded-full transition-all"
                              style={{ width: `${barWidth}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Status Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Transaction Status</CardTitle>
                <CardDescription>
                  Overview of all your creator transactions by status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(statusBreakdown)
                    .filter(([_, count]) => count > 0)
                    .sort(([, a], [, b]) => b - a)
                    .map(([status, count]) => (
                      <div
                        key={status}
                        className="flex items-center justify-between p-3 rounded-lg border"
                      >
                        <div className="flex items-center gap-3">
                          <Badge
                            variant="secondary"
                            className={statusColors[status]}
                          >
                            {status}
                          </Badge>
                        </div>
                        <span className="font-semibold">{count}</span>
                      </div>
                    ))}
                  {Object.values(statusBreakdown).every((c) => c === 0) && (
                    <p className="text-muted-foreground text-sm py-8 text-center">
                      No transactions yet
                    </p>
                  )}
                </div>
                <div className="mt-4 p-3 bg-muted rounded-lg">
                  <p className="text-xs text-muted-foreground">
                    <strong>Note:</strong> Only{" "}
                    <Badge
                      variant="secondary"
                      className={`${statusColors.confirmed} text-xs`}
                    >
                      confirmed
                    </Badge>{" "}
                    transactions count toward your earnings totals. Pending,
                    failed, and expired transactions are excluded from revenue
                    calculations.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
