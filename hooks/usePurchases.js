"use client";
import { useState, useEffect, useCallback, useMemo } from "react";
import useAuth from "./useAuth";
import useStellarPayment from "./useStellarPayment";
import { fetchCourses } from "@/lib/actions/courses/fetch-courses";
import { fetchBooks } from "@/lib/actions/library/fetch-books";
import axiosInstance from "@/lib/config/axios.config";

export default function usePurchases() {
  const { user } = useAuth();
  const { getTransactionHistory } = useStellarPayment();

  const [courses, setCourses] = useState([]);
  const [books, setBooks] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const ownedCourseIds = useMemo(() => {
    if (!user) return new Set();
    const ids = new Set();
    if (Array.isArray(user.purchasedCourses)) {
      user.purchasedCourses.forEach((c) => {
        if (c.courseId) ids.add(c.courseId.toString());
        if (c._id) ids.add(c._id.toString());
      });
    }
    if (Array.isArray(user.enrolledCourses)) {
      user.enrolledCourses.forEach((id) => ids.add(id.toString()));
    }
    return ids;
  }, [user]);

  const ownedBookIds = useMemo(() => {
    if (!user) return new Set();
    const ids = new Set();
    if (Array.isArray(user.purchasedBooks)) {
      user.purchasedBooks.forEach((b) => {
        if (b.bookId) ids.add(b.bookId.toString());
        if (b._id) ids.add(b._id.toString());
      });
    }
    return ids;
  }, [user]);

  const fetchAllBuyerTransactions = useCallback(async () => {
    let all = [];
    let page = 1;
    let totalPages = 1;

    while (page <= totalPages) {
      const result = await getTransactionHistory({
        role: "buyer",
        page,
        limit: 100,
      });
      if (result.success) {
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

          const ownedCourses = coursesList.filter((c) =>
            ownedCourseIds.has(c._id?.toString())
          );
          const ownedBooks = booksList.filter((b) =>
            ownedBookIds.has(b._id?.toString())
          );

          setCourses(ownedCourses);
          setBooks(ownedBooks);
          setTransactions(buyerTxs);
        }
      } catch (err) {
        if (!cancelled) setError(err.message || "Failed to load purchases");
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
    const map = {};
    for (const tx of transactions) {
      if (tx.status === "confirmed" && tx.itemType && tx.itemTitle) {
        map[`${tx.itemType}:${tx.itemTitle}`] = tx;
      }
    }
    return map;
  }, [transactions]);

  const getReceipt = useCallback(
    (itemId, itemType, itemTitle) => {
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
    (itemId, itemType) => {
      if (itemType === "course") {
        return !user?.purchasedCourses?.some(
          (c) =>
            c.courseId?.toString() === itemId?.toString() ||
            c._id?.toString() === itemId?.toString()
        );
      }
      if (itemType === "book") {
        return !user?.purchasedBooks?.some(
          (b) =>
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
