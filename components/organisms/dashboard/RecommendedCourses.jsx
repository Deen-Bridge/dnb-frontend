"use client";
import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import RecommendedCourseCard from "@/components/organisms/dashboard/R-CourseCard";
import { cn } from "@/lib/utils";
import { Inter_500 } from "@/lib/config/font.config";
import {
  fetchAllCourses,
  fetchRecommendedCourses,
} from "@/lib/actions/recommendations";
import { toast } from "sonner";
import CourseCardSkeleton from "@/components/atoms/skeletons/CourseCardSkeleton";
import NetworkErrorComp from "@/components/molecules/errors/NetworkError";
import { getAverageRating } from "@/hooks/getAverageRating";

const RecommendedCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [hasInterests, setHasInterests] = useState(true);

  const loadCourses = async () => {
    try {
      setLoading(true);
      setError(false);

      // Get user data from cookies (where it's actually stored)
      const userInfo = Cookies.get("userInfo");
      let interests = [];

      if (userInfo) {
        const user = JSON.parse(userInfo);
        interests = user.interests || [];
      }

      // Track if user has interests for display purposes
      setHasInterests(interests.length > 0);

      // Fetch recommended courses based on interests, or all courses
      let response;
      let isRecommended = false;

      if (interests.length > 0) {
        response = await fetchRecommendedCourses(interests);
        isRecommended = true;
      } else {
        response = await fetchAllCourses();
      }

      let coursesData = [];
      if (response.success && response.courses) {
        // Courses API returns { success: true, courses: [...] }
        coursesData = response.courses;
      } else if (response.recommended) {
        // Recommended API returns { success: true, recommended: [...] }
        coursesData = response.recommended;
      } else if (Array.isArray(response)) {
        // Handle case where response is directly an array
        coursesData = response;
      }

      // If recommended results are empty, fetch all courses as fallback
      if (isRecommended && coursesData.length === 0) {
        response = await fetchAllCourses();
        if (response.success && response.courses) {
          coursesData = response.courses;
          setHasInterests(false); // Treat as if no interests for display
        }
      }

      // If no interests OR fallback was used, sort by rating and popularity
      if ((interests.length === 0 || !hasInterests) && coursesData.length > 0) {
        coursesData.sort((a, b) => {
          const ratingA = getAverageRating(a.reviews);
          const ratingB = getAverageRating(b.reviews);
          const enrolledA = a.enrolledUsers?.length || 0;
          const enrolledB = b.enrolledUsers?.length || 0;

          // Sort by rating first, then by enrollment count
          if (ratingB !== ratingA) {
            return ratingB - ratingA;
          }
          return enrolledB - enrolledA;
        });
      }

      // Limit to 4 courses for the dashboard
      setCourses(coursesData.slice(0, 4));
    } catch (error) {
      console.error("Error loading courses:", error);
      setError(true);
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCourses();
  }, []);

  const sectionTitle = hasInterests
    ? "Recommended Courses for You"
    : "Popular Courses";

  const emptyMessage = hasInterests
    ? "No courses match your interests yet. Try updating your profile interests!"
    : "No courses available at the moment. Check back soon!";

  if (error) {
    return (
      <NetworkErrorComp
        errMsg="Failed to load recommended courses. Please try again."
        reset={() => loadCourses()}
        className="h-auto py-12"
      />
    );
  }

  if (loading) {
    return (
      <div>
        <h3 className={cn("text-xl font-bold mb-4", Inter_500.className)}>
          {sectionTitle}
        </h3>
        <div className="grid sm:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <CourseCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <div>
        <h3 className={cn("text-xl font-bold mb-4", Inter_500.className)}>
          {sectionTitle}
        </h3>
        <p className="text-muted-foreground text-center py-8">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div>
      <h3 className={cn("text-xl font-bold mb-4", Inter_500.className)}>
        {sectionTitle}
        {!hasInterests && (
          <span className="text-xs font-normal text-muted-foreground ml-2">
            (Based on ratings & popularity)
          </span>
        )}
      </h3>
      <div className="grid sm:grid-cols-2 gap-4">
        {courses.map((course) => (
          <RecommendedCourseCard
            key={course._id || course.id}
            course={{
              ...course,
              instructor: course.createdBy?.name || "DeenBridge Tutor",
              image: course.thumbnail || "/images/img-9.jpeg",
              price: course.price === 0 ? "Free" : course.price,
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default RecommendedCourses;
