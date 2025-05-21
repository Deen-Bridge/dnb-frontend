import axios from "axios";
import React, { useEffect, useState } from "react";
import CourseCard from "@/components/molecules/dashboard/cards/courseCard";
import CourseCardSkeleton from "@/components/atoms/skeletons/CourseCardSkeleton";
import LibraryBookCard from "@/components/molecules/dashboard/cards/libraryCard";
import { fetchUserCourses } from '@/lib/actions/courses/fetch-user-id-courses';
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
    const { user } = useAuth();
    const [courses, setCourses] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    useEffect(() => {
        const getCourses = async () => {
            setIsLoading(true);
            try {
                if (user && user.id) {
                    const data = await fetchUserCourses(user.id);
                    setCourses(data);
                } else {
                    setCourses([]);
                }
            } catch (err) {
                setCourses([]);
            } finally {
                setIsLoading(false);
            }
        };
        getCourses();
    }, [user]);
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
    
    return (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 pt-5">
            {books && books.length > 0 ? (
                books.map((book) => (
                    <LibraryBookCard key={book.id} book={book} />
                ))
            ) : (
                <Placeholder title="books" />
            )}
        </div>
    );
};
const FollowersTab = () => <Placeholder title="followers" />;

