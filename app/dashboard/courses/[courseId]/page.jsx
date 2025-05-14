import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  BookOpenCheck,
  GraduationCap,
  Star,
  Users,
  Play,
  Sparkle,
} from "lucide-react";
import Image from "next/image";

// Mock Fetch (replace with real API later)
async function getCourseById(id) {
  if (!id) return null;
  return {
    id,
    title: "Mastering React & Next.js",
    description:
      "A complete guide to building blazing-fast web apps with React, Next.js 14, Tailwind, and more.",
    coverImage: "/images/img-2.jpeg",
    instructor: {
      name: "Sarah Techie",
      bio: "Frontend engineer & educator with 8+ years building delightful UIs.",
      avatar: "/images/img1.jpeg",
    },
    students: 1320,
    rating: 4.8,
    lessons: 24,
    category: "Web Development",
    price: 0,
  };
}


export default async function Page({ params }) {
  const { courseId } = params;
  const course = await getCourseById(courseId);

  if (!course) return notFound();

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-12 animate-fade-in">
      {/* Banner */}
      <div className="relative w-full h-[400px] rounded-3xl overflow-hidden shadow-2xl">
        <Image
          src={course.coverImage}
          alt={course.title}
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm p-10 flex flex-col justify-end">
          <h1 className="text-white text-5xl font-extrabold drop-shadow-lg">
            {course.title}
          </h1>
          <p className="text-muted mt-2 text-lg max-w-2xl">
            {course.description}
          </p>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid md:grid-cols-3 gap-10">
        {/* Left */}
        <div className="md:col-span-2 space-y-8">
          {/* Instructor Info */}
          <div className="bg-muted/10 p-6 rounded-2xl shadow-xl border border-border space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2 text-primary">
              <GraduationCap className="w-5 h-5" />
              Instructor
            </h2>
            <div className="flex items-center gap-4">
              <Avatar className="h-14 w-14 border">
                <AvatarImage src={course.instructor.avatar} />
                <AvatarFallback>ST</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-lg">{course.instructor.name}</p>
                <p className="text-sm text-muted-foreground">
                  {course.instructor.bio}
                </p>
              </div>
            </div>
          </div>

          {/* Call To Action */}
          <div className="flex flex-wrap gap-4">
            <Button className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-base font-medium px-6 py-3 rounded-xl hover:scale-105 transition">
              <Sparkle className="w-4 h-4 mr-2" />
              Enroll Now
            </Button>
            <Button variant="outline" className="px-6 py-3 rounded-xl border-dashed">
              <Play className="w-4 h-4 mr-2" />
              Preview Course
            </Button>
          </div>
        </div>

        {/* Stats Sidebar */}
        <aside className="bg-muted/10 p-6 rounded-2xl shadow-xl border border-border space-y-6">
          <h3 className="text-xl font-semibold flex items-center gap-2 mb-2">
            <BookOpenCheck className="w-5 h-5 text-primary" />
            Course Overview
          </h3>

          <div className="space-y-4">
            <StatItem
              label="Students"
              icon={<Users className="text-sky-500 w-5 h-5" />}
              value={course.students.toLocaleString()}
            />
            <StatItem
              label="Rating"
              icon={<Star className="text-yellow-500 w-5 h-5" />}
              value={`${course.rating} / 5`}
            />
            <StatItem
              label="Lessons"
              icon={<BookOpenCheck className="text-pink-500 w-5 h-5" />}
              value={course.lessons}
            />
            <StatItem
              label="Category"
              icon={<Badge className="bg-emerald-600 text-white">{course.category}</Badge>}
              value=""
            />
            <StatItem
              label="Price"
              icon={<Badge variant="secondary">{course.price === 0 ? "Free" : `$${course.price}`}</Badge>}
              value=""
            />
          </div>
        </aside>
      </div>
    </div>
  );
}

// Component: Single Stat Row
function StatItem({
  label,
  icon,
  value,
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2 text-muted-foreground font-medium">
        {icon}
        {label}
      </div>
      <div className="text-primary font-bold text-sm">{value}</div>
    </div>
  );
}
