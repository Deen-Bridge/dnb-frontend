import Image from "next/image";
import Button from "@/components/atoms/form/Button";

const CourseCard = ({ course }) => (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden flex flex-col">
        {/* Course Image */}
        <div className="relative h-40 w-full">
            <Image
                src={course.image || "/images/placeholder.jpg"}
                alt={course.title}
                fill
                className="object-cover"
            />
        </div>

        {/* Content */}
        <div className="flex flex-col justify-between p-4 flex-grow">
            <div>
                <h4 className="text-lg font-semibold">{course.title}</h4>

                {/* Category & Price */}
                <div className="flex gap-2 text-xs mt-2">
                    <span className="bg-primary/10 text-primary px-2 py-1 rounded">
                        {course.category}
                    </span>
                    <span className="bg-secondary text-secondary-foreground px-2 py-1 rounded">
                        ${course.price}
                    </span>
                </div>

                <p className="text-sm mt-2 text-muted-foreground">
                    Instructor: {course.instructor}
                </p>
            </div>

            {/* Full-width Button */}
            <Button wide round className="bg-accent mt-4 w-full">
                View Course
            </Button>
        </div>
    </div>
);

export default CourseCard;

