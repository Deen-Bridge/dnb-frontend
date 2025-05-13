"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import CourseCard from "@/components/molecules/dashboard/courseCard";

export default function CoursesPage() {
    const [courses, setCourses] = useState([]);

    useEffect(() => {
        const course = async () => {
            const res = await axios.get("/api/courses");
            setCourses(res.data);
        }
        course();

    })
    return (
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                {courses.map((course, index) => (
                    <CourseCard key={course.id || index} course={course} />
                ))}
            </div>
        </div>
    
    );
}