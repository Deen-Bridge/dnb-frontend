import RecommendedBookCard from "./R-BooksCard";
import { cn } from "@/lib/utils";
import { roboto_500 } from "@/lib/config/font.config";
const books = [
    { title: "Qur’an Recitation Basics", rating: 4, readCount: 412, price: 29, instructor: "Abu Zayd", category: "Qur'an", image: "/images/img-5.jpg" },
    { title: "Principles of Islamic Belief", rating: 4, readCount: 567, price: "Free", instructor: "Maryam Uthman", category: "Aqeedah", image: "/images/img-6.jpg" },
    { title: "Arabic Grammar for Beginners", rating: 5, readCount: 1112, price: 49, instructor: "Ali Kabir", category: "Arabic", image: "/images/img-13.jpg" },
    { title: "Understanding Hadith", rating: 3, readCount: 654, price: 30, instructor: "Ibn Fatima", category: "Hadith", image: "/images/img-12.jpg" }
];

const ReccomendedBooks = () => (
    <div>
        <h3 className={cn("text-xl font-bold mb-4 mt-10", roboto_500.className)}>Recommended Books for You</h3>
        <div className="grid sm:grid-cols-2 gap-4">
            {books.map((book, i) => (
                <RecommendedBookCard key={i} book={book} />
            ))}
        </div>
    </div>
);

export default ReccomendedBooks;
