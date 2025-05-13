"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import CourseCard from "@/components/molecules/dashboard/cards/courseCard";
import CourseCardSkeleton from "@/components/atoms/skeletons/CourseCardSkeleton";
export default function CoursesPage() {
    const [courses, setCourses] = useState([]);
const [loading, setLoading] = useState(true);
    useEffect(() => {
        const course = async () => {
            setLoading(true);
            const res = await axios.get("/api/courses");
            setCourses(res.data);
        }
        course();
        setLoading(false);

    })
    return (
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                {loading ? <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(6)].map((_, idx) => (
                            <CourseCardSkeleton key={idx} />
                        ))}
                    </div>
                </> : <> {courses.map((course, index) => (
                    <CourseCard key={course.id || index} course={course} />
                ))}
                </>}   
            </div>
        </div>
    
    );
}