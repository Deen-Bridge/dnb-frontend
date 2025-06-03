import axios from "axios";
import React, { useEffect, useState } from "react";
import CourseCard from "@/components/molecules/dashboard/cards/courseCard";
import CourseCardSkeleton from "@/components/atoms/skeletons/CourseCardSkeleton";
import LibraryBookCard from "@/components/molecules/dashboard/cards/libraryCard";
import { fetchUserCourses } from '@/lib/actions/courses/fetch-user-id-courses';
import { fetchUserBooks } from '@/lib/actions/library/fetch-user-id-books';
import { useAuth } from "@/hooks/useAuth";

import NetworkErrorComp from "@/components/molecules/errors/NetworkError";

const ProfileContent = ({ selectedTab, profileId }) => {
    switch (selectedTab) {
        case "courses":
            return <CoursesTab profileId={profileId} />;
        case "books":
            return <BooksTab profileId={profileId} />;
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


const CoursesTab = ({ profileId }) => {
    const { loading } = useAuth();
    const [userCourses, setUserCourses] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (loading) return;
        const getCourses = async () => {
            setIsLoading(true);
            setError(null);
            try {
                if (profileId) {
                    console.log("Fetching courses for profileId:", profileId);
                    const data = await fetchUserCourses(profileId);
                    setUserCourses(data);
                } else {
                    userCourses([]);
                    setError("User not found or not logged in");
                }
            } catch (err) {
                setUserCourses([]);
                setError("Failed to fetch courses. Please check your connection.");
            } finally {
                setIsLoading(false);
            }
        };
        getCourses();
    }, [loading]);

    if (error) {
        return (
            <NetworkErrorComp
                errMsg={error}
                reset={() => {
                    setError(null);
                    setIsLoading(true);
                    if (profileId) {
                        fetchUserCourses(profileId)
                            .then(data => setUserCourses(data))
                            .catch(() => setError("Failed to fetch courses. Please check your connection."))
                            .finally(() => setIsLoading(false));
                    }
                }}

            />
        );
    }

    return (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 pt-5">
            {isLoading ? (
                [...Array(6)].map((_, idx) => <CourseCardSkeleton key={idx} />)
            ) : userCourses && userCourses.length > 0 ? (
                userCourses.map((course, index) => (
                    <CourseCard key={course.id || course._id || index} course={course} />
                ))
            ) : (
                <Placeholder title="courses" />
            )}
        </div>
    );
};

const BooksTab = ({ profileId }) => {
    const { loading } = useAuth(); // you don't need user here
    const [userBooks, setUserBooks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (loading || !profileId) return; // Wait for loading to finish
        const getBooks = async () => {
            setIsLoading(true);
            setError(null);
            try {
                console.log("Fetching books for profileId:", profileId);
                const data = await fetchUserBooks(profileId);
                setUserBooks(data);
            } catch (err) {
                setUserBooks([]);
                setError("Failed to fetch books. Please check your connection.");
            } finally {
                setIsLoading(false);
            }
        };
        getBooks();
    }, [profileId, loading]);

    if (error) {
        return (
            <NetworkErrorComp
                errMsg={error}
                reset={() => {
                    setError(null);
                    setIsLoading(true);
                    if (profileId) {
                        fetchUserBooks(profileId)
                            .then(data => setUserBooks(data))
                            .catch(() => setError("Failed to fetch books. Please check your connection."))
                            .finally(() => setIsLoading(false));
                    }
                }}
            />
        );
    }

    return (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 pt-5">
            {isLoading ? (
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

