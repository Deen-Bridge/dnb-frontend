import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Button from "@/components/atoms/form/Button";
import Link from "next/link";
import Image from "next/image";
import { Star } from "lucide-react";
import { getAverageRating } from "@/hooks/getAverageRating";

const PublicCourseCard = ({ course }) => {
  const avgRating = getAverageRating(course?.reviews);

  return (
    <Card className="relative flex flex-col overflow-hidden rounded-2xl bg-muted/30 backdrop-blur-xl shadow-lg hover:shadow-2xl hover:scale-[1.015] transition-all group">
      <div className="relative h-60 w-full">
        <Image
          src={course.thumbnail || "/images/dnb.png"}
          alt={course.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent z-10" />
        <div className="absolute top-3 left-3 right-3 z-20 flex justify-between">
          <Badge className="bg-white/80 text-accent font-bold px-3 py-1 rounded-full shadow border-0 text-xs uppercase tracking-wider">
            {course.category || "General"}
          </Badge>
        </div>
      </div>

      <CardHeader>
        <CardTitle className="text-lg font-bold line-clamp-1">
          {course.title}
        </CardTitle>
        <p className="text-sm text-muted-foreground line-clamp-2">
          {course.description}
        </p>
      </CardHeader>

      <CardContent>
        <div className="flex justify-between items-center gap-3">
          <div className="flex items-center gap-2">
            {avgRating > 0 && (
              <div className="flex items-center gap-0.5 text-yellow-500">
                <Star size={14} fill="#FFD700" stroke="#FFD700" />
                <span className="text-xs font-medium text-foreground">
                  {avgRating.toFixed(1)}
                </span>
              </div>
            )}
          </div>
          <div className="bg-gradient-to-r from-highlight to-accent text-white text-xs font-bold px-3 py-1 rounded-full shadow">
            {course.price ? `$${course.price}` : "Free"}
          </div>
        </div>
      </CardContent>

      <div className="px-5 pb-5">
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

export default PublicCourseCard;
