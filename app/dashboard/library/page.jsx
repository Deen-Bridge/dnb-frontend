"use client";
import React, { useState, useEffect } from "react";
import LibraryBookCard from "@/components/molecules/dashboard/cards/libraryCard";
import { cn } from "@/lib/utils";
import { poppins_700 } from "@/lib/config/font.config";
import Button from "@/components/atoms/form/Button";
import Modal from "@/components/molecules/Modal";
import BookCreateForm from "@/components/organisms/create/book-create-form";
import { fetchBooks } from "@/lib/actions/library/fetch-books";
import LibraryBookSkeleton from "@/components/atoms/skeletons/LibraryBookSkeleton";
import useAuth from "@/hooks/useAuth";  

const LibraryPage = () => {
  const { user } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getBooks = async () => {
      setLoading(true);
      try {
        const data = await fetchBooks();
        setBooks(data);
      } catch (err) {
        setBooks([]);
      } finally {
        setLoading(false);
      }
    };
    getBooks();
  }, []);

  const handleClick = () => {
    setModalOpen(!modalOpen);
  };

  const handleBookCreated = () => {
    setModalOpen(false);
  };

  return (
    <>
      <div className="py-12 px-4 md:px-12 bg-muted min-h-screen">
        <div className="mb-8 flex flex-row justify-between items-center gap-4">
          <div>
            <span className={cn("text-highlight text-xl ", poppins_700)}>
              Explore Our Islamic Book Library
            </span>
          </div>
          <div>
            <Button
              outlined
              round
              wide
              className="text-sm text-nowrap"
              onClick={handleClick}
            >
              Create Book
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {loading ? (
            [...Array(6)].map((_, idx) => (
              <LibraryBookSkeleton key={`skeleton-${idx}`} />
            ))
          ) : books.length === 0 ?  (
            <div className="col-span-full text-center text-accent">
              No books found.
            </div>
          ) : (
                books
                  .filter((book) => book.author._id !== user._id)
                  .map((book) => <LibraryBookCard key={book._id} book={book} />)
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
