"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import CourseCard from "@/components/molecules/dashboard/cards/courseCard";
import CourseCardSkeleton from "@/components/atoms/skeletons/CourseCardSkeleton";

export default function CoursesPage() {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                setLoading(true);
                const res = await axios.get("/api/courses");
                setCourses(res.data);
            } catch (error) {
                console.error("Error fetching courses:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchCourses();
    }, []);

    return (
        <div className="mt-5 bg-muted">
            {/* <h2 className="font-semibold text-3xl text-accent p-5">
                Courses created to suit your soul
            </h2> */}

            <div className="flex flex-1 flex-col gap-4 mt-10 p-4 pt-0">
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 ">
                    {loading ? (
                        [...Array(6)].map((_, idx) => <CourseCardSkeleton key={idx} />)
                    ) : (
                        courses.map((course, index) => (
                            <CourseCard key={course.id || index} course={course} />
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
