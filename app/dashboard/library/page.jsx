"use client";
import React, { useState, useEffect } from "react";
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

const LibraryPage = () => {
  const { user } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const [books, setBooks] = useState([]);
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError(false);
    try {
      if (showBookmarks) {
        const response = await getBookmarkedBooks();
        setBooks(response.bookmarks || []);
      } else {
        const response = await fetchBooks();
        setBooks(response);
      }
    } catch (error) {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [showBookmarks]);

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
            <BookOpen className="h-6 w-6 text-accent" />
            {showBookmarks ? "My Bookmarked Books" : "All Books"}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {showBookmarks
              ? "Books you've saved for later"
              : "Browse and read Islamic books"}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            round
            outlined
            onClick={() => setModalOpen(true)}
          >
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

      {loading ? (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, idx) => (
            <LibraryBookSkeleton key={`skeleton-${idx}`} />
          ))}
        </div>
      ) : books.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center space-y-4">
            <BookOpen className="h-12 w-12 text-muted-foreground" />
            <div>
              <h3 className="font-semibold text-lg">
                {showBookmarks ? "No Bookmarked Books" : "No Books Yet"}
              </h3>
              <p className="text-muted-foreground text-sm mt-1 max-w-md">
                {showBookmarks
                  ? "Save titles you want to revisit!"
                  : "No books available at the moment."}
              </p>
            </div>
            {!showBookmarks && (
              <Button round outlined onClick={() => setModalOpen(true)}>
                Create Book
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {books
            .filter(
              (book) => showBookmarks || book?.author?._id !== user?._id
            )
            .map((book) => (
              <LibraryBookCard
                key={book._id}
                book={book}
                onBookmarkChange={(isBookmarked) =>
                  handleBookBookmarkChange(isBookmarked, book._id)
                }
              />
            ))}
        </div>
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

export default LibraryPage;
