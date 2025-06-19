import RecommendedCourseCard from "@/components/organisms/dashboard/R-CourseCard";
import { cn } from "@/lib/utils";
import { roboto_500 } from "@/lib/config/font.config";
const courses = [
    { title: "Qur’an Recitation Basics", price: 29, instructor: "Ibrahim Jato", category: "Qur'an", image: "https://cdn.pixabay.com/photo/2016/10/22/15/19/book-1760998_1280.jpg" },
    { title: "Principles of Islamic Belief", price: "Free", instructor: "Maryam Abubakar", category: "Aqeedah", image: "/images/img-9.jpeg" },
    { title: "Arabic Grammar for Beginners", price: 49, instructor: "Muhammad Mustapha", category: "Arabic", image: "/images/img-2.jpeg" },
    { title: "Understanding Hadith", price: 39, instructor: "Jamiu Fauziyah", category: "Hadith", image: "/images/img-10.jpg" }
];

const RecommendedCourses = () => (
    <div>
        <h3 className={cn("text-xl font-bold mb-4", roboto_500.className)}>Recommended Courses for You</h3>
        <div className="grid sm:grid-cols-2 gap-4">
            {courses.map((course, i) => (
                <RecommendedCourseCard key={i} course={course} />
            ))}
        </div>
    </div>
);

export default RecommendedCourses;
