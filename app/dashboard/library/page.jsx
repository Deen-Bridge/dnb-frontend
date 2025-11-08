"use client";
import React, { useState, useEffect } from "react";
import LibraryBookCard from "@/components/molecules/dashboard/cards/libraryCard";
import Button from "@/components/atoms/form/Button";
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showBookmarks]);

  const handleClick = () => {
    setModalOpen(!modalOpen);
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
    <>
      <div className="bg-muted h-full w-full">
        <div className="flex justify-between items-center p-5">
          <h2 className="text-2xl font-bold">
            {showBookmarks ? "My Bookmarked Books" : "All Books"}
          </h2>
          <div className="flex gap-2">
            <Button
              round
              wide
              outlined
              className="text-normal flex items-center justify-center text-black"
              onClick={handleClick}
            >
              Create Book
            </Button>
            <Button
              round
              outlined={!showBookmarks}
              className={showBookmarks ? "bg-accent text-white flex flex-nowrap items-center justify-center " : "text-normal flex flex-nowrap items-center justify-center"}
              onClick={() => setShowBookmarks((prev) => !prev)}
            >
              {showBookmarks ? "Show All" : "Bookmarks"}
            </Button>
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-4 mt-10 p-4 pt-0">
          {loading ? (
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, idx) => (
                <LibraryBookSkeleton key={`skeleton-${idx}`} />
              ))}
            </div>
          ) : books.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-muted-foreground text-lg">
                {showBookmarks
                  ? "No bookmarked books yet. Save titles you want to revisit!"
                  : "No books available at the moment."}
              </p>
            </div>
          ) : (
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3">
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
        </div>
      </div>
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Create Book"
        className="max-w-md w-full"
      >
        <BookCreateForm onBookCreated={handleBookCreated} />
      </Modal>
    </>
  );
};

export default LibraryPage;
