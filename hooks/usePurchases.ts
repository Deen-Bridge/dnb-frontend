"use client";
import { useState, useEffect, useCallback, useMemo } from "react";
import useAuth from "./useAuth";
import useStellarPayment from "./useStellarPayment";
import { fetchCourses } from "@/lib/actions/courses/fetch-courses";
import { fetchBooks } from "@/lib/actions/library/fetch-books";
import { StellarTransaction } from "@/types/stellar";

export interface ReceiptInfo {
  amount?: number;
  status: string;
  createdAt: string;
  buyerWallet?: string;
  creatorWallet?: string;
  creatorName?: string;
  buyerName?: string;
  explorerUrl?: string;
  _id: string;
}

export interface UsePurchasesResult {
  isLoading: boolean;
  error: string | null;
  courses: any[]; // TODO(types): Purchased courses list
  books: any[]; // TODO(types): Purchased books list
  getReceipt: (itemId: string, itemType: string, itemTitle: string) => ReceiptInfo | null;
  isFreeItem: (itemId: string, itemType: string) => boolean;
  isEmpty: boolean;
}

export default function usePurchases(): UsePurchasesResult {
  const { user } = useAuth();
  const { getTransactionHistory } = useStellarPayment();

  const [courses, setCourses] = useState<any[]>([]); // TODO(types): Purchased courses collection
  const [books, setBooks] = useState<any[]>([]); // TODO(types): Purchased books collection
  const [transactions, setTransactions] = useState<StellarTransaction[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const ownedCourseIds = useMemo(() => {
    if (!user) return new Set<string>();
    const ids = new Set<string>();
    if (Array.isArray(user.purchasedCourses)) {
      user.purchasedCourses.forEach((c: any) => { // TODO(types): Purchased course item
        if (c.courseId) ids.add(c.courseId.toString());
        if (c._id) ids.add(c._id.toString());
      });
    }
    if (Array.isArray(user.enrolledCourses)) {
      user.enrolledCourses.forEach((id: any) => ids.add(id.toString())); // TODO(types): Enrolled course item
    }
    return ids;
  }, [user]);

  const ownedBookIds = useMemo(() => {
    if (!user) return new Set<string>();
    const ids = new Set<string>();
    if (Array.isArray(user.purchasedBooks)) {
      user.purchasedBooks.forEach((b: any) => { // TODO(types): Purchased book item
        if (b.bookId) ids.add(b.bookId.toString());
        if (b._id) ids.add(b._id.toString());
      });
    }
    return ids;
  }, [user]);

  const fetchAllBuyerTransactions = useCallback(async (): Promise<StellarTransaction[]> => {
    let all: StellarTransaction[] = [];
    let page = 1;
    let totalPages = 1;

    while (page <= totalPages) {
      const result = await getTransactionHistory({
        role: "buyer",
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

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [allCourses, allBooks, buyerTxs] = await Promise.all([
          fetchCourses(),
          fetchBooks(),
          fetchAllBuyerTransactions(),
        ]);

        if (!cancelled) {
          const coursesList = Array.isArray(allCourses) ? allCourses : [];
          const booksList = Array.isArray(allBooks) ? allBooks : [];

          const ownedCourses = coursesList.filter((c: any) => // TODO(types): Course record
            ownedCourseIds.has(c._id?.toString())
          );
          const ownedBooks = booksList.filter((b: any) => // TODO(types): Book record
            ownedBookIds.has(b._id?.toString())
          );

          setCourses(ownedCourses);
          setBooks(ownedBooks);
          setTransactions(buyerTxs);
        }
      } catch (err: any) { // TODO(types): Error from purchases load
        if (!cancelled) setError(err?.message || "Failed to load purchases");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    if (user) load();
    else setIsLoading(false);

    return () => {
      cancelled = true;
    };
  }, [user, ownedCourseIds, ownedBookIds, fetchAllBuyerTransactions]);

  const transactionMap = useMemo(() => {
    const map: Record<string, StellarTransaction> = {};
    for (const tx of transactions) {
      if (tx.status === "confirmed" && tx.itemType && tx.itemTitle) {
        map[`${tx.itemType}:${tx.itemTitle}`] = tx;
      }
    }
    return map;
  }, [transactions]);

  const getReceipt = useCallback(
    (itemId: string, itemType: string, itemTitle: string): ReceiptInfo | null => {
      void itemId;
      const tx = transactionMap[`${itemType}:${itemTitle}`];
      if (!tx) return null;
      return {
        amount: tx.amount,
        status: tx.status,
        createdAt: tx.createdAt,
        buyerWallet: tx.buyerWallet,
        creatorWallet: tx.creatorWallet,
        creatorName: tx.creator?.name,
        buyerName: tx.buyer?.name,
        explorerUrl: tx.explorerUrl,
        _id: tx._id,
      };
    },
    [transactionMap]
  );

  const isFreeItem = useCallback(
    (itemId: string, itemType: string): boolean => {
      if (itemType === "course") {
        return !user?.purchasedCourses?.some(
          (c: any) => // TODO(types): Purchased course check
            c.courseId?.toString() === itemId?.toString() ||
            c._id?.toString() === itemId?.toString()
        );
      }
      if (itemType === "book") {
        return !user?.purchasedBooks?.some(
          (b: any) => // TODO(types): Purchased book check
            b.bookId?.toString() === itemId?.toString() ||
            b._id?.toString() === itemId?.toString()
        );
      }
      return true;
    },
    [user]
  );

  return {
    isLoading,
    error,
    courses,
    books,
    getReceipt,
    isFreeItem,
    isEmpty: courses.length === 0 && books.length === 0,
  };
}
