import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Button from "@/components/atoms/form/Button";
import Image from "next/image";
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar";

const CourseCard = ({ course }) => {
    return (
        <Card className="relative flex flex-col overflow-hidden rounded-2xl  bg-muted/30 backdrop-blur-xl shadow-lg hover:shadow-2xl hover:scale-[1.015] transition-all group">
            {/* Image */}
            <div className="relative h-60 w-full">
                <Image
                    src={course.image || "/images/placeholder.jpg"}
                    alt={course.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent z-10" />

                {/* Category  */}
                <div className="absolute top-3 left-3 right-3 z-20 ">
                    <Badge className="bg-white/90 text-highlight text-xs font-semibold shadow">
                        {course.category || "General"}
                    </Badge>

                </div>
            </div>

            {/* Header */}
            <CardHeader>
                <CardTitle className="text-lg font-bold  line-clamp-1">
                    {course.title}
                </CardTitle>
                <p className="text-sm text-muted-foreground line-clamp-2">
                    {course.description}
                </p>
            </CardHeader>

            {/* Instructor */}
            <CardContent>
                <div className="flex justify-between items-center gap-3">
                    <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8 rounded-lg">
                            <AvatarImage src="/images/img1.jpeg" alt="Instructor" />
                            <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                        </Avatar>
                        <div className="text-sm">
                            <p className="font-medium">{course.instructor || "Ali Jamal"}</p>
                            <p className="text-muted-foreground text-xs">Instructor</p>
                        </div>
                    </div>
                    <div>
                        <div className="bg-gradient-to-r from-highlight to-accent text-white text-xs font-bold px-3 py-1 rounded-full shadow">
                            {course.price ? `$${course.price}` : "Free"}
                        </div></div>

                </div>
            </CardContent>

            {/* Full-width Button */}
            <div className="px-5">
                <Button
                    wide
                    round
                    className="w-full bg-highlight text-white hover:bg-accent text-sm font-semibold"
                    to={`/dashboard/courses/${course.id}`}
                >
                    View Course
                </Button>
            </div>
        </Card>
    );
};

export default CourseCard;


// import {
//     Card,
//     CardContent,
//     CardFooter,
//     CardHeader,
//     CardTitle,
// } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import Button from "@/components/atoms/form/Button";
// import { User } from "lucide-react";
// import Image from "next/image";

// const Library = ({ course }) => {
//     return (
//         <Card className="overflow-hidden rounded-2xl border border-border bg-muted/20 backdrop-blur-xl shadow-md transition-all hover:shadow-2xl hover:scale-[1.015] group">

//             {/* Course Image */}
//             <div className="relative h-56 w-full overflow-hidden">
//                 <Image
//                     src={course.image || "/images/placeholder.jpg"}
//                     alt={course.title}
//                     fill
//                     className="object-cover transition-transform duration-500 group-hover:scale-110"
//                 />
//                 <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent z-10" />
//             </div>

//             {/* Header & Title */}
//             <CardHeader className="space-y-1">
//                 <CardTitle className="text-xl font-semibold text-primary line-clamp-1">
//                     {course.title}
//                 </CardTitle>
//                 <p className="text-sm text-muted-foreground line-clamp-2">
//                     {course.description}
//                 </p>
//             </CardHeader>

//             {/* Body Content */}
//             <CardContent className="flex flex-col gap-3">
//                 <div className="flex items-center gap-2 text-sm text-muted-foreground">
//                     <User className="h-4 w-4 text-primary" />
//                     <span className="font-medium">Instructor:</span>
//                     {course.instructor || "Unknown"}
//                 </div>

//                 <div className="flex flex-wrap gap-2 mt-1">
//                     <Badge variant="outline" className="text-xs border-primary text-primary">
//                         {course.category || "General"}
//                     </Badge>
//                     <Badge variant="secondary" className="text-xs">
//                         ${course.price || "Free"}
//                     </Badge>
//                 </div>
//             </CardContent>

//             {/* Footer */}
//             <CardFooter>
//                 <Button
//                     wide
//                     round
//                     className="w-full bg-highlight text-white hover:bg-accent"
//                     to={`/dashboard/courses/${course.id}`}
//                 >
//                     View Course
//                 </Button>
//             </CardFooter>
//         </Card>
//     );
// };

// export default Library;

