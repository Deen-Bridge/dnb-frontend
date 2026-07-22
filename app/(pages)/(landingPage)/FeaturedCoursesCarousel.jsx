"use client";

import * as React from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

/**
 * Thin client-side wrapper around the existing embla-based Carousel primitive.
 * Server-rendered children are passed through; carousel APIs run only on the client.
 */
export default function FeaturedCoursesCarousel({ children }) {
  // Normalise to an array; trust upstream keys so React never falls back to
  // an index key (which would mask missing-key bugs in the consumers).
  const slides = React.Children.toArray(children);

  if (slides.length === 0) return null;

  return (
    <Carousel
      opts={{
        align: "start",
        skipSnaps: false,
      }}
      className="w-full px-2 sm:px-4"
    >
      <CarouselContent className="-ml-2 sm:-ml-4">
        {slides.map((child, idx) => (
          <CarouselItem
            key={child.key ?? `featured-course-${idx}`}
            className="pl-2 sm:pl-4 md:basis-1/2 lg:basis-1/3"
          >
            <div className="h-full pb-2">{child}</div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious
        className="hidden sm:flex -left-2 sm:-left-6"
        aria-label="Previous featured course"
      />
      <CarouselNext
        className="hidden sm:flex -right-2 sm:-right-6"
        aria-label="Next featured course"
      />
    </Carousel>
  );
}
