"use client";
import React, {
  Suspense,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { BookOpen, Bookmark, Plus } from "lucide-react";
import LibraryBookCard from "@/components/molecules/dashboard/cards/libraryCard";
import Button from "@/components/atoms/form/Button";
import { Card, CardContent } from "@/components/ui/card";
import Modal from "@/components/molecules/Modal";
import BookCreateForm from "@/components/organisms/create/book-create-form";
import { fetchBooks } from "@/lib/actions/library/fetch-books";
import { getBookmarkedBooks } from "@/lib/actions/library/bookmark-book";
import LibraryBookSkeleton from "@/components/atoms/skeletons/LibraryBookSkeleton";
import useAuth from "@/hooks/useAuth";
import NetworkErrorComp from "@/components/molecules/errors/NetworkError";
import { getAverageRating } from "@/hooks/getAverageRating";
import useDebouncedValue from "@/hooks/useDebouncedValue";
import LibraryToolbar, { ALL } from "@/components/molecules/dashboard/LibraryToolbar";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const PAGE_SIZE = 9;

// Mongo ObjectIds encode their creation time in the first 4 bytes, so recency
// sorting still works when the API response omits createdAt.
const createdAtOf = (book) => {
  if (book?.createdAt) {
    const parsed = new Date(book.createdAt).getTime();
    if (!Number.isNaN(parsed)) return parsed;
  }
  const id = book?._id;
  if (typeof id === "string" && id.length >= 8) {
    const seconds = parseInt(id.slice(0, 8), 16);
    if (!Number.isNaN(seconds)) return seconds * 1000;
  }
  return 0;
};

const priceOf = (book) => Number(book?.price) || 0;

const BookGridSkeleton = () => (
  <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
    {[...Array(6)].map((_, idx) => (
      <LibraryBookSkeleton key={`skeleton-${idx}`} />
    ))}
  </div>
);

const LibraryPageContent = () => {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [modalOpen, setModalOpen] = useState(false);
  const [books, setBooks] = useState([]);
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [searchInput, setSearchInput] = useState(
    () => searchParams.get("search") || ""
  );
  const [category, setCategory] = useState(
    () => searchParams.get("category") || ALL
  );
  const [price, setPrice] = useState(() => searchParams.get("price") || ALL);
  const [sort, setSort] = useState(() => searchParams.get("sort") || "newest");
  const [page, setPage] = useState(
    () => Math.max(1, Number(searchParams.get("page")) || 1)
  );

  const search = useDebouncedValue(searchInput, 300);

  const fetchData = async () => {
    setLoading(true);
    setError(false);
    try {
      if (showBookmarks) {
        const response = await getBookmarkedBooks();
        setBooks(response.bookmarks || []);
      } else {
        const response = await fetchBooks();
        setBooks(Array.isArray(response) ? response : response?.books || []);
      }
    } catch (err) {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [showBookmarks]);

  // Keep filter state shareable/bookmarkable without adding history entries.
  useEffect(() => {
    const params = new URLSearchParams();
    if (search.trim()) params.set("search", search.trim());
    if (category !== ALL) params.set("category", category);
    if (price !== ALL) params.set("price", price);
    if (sort !== "newest") params.set("sort", sort);
    if (page > 1) params.set("page", String(page));
    const query = params.toString();
    router.replace(query ? `?${query}` : "/dashboard/library", {
      scroll: false,
    });
  }, [search, category, price, sort, page, router]);

  // Any filter change resets to the first page, but never on the initial
  // render, which would discard an incoming ?page= value.
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    setPage(1);
  }, [search, category, price, sort, showBookmarks]);

  // Categories are free-form strings on the backend, so fold case and
  // whitespace and keep the first spelling encountered.
  const categories = useMemo(() => {
    const seen = new Map();
    books.forEach((book) => {
      const raw = typeof book?.category === "string" ? book.category.trim() : "";
      if (!raw) return;
      const key = raw.toLowerCase();
      if (!seen.has(key)) seen.set(key, raw);
    });
    return [...seen.values()].sort((a, b) => a.localeCompare(b));
  }, [books]);

  const filteredBooks = useMemo(() => {
    const term = search.trim().toLowerCase();
    const wanted = category.trim().toLowerCase();

    const result = books.filter((book) => {
      if (!showBookmarks && book?.author?._id === user?._id) return false;

      if (term) {
        const title = String(book?.title || "").toLowerCase();
        const author = String(book?.author?.name || "").toLowerCase();
        if (!title.includes(term) && !author.includes(term)) return false;
      }

      if (category !== ALL) {
        const actual = String(book?.category || "").trim().toLowerCase();
        if (actual !== wanted) return false;
      }

      if (price === "free" && priceOf(book) > 0) return false;
      if (price === "paid" && priceOf(book) <= 0) return false;

      return true;
    });

    const sorted = [...result];
    if (sort === "price-asc") {
      sorted.sort((a, b) => priceOf(a) - priceOf(b));
    } else if (sort === "price-desc") {
      sorted.sort((a, b) => priceOf(b) - priceOf(a));
    } else if (sort === "rating") {
      sorted.sort(
        (a, b) =>
          (getAverageRating(b?.reviews) || 0) -
          (getAverageRating(a?.reviews) || 0)
      );
    } else {
      sorted.sort((a, b) => createdAtOf(b) - createdAtOf(a));
    }
    return sorted;
  }, [books, search, category, price, sort, showBookmarks, user?._id]);

  const totalPages = Math.max(1, Math.ceil(filteredBooks.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pagedBooks = filteredBooks.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const pageNumbers = useMemo(() => {
    const end = Math.min(totalPages, Math.max(1, currentPage - 2) + 4);
    const start = Math.max(1, end - 4);
    const pages = [];
    for (let i = start; i <= end; i += 1) pages.push(i);
    return pages;
  }, [currentPage, totalPages]);

  const isFiltered =
    search.trim() !== "" || category !== ALL || price !== ALL || sort !== "newest";

  const handleClearFilters = () => {
    setSearchInput("");
    setCategory(ALL);
    setPrice(ALL);
    setSort("newest");
    setPage(1);
  };

  const goToPage = (event, target) => {
    event.preventDefault();
    if (target < 1 || target > totalPages || target === currentPage) return;
    setPage(target);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBookCreated = () => {
    setModalOpen(false);
    fetchData();
  };

  const handleBookBookmarkChange = (isBookmarked, bookId) => {
    if (showBookmarks && !isBookmarked) {
      setBooks((prev) => prev.filter((book) => book._id !== bookId));
    } else {
      fetchData();
    }
  };

  if (error) {
    return (
      <NetworkErrorComp
        errMsg="Error getting Books, Please try again"
        reset={() => fetchData()}
      />
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-brand-text" />
            {showBookmarks ? "My Bookmarked Books" : "All Books"}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {showBookmarks
              ? "Books you've saved for later"
              : "Browse and read Islamic books"}
          </p>
        </div>
        <div className="flex gap-2">
          <Button round outlined onClick={() => setModalOpen(true)}>
            <Plus className="h-4 w-4 mr-1" />
            Create
          </Button>
          <Button
            round
            outlined={!showBookmarks}
            className={showBookmarks ? "bg-accent text-white" : ""}
            onClick={() => setShowBookmarks((prev) => !prev)}
          >
            <Bookmark className="h-4 w-4 mr-1" />
            {showBookmarks ? "Show All" : "Bookmarks"}
          </Button>
        </div>
      </div>

      {!loading && (
        <LibraryToolbar
          search={searchInput}
          onSearchChange={setSearchInput}
          category={category}
          onCategoryChange={setCategory}
          categories={categories}
          price={price}
          onPriceChange={setPrice}
          sort={sort}
          onSortChange={setSort}
          onClear={handleClearFilters}
          isFiltered={isFiltered}
          resultCount={filteredBooks.length}
        />
      )}

      {loading ? (
        <BookGridSkeleton />
      ) : filteredBooks.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center space-y-4">
            <BookOpen className="h-12 w-12 text-muted-foreground" />
            <div>
              <h3 className="font-semibold text-lg">
                {isFiltered
                  ? "No Matching Books"
                  : showBookmarks
                  ? "No Bookmarked Books"
                  : "No Books Yet"}
              </h3>
              <p className="text-muted-foreground text-sm mt-1 max-w-md">
                {isFiltered
                  ? "No books match the current filters. Try widening your search."
                  : showBookmarks
                  ? "Save titles you want to revisit!"
                  : "No books available at the moment."}
              </p>
            </div>
            {isFiltered ? (
              <Button round outlined onClick={handleClearFilters}>
                Clear filters
              </Button>
            ) : (
              !showBookmarks && (
                <Button round outlined onClick={() => setModalOpen(true)}>
                  Create Book
                </Button>
              )
            )}
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {pagedBooks.map((book) => (
              <LibraryBookCard
                key={book._id}
                book={book}
                onBookmarkChange={(isBookmarked) =>
                  handleBookBookmarkChange(isBookmarked, book._id)
                }
              />
            ))}
          </div>

          {totalPages > 1 && (
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    aria-disabled={currentPage === 1}
                    className={
                      currentPage === 1 ? "pointer-events-none opacity-50" : ""
                    }
                    onClick={(event) => goToPage(event, currentPage - 1)}
                  />
                </PaginationItem>
                {pageNumbers.map((number) => (
                  <PaginationItem key={`page-${number}`}>
                    <PaginationLink
                      href="#"
                      isActive={number === currentPage}
                      onClick={(event) => goToPage(event, number)}
                    >
                      {number}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    aria-disabled={currentPage === totalPages}
                    className={
                      currentPage === totalPages
                        ? "pointer-events-none opacity-50"
                        : ""
                    }
                    onClick={(event) => goToPage(event, currentPage + 1)}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </>
      )}

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Create Book"
        className="max-w-md w-full"
      >
        <BookCreateForm onBookCreated={handleBookCreated} />
      </Modal>
    </div>
  );
};

// useSearchParams needs a Suspense boundary or this statically prerendered
// route fails the production build.
const LibraryPage = () => (
  <Suspense
    fallback={
      <div className="p-4 sm:p-6">
        <BookGridSkeleton />
      </div>
    }
  >
    <LibraryPageContent />
  </Suspense>
);

export default LibraryPage;