import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Button from "@/components/atoms/form/Button";
import Link from "next/link";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const CourseCard = ({ course }) => {
  return (
    <Card className="relative flex flex-col overflow-hidden rounded-2xl  bg-muted/30 backdrop-blur-xl shadow-lg hover:shadow-2xl hover:scale-[1.015] transition-all group">
      {/* Image */}
      <div className="relative h-60 w-full">
        <Image
          src={course.thumbnail || "/images/dnb.png"}
          alt={course.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent z-10" />

        {/* Category  */}
        <div className="absolute top-3 left-3 right-3 z-20 ">
          <Badge className="bg-white/80 text-accent font-bold px-3 py-1 rounded-full shadow border-0 text-xs uppercase tracking-wider">
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
          <Link
            href={`/account/profile/${course.createdBy?._id}`}
            className="flex items-center gap-2"
          >
            <Avatar className="h-10 w-10 rounded-lg">
              <AvatarImage
                src={course.createdBy?.avatar || "/images/placeholder.jpg"}
                alt="Instructor"
              />
              <AvatarFallback className="rounded-lg">CN</AvatarFallback>
            </Avatar>
            <div className="text-sm">
              <p className="font-medium">
                {course.createdBy?.name || "Ali Jamal"}
              </p>
              <p className="text-muted-foreground text-xs">Instructor</p>
            </div>
          </Link>
          <div>
            <div className="bg-gradient-to-r from-highlight to-accent text-white text-xs font-bold px-3 py-1 rounded-full shadow">
              {course.price ? `$${course.price}` : "Free"}
            </div>
          </div>
        </div>
      </CardContent>

      {/* Full-width Button */}
      <div className="px-5">
        <Button
          wide
          round
          className="w-full bg-accent text-white hover:bg-accent/90 text-sm font-semibold"
          to={`/dashboard/courses/${course._id}`}
        >
          View Course
        </Button>
      </div>
    </Card>
  );
};

export default CourseCard;
