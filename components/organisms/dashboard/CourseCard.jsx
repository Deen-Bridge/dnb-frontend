import Image from "next/image";
import Button from "@/components/atoms/form/Button";
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge";

const CourseCard = ({ course }) => (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden flex flex-col">
        {/* Course Image */}
        <div className="relative h-40 w-full">
            <Image
                src={course.image || "/images/placeholder.jpg"}
                alt={course.title || "image"}
                fill
                className="object-cover"
            />
        </div>

        {/* Content */}
        <div className="flex flex-col justify-between p-4 flex-grow">
            <div>
                <h4 className="text-lg font-semibold">{course.title}</h4>


                {/* Instructor */}
                <div className="flex items-center gap-2 mt-2">
                    <Avatar className="h-8 w-8 rounded-lg">
                        <AvatarImage src="/images/img1.jpeg" alt={course.instructor || "Image"} />
                        <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm">
                        <span className="truncate">{course.instructor}</span>
                        {/* <span className="truncate text-xs">{user?.email}</span> */}
                    </div>

                    {/* Category & Price */}
                    <div className="flex items-center gap-2">
                        <span className="bg-gradient-to-r from-highlight to-accent text-white text-xs font-bold px-3 py-1 rounded-full shadow">
                            {course.price ? `$${course.price}` : "Free"}
                        </span>
                        <span>
                            <Badge className="bg-primary  text-white/90 text-xs font-semibold">
                                {course.category || "General"}
                            </Badge>

                        </span>
                    </div>
                </div>

            </div>

            {/* Full-width Button */}
            <Button wide round className="bg-accent mt-4 w-full">
                View Course
            </Button>
        </div>
    </div>
);

export default CourseCard;

