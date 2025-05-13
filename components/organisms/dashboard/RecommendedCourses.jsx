import CourseCard from "@/components/organisms/dashboard/CourseCard";
const courses = [
    { title: "Qur’an Recitation Basics", price: 29, instructor: "Ibrahim", category: "Qur'an", image: "https://cdn.pixabay.com/photo/2016/10/22/15/19/book-1760998_1280.jpg" },
    { title: "Principles of Islamic Belief", price: "Free", instructor: "Maryam", category: "Aqeedah", image: "https://cdn.pixabay.com/photo/2016/10/22/15/19/book-1760998_1280.jpg" },
    { title: "Arabic Grammar for Beginners", price: 49, instructor: "Ali", category: "Arabic", image: "https://cdn.pixabay.com/photo/2016/10/22/15/19/book-1760998_1280.jpg" },
    { title: "Understanding Hadith", price: 39, instructor: "Fatima", category: "Hadith", image: "https://cdn.pixabay.com/photo/2016/10/22/15/19/book-1760998_1280.jpg" },
    { title: "Islamic History Overview", price: 59, instructor: "Zayd", category: "History", image: "https://cdn.pixabay.com/photo/2016/10/22/15/19/book-1760998_1280.jpg" },
    { title: "Islamic Ethics and Morality", price: 35, instructor: "Aisha", category: "Ethics", image: "https://cdn.pixabay.com/photo/2016/10/22/15/19/book-1760998_1280.jpg" },
    { title: "Fiqh of Worship", price: 45, instructor: "Umar", category: "Fiqh", image: "https://cdn.pixabay.com/photo/2016/10/22/15/19/book-1760998_1280.jpg" },
    { title: "Islamic Finance Basics", price: 50, instructor: "Khadijah", category: "Finance", image: "https://cdn.pixabay.com/photo/2016/10/22/15/19/book-1760998_1280.jpg" },
    // Add more...
];

const RecommendedCourses = () => (
    <div>
        <h3 className="text-xl font-semibold mb-4">Recommended for You</h3>
        <div className="grid sm:grid-cols-2 gap-4">
            {courses.map((course, i) => (
                <CourseCard key={i} course={course} />
            ))}
        </div>
    </div>
);

export default RecommendedCourses;
