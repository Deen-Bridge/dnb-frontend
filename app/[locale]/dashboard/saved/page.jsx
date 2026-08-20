"use client";

import React, { useEffect, useRef, useState } from "react";
import { Bookmark, LaptopMinimal, Book } from "lucide-react";
import CourseCard from "@/components/molecules/dashboard/cards/courseCard";
import LibraryBookCard from "@/components/molecules/dashboard/cards/libraryCard";
import CourseCardSkeleton from "@/components/atoms/skeletons/CourseCardSkeleton";
import LibraryBookSkeleton from "@/components/atoms/skeletons/LibraryBookSkeleton";
import { Button } from "@/components/ui/button";
import { PageShell } from "@/components/ui/page-shell";
import { PageHeader } from "@/components/ui/page-header";
import { CardGrid } from "@/components/ui/card-grid";
import { EmptyState } from "@/components/ui/empty-state";
import { getBookmarkedCourses } from "@/lib/actions/courses/bookmark-course";
import { getBookmarkedBooks } from "@/lib/actions/library/bookmark-book";
import NetworkErrorComp from "@/components/molecules/errors/NetworkError";
import { cn } from "@/lib/utils";

export default function SavedPage() {
  const [activeTab, setActiveTab] = useState("courses");
  const [courses, setCourses] = useState([]);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const removedCoursesRef = useRef({});
  const removedBooksRef = useRef({});

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
      setCourses((prev) => {
        const removed = prev.find((c) => c._id === courseId);
        if (removed) removedCoursesRef.current[courseId] = removed;
        return prev.filter((c) => c._id !== courseId);
      });
    } else if (removedCoursesRef.current[courseId]) {
      setCourses((prev) => [...prev, removedCoursesRef.current[courseId]]);
      delete removedCoursesRef.current[courseId];
    }
  };

  const handleBookBookmarkChange = (isBookmarked, bookId) => {
    if (!isBookmarked) {
      setBooks((prev) => {
        const removed = prev.find((b) => b._id === bookId);
        if (removed) removedBooksRef.current[bookId] = removed;
        return prev.filter((b) => b._id !== bookId);
      });
    } else if (removedBooksRef.current[bookId]) {
      setBooks((prev) => [...prev, removedBooksRef.current[bookId]]);
      delete removedBooksRef.current[bookId];
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
    <PageShell>
      <PageHeader
        icon={Bookmark}
        title="My Saved Hub"
        subtitle="Access all your bookmarked courses and books in one place"
      />

      {/* Tab Toggle */}
      <div className="flex gap-2">
        <Button
          variant={activeTab === "courses" ? "default" : "outline"}
          className={cn(
            "rounded-full",
            activeTab === "courses" && "bg-accent text-white hover:bg-accent/90"
          )}
          onClick={() => setActiveTab("courses")}
        >
          <LaptopMinimal className="h-4 w-4 mr-1" />
          Courses ({courses.length})
        </Button>
        <Button
          variant={activeTab === "books" ? "default" : "outline"}
          className={cn(
            "rounded-full",
            activeTab === "books" && "bg-accent text-white hover:bg-accent/90"
          )}
          onClick={() => setActiveTab("books")}
        >
          <Book className="h-4 w-4 mr-1" />
          Books ({books.length})
        </Button>
      </div>

      {/* Content */}
      {loading ? (
        <CardGrid>
          {[...Array(6)].map((_, idx) =>
            activeTab === "courses" ? (
              <CourseCardSkeleton key={`skeleton-course-${idx}`} />
            ) : (
              <LibraryBookSkeleton key={`skeleton-book-${idx}`} />
            )
          )}
        </CardGrid>
      ) : activeTab === "courses" ? (
        courses.length === 0 ? (
          <EmptyState
            icon={LaptopMinimal}
            title="No Saved Courses"
            description="Explore our catalog and bookmark courses you are interested in."
            action={
              <Button
                variant="outline"
                className="rounded-full"
                onClick={() => (window.location.href = "/dashboard/courses")}
              >
                Browse Courses
              </Button>
            }
          />
        ) : (
          <CardGrid>
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
          </CardGrid>
        )
      ) : books.length === 0 ? (
        <EmptyState
          icon={Book}
          title="No Saved Books"
          description="Browse our Islamic library and save books to build your personal reading list."
          action={
            <Button
              variant="outline"
              className="rounded-full"
              onClick={() => (window.location.href = "/dashboard/library")}
            >
              Browse Library
            </Button>
          }
        />
      ) : (
        <CardGrid>
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
        </CardGrid>
      )}
    </PageShell>
  );
}
