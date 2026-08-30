"use client";
import { useState, useEffect, useCallback, useMemo } from "react";
import useStellarPayment from "./useStellarPayment";
import useAuth from "./useAuth";
import { useStellar } from "@/components/stellar/StellarProvider";
import { fetchUserCourses } from "@/lib/actions/courses/fetch-user-id-courses";
import { fetchUserBooks } from "@/lib/actions/library/fetch-user-id-books";
import dayjs from "dayjs";
import { StellarTransaction } from "@/types/stellar";

const CONFIRMED = "confirmed";

export interface AggregatedRevenuePoint {
  date: string;
  revenue: number;
}

function aggregateByDay(transactions: StellarTransaction[]): AggregatedRevenuePoint[] {
  const map: Record<string, number> = {};
  for (const tx of transactions) {
    const day = dayjs(tx.createdAt).format("YYYY-MM-DD");
    map[day] = (map[day] || 0) + (tx.amount || 0);
  }
  return Object.entries(map)
    .map(([date, revenue]) => ({ date, revenue }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

function aggregateByWeek(transactions: StellarTransaction[]): AggregatedRevenuePoint[] {
  const map: Record<string, number> = {};
  for (const tx of transactions) {
    const week = dayjs(tx.createdAt).startOf("week").format("YYYY-MM-DD");
    map[week] = (map[week] || 0) + (tx.amount || 0);
  }
  return Object.entries(map)
    .map(([date, revenue]) => ({ date, revenue }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

function getLastMonthRange() {
  const now = dayjs();
  const startOfThisMonth = now.startOf("month");
  const startOfLastMonth = startOfThisMonth.subtract(1, "month");
  const endOfLastMonth = startOfThisMonth.subtract(1, "day");
  return { startOfLastMonth, endOfLastMonth, startOfThisMonth };
}

export interface CreatorItemsState {
  courses: any[]; // TODO(types): Creator courses list
  books: any[]; // TODO(types): Creator books list
}

export interface TopEarningItem {
  itemType: string;
  itemTitle: string;
  revenue: number;
  units: number;
}

export interface StatusBreakdown {
  confirmed: number;
  pending: number;
  submitted: number;
  failed: number;
  expired: number;
}

export interface UseEarningsResult {
  isLoading: boolean;
  error: string | null;
  hasWallet: boolean;
  totalEarned: number;
  salesCount: number;
  thisMonthRevenue: number;
  lastMonthRevenue: number;
  monthOverMonthChange: number;
  revenueChartData: (range: "7d" | "30d" | string) => AggregatedRevenuePoint[];
  topItems: TopEarningItem[];
  findItemLink: (title: string, type: "course" | "book" | string) => string | null;
  statusBreakdown: StatusBreakdown;
  withdrawableBalance: number;
  confirmedCount: number;
  pendingCount: number;
  failedCount: number;
}

export default function useEarnings(): UseEarningsResult {
  const { getTransactionHistory } = useStellarPayment();
  const { user } = useAuth();
  const { connectedWallet, walletInfo } = useStellar();

  const [allTransactions, setAllTransactions] = useState<StellarTransaction[]>([]);
  const [creatorItems, setCreatorItems] = useState<CreatorItemsState>({ courses: [], books: [] });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAllCreatorTransactions = useCallback(async (): Promise<StellarTransaction[]> => {
    let all: StellarTransaction[] = [];
    let page = 1;
    let totalPages = 1;

    while (page <= totalPages) {
      const result = await getTransactionHistory({
        role: "creator",
        page,
        limit: 100,
      });
      if (result.success && result.transactions) {
        all = [...all, ...result.transactions];
        totalPages = result.pagination?.pages || 1;
      }
      page++;
    }

    return all;
  }, [getTransactionHistory]);

  const fetchCreatorItems = useCallback(async (): Promise<CreatorItemsState> => {
    if (!user?._id) return { courses: [], books: [] };
    const [courses, books] = await Promise.allSettled([
      fetchUserCourses(user._id),
      fetchUserBooks(user._id),
    ]);
    return {
      courses: courses.status === "fulfilled" && Array.isArray(courses.value) ? courses.value : [],
      books: books.status === "fulfilled" && Array.isArray(books.value) ? books.value : [],
    };
  }, [user]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [transactions, items] = await Promise.all([
          fetchAllCreatorTransactions(),
          fetchCreatorItems(),
        ]);
        if (!cancelled) {
          setAllTransactions(transactions);
          setCreatorItems(items);
        }
      } catch (err: any) { // TODO(types): Error shape from earnings load
        if (!cancelled) setError(err?.message || "Failed to load earnings data");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [fetchAllCreatorTransactions, fetchCreatorItems]);

  const confirmed = useMemo(
    () => allTransactions.filter((tx) => tx.status === CONFIRMED),
    [allTransactions]
  );

  const pending = useMemo(
    () => allTransactions.filter((tx) => tx.status === "pending" || tx.status === "submitted"),
    [allTransactions]
  );

  const failed = useMemo(
    () => allTransactions.filter((tx) => tx.status === "failed" || tx.status === "expired"),
    [allTransactions]
  );

  const totalEarned = useMemo(
    () => confirmed.reduce((sum, tx) => sum + (tx.amount || 0), 0),
    [confirmed]
  );

  const salesCount = confirmed.length;

  const { thisMonthRevenue, lastMonthRevenue, monthOverMonthChange } = useMemo(() => {
    const { startOfLastMonth, endOfLastMonth, startOfThisMonth } = getLastMonthRange();
    const thisMonth = confirmed.filter((tx) =>
      dayjs(tx.createdAt).isAfter(startOfThisMonth)
    );
    const lastMonth = confirmed.filter((tx) => {
      const d = dayjs(tx.createdAt);
      return d.isAfter(startOfLastMonth) && d.isBefore(endOfLastMonth);
    });
    const thisAmt = thisMonth.reduce((s, t) => s + (t.amount || 0), 0);
    const lastAmt = lastMonth.reduce((s, t) => s + (t.amount || 0), 0);
    const change = lastAmt > 0 ? ((thisAmt - lastAmt) / lastAmt) * 100 : thisAmt > 0 ? 100 : 0;
    return {
      thisMonthRevenue: thisAmt,
      lastMonthRevenue: lastAmt,
      monthOverMonthChange: Math.round(change * 10) / 10,
    };
  }, [confirmed]);

  const revenueChartData = useCallback(
    (range: string): AggregatedRevenuePoint[] => {
      let filtered = confirmed;
      const now = dayjs();
      if (range === "7d") {
        filtered = confirmed.filter((tx) =>
          dayjs(tx.createdAt).isAfter(now.subtract(7, "day"))
        );
      } else if (range === "30d") {
        filtered = confirmed.filter((tx) =>
          dayjs(tx.createdAt).isAfter(now.subtract(30, "day"))
        );
      }
      if (range === "7d") return aggregateByDay(filtered);
      return aggregateByWeek(filtered);
    },
    [confirmed]
  );

  const topItems = useMemo((): TopEarningItem[] => {
    const map: Record<string, TopEarningItem> = {};
    for (const tx of confirmed) {
      const key = `${tx.itemType}:${tx.itemTitle}`;
      if (!map[key]) {
        map[key] = {
          itemType: tx.itemType,
          itemTitle: tx.itemTitle || "",
          revenue: 0,
          units: 0,
        };
      }
      map[key].revenue += tx.amount || 0;
      map[key].units += 1;
    }
    return Object.values(map).sort((a, b) => b.revenue - a.revenue);
  }, [confirmed]);

  const findItemLink = useCallback(
    (title: string, type: string): string | null => {
      if (type === "course") {
        const found = creatorItems.courses.find(
          (c) => c.title === title || c.title?.includes(title) || title?.includes(c.title)
        );
        return found ? `/dashboard/courses/${found._id || found.id}` : null;
      }
      if (type === "book") {
        const found = creatorItems.books.find(
          (b) => b.title === title || b.title?.includes(title) || title?.includes(b.title)
        );
        return found ? `/dashboard/library/${found._id || found.id}` : null;
      }
      return null;
    },
    [creatorItems]
  );

  const statusBreakdown = useMemo((): StatusBreakdown => {
    const counts: StatusBreakdown = { confirmed: 0, pending: 0, submitted: 0, failed: 0, expired: 0 };
    for (const tx of allTransactions) {
      const st = tx.status as keyof StatusBreakdown;
      if (counts[st] !== undefined) counts[st]++;
    }
    return counts;
  }, [allTransactions]);

  const withdrawableBalance = walletInfo?.usdcBalance
    ? parseFloat(walletInfo.usdcBalance)
    : 0;

  return {
    isLoading,
    error,
    hasWallet: !!connectedWallet,
    totalEarned,
    salesCount,
    thisMonthRevenue,
    lastMonthRevenue,
    monthOverMonthChange,
    revenueChartData,
    topItems,
    findItemLink,
    statusBreakdown,
    withdrawableBalance,
    confirmedCount: confirmed.length,
    pendingCount: pending.length,
    failedCount: failed.length,
  };
}
