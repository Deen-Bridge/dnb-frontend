import axios from "axios";
import React, { useEffect, useState } from "react";
import CourseCard from "@/components/molecules/dashboard/cards/courseCard";
import CourseCardSkeleton from "@/components/atoms/skeletons/CourseCardSkeleton";
import LibraryBookCard from "@/components/molecules/dashboard/cards/libraryCard";
import { fetchUserCourses } from '@/lib/actions/courses/fetch-user-id-courses';
import { fetchUserBooks } from '@/lib/actions/library/fetch-user-id-books';
import { useAuth } from "@/hooks/useAuth";
import { books } from "@/lib/data";
const ProfileContent = ({ selectedTab }) => {
    switch (selectedTab) {
        case "courses":
            return <CoursesTab />;
        case "books":
            return <BooksTab />;
        case "followers":
            return <FollowersTab />;
        default:
            return <div>Coming soon...</div>;
    }
};

export default ProfileContent;

// Temporary placeholder components
const Placeholder = ({ title }) => (
    <div className="p-6 text-center text-muted-foreground text-lg">
        No {title} yet. Stay tuned!
    </div>
);

const CoursesTab = () => {
    const { user, loading } = useAuth();
    const [courses, setCourses] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
useEffect(() => {
    if (loading) return;
    console.log("User in CoursesTab:", user);

    const getCourses = async () => {
        setIsLoading(true);
        try {
            if (user && user._id) {
                const data = await fetchUserCourses(user._id);
                console.log("Fetched courses:", data); // ✅ ADD THIS
                setCourses(data);
            } else {
                setCourses([]);
                console.warn("User not found or not logged in");
            }
        } catch (err) {
            setCourses([]);
            console.log("Error fetching courses:", err);
        } finally {
            setIsLoading(false);
        }
    };
    getCourses();
}, [user, loading]);

    return (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 pt-5">
            {isLoading ? (
                // Show skeletons while loading
                [...Array(6)].map((_, idx) => <CourseCardSkeleton key={idx} />)
            ) : courses && courses.length > 0 ? (
                // Map over courses when loaded
                courses.map((course, index) => (
                    <CourseCard key={course.id || course._id || index} course={course} />
                ))
            ) : (
                // Show placeholder if no courses
                <Placeholder title="courses" />
            )}
        </div>
    );
};
const BooksTab = () => {
    const { user, loading } = useAuth();
    const [userBooks, setUserBooks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    useEffect(() => {
        if (loading) return;
        const getBooks = async () => {
            setIsLoading(true);
            try {
                if (user && user._id) {
                    console.log("Fetching books for user:", user._id);
                    const data = await fetchUserBooks(user._id);
                    console.log("Fetched books:", data);
                    setUserBooks(data);
                } else {
                    setUserBooks([]);
                }
            } catch (err) {
                setUserBooks([]);
                console.log("Error fetching books:", err);
            } finally {
                setIsLoading(false);
            }
        };
        getBooks();
    }, [user, loading]);
    return (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 pt-5">
            {isLoading ? (
                // Show skeletons while loading
                [...Array(6)].map((_, idx) => <CourseCardSkeleton key={idx} />)
            ) : userBooks && userBooks.length > 0 ? (
                userBooks.map((book) => (
                    <LibraryBookCard key={book.id || book._id} book={book} />
                ))
            ) : (
                <Placeholder title="books" />
            )}
        </div>
    );
};
const FollowersTab = () => <Placeholder title="followers" />;

