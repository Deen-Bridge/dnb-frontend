"use client";
import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import RecommendedBookCard from "./R-BooksCard";
import { cn } from "@/lib/utils";
import { Inter_500 } from "@/lib/config/font.config";
import {
  fetchAllBooks,
  fetchRecommendedBooks,
} from "@/lib/actions/recommendations";
import { toast } from "sonner";
import LibraryBookSkeleton from "@/components/atoms/skeletons/LibraryBookSkeleton";
import NetworkErrorComp from "@/components/molecules/errors/NetworkError";
import { getAverageRating } from "@/hooks/getAverageRating";

const RecommendedBooks = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [hasInterests, setHasInterests] = useState(true);

  const loadBooks = async () => {
    try {
      setLoading(true);
      setError(false);

      // Get user data from cookies (where it's actually stored)
      const userInfo = Cookies.get("userInfo");
      let interests = [];

      if (userInfo) {
        const user = JSON.parse(userInfo);
        interests = user.interests || [];
      }

      // Track if user has interests for display purposes
      setHasInterests(interests.length > 0);

      // Fetch recommended books based on interests, or all books
      let response;
      let isRecommended = false;

      if (interests.length > 0) {
        response = await fetchRecommendedBooks(interests);
        isRecommended = true;
      } else {
        response = await fetchAllBooks();
      }

      let booksData = [];
      if (Array.isArray(response)) {
        // Books API returns array directly
        booksData = response;
      } else if (response.success && response.books) {
        booksData = response.books;
      } else if (response.recommended) {
        booksData = response.recommended;
      }

      // If recommended results are empty, fetch all books as fallback
      if (isRecommended && booksData.length === 0) {
        response = await fetchAllBooks();
        if (Array.isArray(response)) {
          booksData = response;
          setHasInterests(false); // Treat as if no interests for display
        }
      }

      // If no interests OR fallback was used, sort by rating and downloads
      if ((interests.length === 0 || !hasInterests) && booksData.length > 0) {
        booksData.sort((a, b) => {
          const ratingA = getAverageRating(a.reviews);
          const ratingB = getAverageRating(b.reviews);
          const downloadsA = a.downloads || 0;
          const downloadsB = b.downloads || 0;

          // Sort by rating first, then by downloads count
          if (ratingB !== ratingA) {
            return ratingB - ratingA;
          }
          return downloadsB - downloadsA;
        });
      }

      // Limit to 4 books for the dashboard
      setBooks(booksData.slice(0, 4));
    } catch (error) {
      console.error("Error loading books:", error);
      setError(true);
      setBooks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBooks();
  }, []);

  const sectionTitle = hasInterests
    ? "Recommended Books for You"
    : "Popular Books";

  const emptyMessage = hasInterests
    ? "No books match your interests yet. Try updating your profile interests!"
    : "No books available at the moment. Check back soon!";

  if (error) {
    return (
      <NetworkErrorComp
        errMsg="Failed to load recommended books. Please try again."
        reset={() => loadBooks()}
        className="h-auto py-12"
      />
    );
  }

  if (loading) {
    return (
      <div>
        <h3
          className={cn("text-xl font-bold mb-4 mt-10", Inter_500.className)}
        >
          {sectionTitle}
        </h3>
        <div className="grid sm:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <LibraryBookSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (books.length === 0) {
    return (
      <div>
        <h3
          className={cn("text-xl font-bold mb-4 mt-10", Inter_500.className)}
        >
          {sectionTitle}
        </h3>
        <p className="text-muted-foreground text-center py-8">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div>
      <h3 className={cn("text-xl font-bold mb-4 mt-10", Inter_500.className)}>
        {sectionTitle}
        {!hasInterests && (
          <span className="text-xs font-normal text-muted-foreground ml-2">
            (Based on ratings & downloads)
          </span>
        )}
      </h3>
      <div className="grid sm:grid-cols-2 gap-4">
        {books.map((book) => (
          <RecommendedBookCard
            key={book._id || book.id}
            book={{
              ...book,
              rating: Math.round(getAverageRating(book.reviews)),
              instructor: book.author?.name || "DeenBridge Author",
              price: book.price === 0 ? "Free" : book.price,
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default RecommendedBooks;
