"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import CourseCard from "@/components/molecules/dashboard/cards/courseCard";
import LibraryBookCard from "@/components/molecules/dashboard/cards/libraryCard";
import CourseCardSkeleton from "@/components/atoms/skeletons/CourseCardSkeleton";
import LibraryBookSkeleton from "@/components/atoms/skeletons/LibraryBookSkeleton";
import NetworkErrorComp from "@/components/molecules/errors/NetworkError";
import Button from "@/components/atoms/form/Button";
import { getBookmarkedCourses } from "@/lib/actions/courses/bookmark-course";
import { getBookmarkedBooks } from "@/lib/actions/library/bookmark-book";
import { Bookmark, LaptopMinimal, Book } from "lucide-react";

export default function SavedPage() {
  const [activeTab, setActiveTab] = useState("courses"); // "courses" | "books"
  const [courses, setCourses] = useState([]);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchSavedItems = async () => {
    setLoading(true);
    setError(false);
    try {
      const [coursesRes, booksRes] = await Promise.allSettled([
        getBookmarkedCourses(),
        getBookmarkedBooks(),
      ]);

      if (coursesRes.status === "fulfilled") {
        const courseData = coursesRes.value;
        setCourses(courseData?.bookmarks || (Array.isArray(courseData) ? courseData : []));
      }

      if (booksRes.status === "fulfilled") {
        const bookData = booksRes.value;
        setBooks(bookData?.bookmarks || (Array.isArray(bookData) ? bookData : []));
      }

      if (coursesRes.status === "rejected" && booksRes.status === "rejected") {
        setError(true);
      }
    } catch (_err) {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSavedItems();
  }, []);

  const handleCourseBookmarkChange = (isBookmarked, courseId) => {
    if (!isBookmarked) {
      setCourses((prev) => prev.filter((c) => c._id !== courseId));
    }
  };

  const handleBookBookmarkChange = (isBookmarked, bookId) => {
    if (!isBookmarked) {
      setBooks((prev) => prev.filter((b) => b._id !== bookId));
    }
  };

  if (error) {
    return (
      <NetworkErrorComp
        errMsg="Failed to load saved items. Please try again."
        reset={() => fetchSavedItems()}
      />
    );
  }

  return (
    <div className="bg-muted min-h-full w-full p-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Bookmark className="w-6 h-6 text-accent fill-accent" />
            My Saved Hub
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            Access all your bookmarked courses and books in one place
          </p>
        </div>

        {/* Tabs Toggle */}
        <div className="flex gap-2 bg-background/60 p-1.5 rounded-full border shadow-sm">
          <button
            type="button"
            onClick={() => setActiveTab("courses")}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-full transition-all cursor-pointer ${
              activeTab === "courses"
                ? "bg-accent text-white shadow"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <LaptopMinimal className="w-4 h-4" />
            Courses ({courses.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("books")}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-full transition-all cursor-pointer ${
              activeTab === "books"
                ? "bg-accent text-white shadow"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Book className="w-4 h-4" />
            Books ({books.length})
          </button>
        </div>
      </div>

      {/* Content Section */}
      <div className="mt-6">
        {loading ? (
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, idx) =>
              activeTab === "courses" ? (
                <CourseCardSkeleton key={`skeleton-course-${idx}`} />
              ) : (
                <LibraryBookSkeleton key={`skeleton-book-${idx}`} />
              )
            )}
          </div>
        ) : activeTab === "courses" ? (
          courses.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center py-20 bg-background/40 rounded-2xl border border-dashed p-8">
              <LaptopMinimal className="w-12 h-12 text-muted-foreground/50 mb-3" />
              <h3 className="text-lg font-semibold mb-1">No saved courses yet</h3>
              <p className="text-muted-foreground text-sm max-w-md mb-6">
                Explore our catalog and bookmark courses you are interested in to view them here later.
              </p>
              <Button to="/dashboard/courses" round className="bg-accent text-white">
                Browse Courses
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3">
              {courses.map((course) => (
                <CourseCard
                  key={course._id}
                  course={course}
                  initialIsBookmarked={true}
                  onBookmarkChange={(isBookmarked) =>
                    handleCourseBookmarkChange(isBookmarked, course._id)
                  }
                />
              ))}
            </div>
          )
        ) : books.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-20 bg-background/40 rounded-2xl border border-dashed p-8">
            <Book className="w-12 h-12 text-muted-foreground/50 mb-3" />
            <h3 className="text-lg font-semibold mb-1">No saved books yet</h3>
            <p className="text-muted-foreground text-sm max-w-md mb-6">
              Browse our Islamic library and save books to build your personal reading list.
            </p>
            <Button to="/dashboard/library" round className="bg-accent text-white">
              Browse Library
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3">
            {books.map((book) => (
              <LibraryBookCard
                key={book._id}
                book={book}
                initialIsBookmarked={true}
                onBookmarkChange={(isBookmarked) =>
                  handleBookBookmarkChange(isBookmarked, book._id)
                }
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
