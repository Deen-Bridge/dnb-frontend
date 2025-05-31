"use client";

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
import { VideoIcon, Clock } from "lucide-react";
import { format } from "date-fns";

const SpaceCard = ({ space }) => {
  const {
    _id,
    title,
    description,
    thumbnail,
    category,
    status,
    eventDate,
    duration,
    host,
  } = space;

  const formattedTime = format(new Date(eventDate), "PPpp");

  return (
    <Card className="relative flex flex-col overflow-hidden rounded-3xl bg-gradient-to-br from-green-50 via-white to-green-100/80 backdrop-blur-xl shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all group border-0">
      {/* Thumbnail */}
      <div className="relative h-60 w-full overflow-hidden">
        <Image
          src={thumbnail || "/images/space-placeholder.jpg"}
          alt={title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110 rounded-t-3xl border-b-4 border-accent/10 shadow-lg will-change-transform"
          priority
          style={{ maxHeight: '15rem' }} // Ensures the image never exceeds the container height
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent z-10 pointer-events-none" />
        {/* Category + Status */}
        <div className="absolute top-4 left-4 right-4 z-20 flex justify-between items-center">
          {category && (
            <Badge className="bg-white/80 text-accent font-bold px-3 py-1 rounded-full shadow border-0 text-xs uppercase tracking-wider">
              {category}
            </Badge>
          )}
          {status  && (
            <div className="px-3 py-1 bg-gradient-to-r from-green-500 to-accent text-white text-xs rounded-full font-semibold shadow-md  border-0">
              🟢 {status.toUpperCase()}
            </div>
          )}
        </div>
      </div>

      {/* New Layout: Host, Title, Description, Meta, Button */}
      <div className="flex flex-col gap-3 px-6 py-4 flex-1">

        {/* Title & Description */}
        <div className="mb-2">
          <CardTitle className="text-lg font-extrabold line-clamp-1 text-accent drop-shadow-sm mb-1">
            {title}
          </CardTitle>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {description}
          </p>
        </div>

        {/* Meta Info */}
        <div className="flex items-center justify-between gap-4 mt-2 mb-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="h-4 w-4 text-accent" />
            <span className="font-medium text-accent/90">{formattedTime}</span>
          </div>
          <div className="bg-gradient-to-r from-highlight to-accent text-white px-2 py-0.5 rounded-full font-bold shadow border-0 text-xs">
            {duration} mins
          </div>
        </div>
             {/* Host */}
        <div className="flex items-center gap-3 mb-2">
          <Avatar className="h-10 w-10">
            <AvatarImage
              src={host?.avatar || "/images/avatar-placeholder.png"}
              alt={host?.name}
            />
            <AvatarFallback className="rounded-xl">
              {host?.name?.slice(0, 2).toUpperCase() || "HN"}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-semibold text-accent leading-tight text-base">{host?.name || "Ustadh Ahmad"}</span>
            <span className="text-muted-foreground text-xs">Host</span>
          </div>
        </div>

        {/* CTA Button */}
        <Button
          wide
          round
          className="w-full bg-gradient-to-r from-highlight to-accent text-white hover:brightness-110 hover:scale-[1.01] text-base font-bold shadow-lg transition-all py-3 mt-auto"
          to={`/dashboard/spaces/${_id}`}
        >
          <VideoIcon className="h-5 w-5 mr-2" />
          View Space
        </Button>
      </div>
    </Card>
  );
};

export default SpaceCard;
