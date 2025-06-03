import VidPlayerBox from "@/components/atoms/dashboard/vid-player-box";
import { getCourseById } from "@/lib/actions/courses/get-course";
import { notFound } from "next/navigation";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import Link from "next/link";
import React from "react";
import Button from "@/components/atoms/form/Button";
export default async function Page({ params }) {
  const { courseId } = params;
  const course = await getCourseById(courseId);

  if (!course){
    setTimeout(()=>{
      return notFound();
    },4000)
  } 

  return (
    <div className="max-w-full px-2 sm:px-4 py-4">
      <h2 className="text-3xl font-extrabold mb-6">Watch Course</h2>

      {/* Video Player Full Width */}
      <div className="w-full min-h-[360px] lg:min-h-[480px] mb-8">
        <VidPlayerBox data={course} />
      </div>

      {/* Info Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 px-2 sm:px-10">
        {/* Left Column: Course details */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-4xl font-semibold">{course.title}</h3>
          <p className="text-gray-700 leading-relaxed">{course.description}</p>
          <Link href={`/account/profile/${course.createdBy?._id}`} className="flex items-center gap-2">
            <Avatar className="h-10 w-10 rounded-lg">
              <AvatarImage src={course.createdBy?.avatar || "/images/img1.jpeg"} />
              <AvatarFallback>{course.createdBy?.name?.charAt(0) || "A"}</AvatarFallback>
            </Avatar>
            <div className="flex flex-row justify-between items-center">
              <div className="flex  justify-between   pt-2">
                <span className="font-medium text-black">{course.createdBy?.name || "Unknown creator"}</span>
                <span className="text-sm text-muted">{course.createdBy?.role || "Unknown creator"}</span>
              </div>

              <div className="border-t pt-4 text-gray-600 text-sm space-y-2">
                <p><strong>Duration:</strong> {course.duration || "N/A"}</p>
                <p><strong>Level:</strong> {course.level || "Beginner"}</p>
                {/* Add more course info here */}
              </div>
            </div>
          </Link>


        </div>

        {/* Right Column: Pricing & category */}
        <aside className="border rounded-md p-6 h-fit shadow-sm bg-white space-y-4">
          <h3 className="text-xl font-semibold">{course.title}</h3>
          <div className="flex items-center justify-between mb-4">
            <span className="inline-block mb-4 px-3 py-1 rounded bg-gray-100 text-accent font-semibold capitalize">
              {course.category}
            </span>
            <p className="text-2xl font-bold mb-3">${course.price}</p>
          </div>

          <Button wide round className="bg-accent hover:bg-accent/90 text-white">
            Buy Course
          </Button>
        </aside>
      </div>
    </div>
  );
}
