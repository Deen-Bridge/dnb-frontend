"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { searchQuery } from "@/hooks/useSearch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";

const typeLabels = {
  course: "Course",
  book: "Book",
  user: "User",
  space: "Space",
};

const typeLinks = {
  course: (id) => `/dashboard/courses/${id}`,
  book: (id) => `/dashboard/library/${id}`,
  user: (id) => `/account/profile/${id}`,
  space: (id) => `/dashboard/spaces/${id}`,
};

const typeImage = (item) => {
  if (item.type === "course") return item?.thumbnail || "/images/dnb.png";
  if (item.type === "book") return item?.image || "/images/book1.jpg";
  if (item.type === "user") return item?.avatar || "/images/man.jpg";
  if (item.type === "space")
    return item.thumbnail || "/images/space-placeholder.jpg";
  return "/images/dnb.png";
};

const typeDescription = (item) => {
  return (
    item.description || item.bio || item.category || "No description available."
  );
};

const typeBadge = (item) => {
  if (item.type === "course" || item.type === "book" || item.type === "space") {
    return (
      <Badge className="bg-white/80 text-accent font-bold px-3 py-1 rounded-full shadow border-0 text-xs uppercase tracking-wider">
        {item.category || typeLabels[item.type]}
      </Badge>
    );
  }
  if (item.type === "user") {
    return (
      <Badge className="bg-accent text-white font-bold px-3 py-1 rounded-full shadow border-0 text-xs uppercase tracking-wider">
        User
      </Badge>
    );
  }
  return null;
};

const Page = ({ params }) => {
  const searchparam = params?.searchparam || "";
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!searchparam) return;
    setLoading(true);
    searchQuery(searchparam)
      .then((data) => setResults(data))
      .catch(() => setResults([]))
      .finally(() => setLoading(false));
  }, [searchparam]);

  // Helper for formatting event date
  const formatDate = (date) => {
    if (!date) return null;
    return new Date(date).toLocaleString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100/80 py-8 px-2 sm:px-6">
      <h1 className="text-3xl md:text-4xl font-bold mb-8 text-left bg-gradient-to-r from-accent via-green-500 to-highlight text-transparent bg-clip-text">
        Search Results for "{searchparam}"
      </h1>
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <svg
            className="animate-spin h-10 w-10 text-accent mb-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8z"
            ></path>
          </svg>
          <span className="text-accent text-lg font-semibold">
            Searching...
          </span>
        </div>
      ) : results.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <svg width="80" height="80" fill="none" className="mb-4">
            <circle
              cx="40"
              cy="40"
              r="38"
              stroke="#22c55e"
              strokeWidth="4"
              fill="#F7F7F7"
            />
            <path
              d="M28 40h24M40 28v24"
              stroke="#22c55e"
              strokeWidth="4"
              strokeLinecap="round"
            />
          </svg>
          <span className="text-gray-500 text-lg font-semibold">
            No results found.
          </span>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {results.map((item) => (
            <Card
              key={item.id}
              className="flex flex-col overflow-hidden rounded-2xl bg-white/90 shadow-lg border-0 hover:shadow-2xl transition-all group"
            >
              {/* Image */}
              <div className="relative h-44 w-full">
                <Image
                  src={typeImage(item)}
                  alt={item.title || item.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  priority
                />
                <div className="absolute top-3 left-3 right-3 z-20 flex justify-between">
                  {typeBadge(item)}
                </div>
              </div>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-bold line-clamp-1 text-accent drop-shadow-sm mb-1">
                  {item.title ||
                    item.name ||
                    item.description?.slice(0, 30) + "..."}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Detailed rendering by type */}
                {item.type === "course" && (
                  <>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                      {item.description}
                    </p>
                    <div className="flex justify-between items-center mb-2">
                      {item.price !== undefined && (
                        <span className="bg-gradient-to-r from-highlight to-accent text-white text-xs font-bold px-3 py-1 rounded-full shadow">
                          {item.price ? `$${item.price}` : "Free"}
                        </span>
                      )}
                    </div>
                  </>
                )}
                {item.type === "book" && (
                  <>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                      {item.description}
                    </p>
                    <div className="flex flex-wrap gap-2 items-center mb-2">
                      {item.category && (
                        <span className="bg-white/80 text-accent font-bold px-2 py-1 rounded-full shadow border-0 text-xs uppercase tracking-wider">
                          {item.category}
                        </span>
                      )}
                      {item.price !== undefined && (
                        <span className="bg-gradient-to-r from-highlight to-accent text-white text-xs font-bold px-3 py-1 rounded-full shadow">
                          {item.price ? `$${item.price}` : "Free"}
                        </span>
                      )}
                      {item.author && (
                        <span className="text-xs text-muted-foreground">
                          By{" "}
                          {typeof item.author === "object"
                            ? item.author.name
                            : item.author}
                        </span>
                      )}
                    </div>
                  </>
                )}
                {item.type === "user" && (
                  <>
                    <div className="flex items-center gap-2 mb-2">
                      {item.avatar && (
                        <Image
                          src={item.avatar}
                          alt={item.name}
                          width={32}
                          height={32}
                          className="rounded-full object-cover"
                        />
                      )}
                      <span className="font-semibold text-accent">
                        {item.name}
                      </span>
                    </div>
                    {item.role && (
                      <span className="text-xs text-muted-foreground">
                        Role: {item.role}
                      </span>
                    )}
                  </>
                )}
                {item.type === "space" && (
                  <>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                      {item.description}
                    </p>
                    <div className="flex flex-wrap gap-2 items-center mb-2">
                      {item.status && (
                        <span className="bg-gradient-to-r from-green-500 to-accent text-white text-xs rounded-full font-semibold shadow-md border-0 px-2 py-1">
                          {item.status.toUpperCase()}
                        </span>
                      )}
                      {item.price !== undefined && (
                        <span className="bg-gradient-to-r from-highlight to-accent text-white text-xs font-bold px-3 py-1 rounded-full shadow">
                          {item.price ? `$${item.price}` : "Free"}
                        </span>
                      )}
                      {item.eventDate && (
                        <span className="text-xs text-muted-foreground">
                          Event: {formatDate(item.eventDate)}
                        </span>
                      )}
                      {item.duration && (
                        <span className="text-xs text-muted-foreground">
                          Duration: {item.duration} min
                        </span>
                      )}
                      {item.host && (
                        <span className="text-xs text-muted-foreground">
                          Host:{" "}
                          {typeof item.host === "object"
                            ? item.host.name
                            : item.host}
                        </span>
                      )}
                    </div>
                  </>
                )}
                {item.type === "reel" && (
                  <>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                      {item.description}
                    </p>
                  </>
                )}
                <Link
                  href={typeLinks[item.type](item.id)}
                  className="block w-full text-center px-4 py-2 rounded-full bg-accent text-white text-sm font-semibold shadow hover:bg-highlight transition-colors mt-2"
                >
                  View {typeLabels[item.type]}
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Page;
