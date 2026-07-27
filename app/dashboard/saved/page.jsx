"use client";

import React, { useEffect, useRef, useState } from "react";
import { Bookmark, LaptopMinimal, Book } from "lucide-react";
import CourseCard from "@/components/molecules/dashboard/cards/courseCard";
import LibraryBookCard from "@/components/molecules/dashboard/cards/libraryCard";
import CourseCardSkeleton from "@/components/atoms/skeletons/CourseCardSkeleton";
import LibraryBookSkeleton from "@/components/atoms/skeletons/LibraryBookSkeleton";
import Button from "@/components/atoms/form/Button";
import { Card, CardContent } from "@/components/ui/card";
import { getBookmarkedCourses } from "@/lib/actions/courses/bookmark-course";
import { getBookmarkedBooks } from "@/lib/actions/library/bookmark-book";
import NetworkErrorComp from "@/components/molecules/errors/NetworkError";

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
    <div className="p-4 sm:p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Bookmark className="h-6 w-6 text-accent fill-accent" />
          My Saved Hub
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Access all your bookmarked courses and books in one place
        </p>
      </div>

      {/* Tab Toggle */}
      <div className="flex gap-2">
        <Button
          round
          outlined={activeTab !== "courses"}
          className={activeTab === "courses" ? "bg-accent text-white" : ""}
          onClick={() => setActiveTab("courses")}
        >
          <LaptopMinimal className="h-4 w-4 mr-1" />
          Courses ({courses.length})
        </Button>
        <Button
          round
          outlined={activeTab !== "books"}
          className={activeTab === "books" ? "bg-accent text-white" : ""}
          onClick={() => setActiveTab("books")}
        >
          <Book className="h-4 w-4 mr-1" />
          Books ({books.length})
        </Button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
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
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16 text-center space-y-4">
              <LaptopMinimal className="h-12 w-12 text-muted-foreground" />
              <div>
                <h3 className="font-semibold text-lg">No Saved Courses</h3>
                <p className="text-muted-foreground text-sm mt-1 max-w-md">
                  Explore our catalog and bookmark courses you are interested in.
                </p>
              </div>
              <Button round outlined onClick={() => window.location.href = "/dashboard/courses"}>
                Browse Courses
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
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
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center space-y-4">
            <Book className="h-12 w-12 text-muted-foreground" />
            <div>
              <h3 className="font-semibold text-lg">No Saved Books</h3>
              <p className="text-muted-foreground text-sm mt-1 max-w-md">
                Browse our Islamic library and save books to build your personal reading list.
              </p>
            </div>
            <Button round outlined onClick={() => window.location.href = "/dashboard/library"}>
              Browse Library
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
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
  );
}
