"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { searchQuery } from "@/hooks/useSearch";
import Image from "next/image";
import { cn } from "@/lib/utils";
import {
  poppins_400,
  poppins_500,
  poppins_600,
} from "@/lib/config/font.config";

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
      <span
        className={cn(
          poppins_600,
          "rounded-full border border-accent/15 bg-surface-raised/90 px-3 py-1 text-xs uppercase tracking-wider text-ink shadow-sm"
        )}
      >
        {item.category || typeLabels[item.type]}
      </span>
    );
  }
  if (item.type === "user") {
    return (
      <span
        className={cn(
          poppins_600,
          "rounded-full bg-accent-card px-3 py-1 text-xs uppercase tracking-wider text-white shadow-sm"
        )}
      >
        User
      </span>
    );
  }
  return null;
};

const Page = ({ params }) => {
  const { searchparam = "" } = React.use(params);
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
    <div className="min-h-screen bg-surface px-2 py-8 sm:px-6">
      <h1
        className={cn(
          poppins_600,
          "mb-8 bg-gradient-to-r from-secondary via-highlight to-accent bg-clip-text text-left text-3xl text-transparent md:text-4xl"
        )}
      >
        Search Results for "{searchparam}"
      </h1>
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <svg
            className="mb-4 h-10 w-10 animate-spin text-secondary"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
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
          <span className={cn(poppins_500, "text-lg text-ink")}>
            Searching...
          </span>
        </div>
      ) : results.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="mb-4 flex size-20 items-center justify-center rounded-2xl border border-accent/5 bg-gradient-to-br from-secondary/15 to-highlight/10">
            <svg width="40" height="40" fill="none" className="text-accent" aria-hidden="true">
              <path
                d="M8 20h24M20 8v24"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <span className={cn(poppins_500, "text-lg text-ink-muted")}>
            No results found.
          </span>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((item) => (
            <div
              key={item.id}
              className="group flex flex-col overflow-hidden rounded-2xl border border-accent/10 bg-surface-raised shadow-sm transition-all hover:-translate-y-0.5 hover:border-secondary/30 hover:shadow-md"
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
                <div className="absolute left-3 right-3 top-3 z-20 flex justify-between">
                  {typeBadge(item)}
                </div>
              </div>
              <div className="px-6 pb-2 pt-4">
                <h3
                  className={cn(
                    poppins_600,
                    "mb-1 line-clamp-1 text-lg text-ink"
                  )}
                >
                  {item.title ||
                    item.name ||
                    item.description?.slice(0, 30) + "..."}
                </h3>
              </div>
              <div className="px-6 pb-6">
                {/* Detailed rendering by type */}
                {item.type === "course" && (
                  <>
                    <p
                      className={cn(
                        poppins_400,
                        "mb-2 line-clamp-2 text-sm text-ink-muted"
                      )}
                    >
                      {item.description}
                    </p>
                    <div className="mb-2 flex items-center justify-between">
                      {item.price !== undefined && (
                        <span
                          className={cn(
                            poppins_600,
                            "rounded-full bg-gradient-to-r from-highlight to-accent px-3 py-1 text-xs text-white shadow-sm"
                          )}
                        >
                          {item.price ? `$${item.price}` : "Free"}
                        </span>
                      )}
                    </div>
                  </>
                )}
                {item.type === "book" && (
                  <>
                    <p
                      className={cn(
                        poppins_400,
                        "mb-2 line-clamp-2 text-sm text-ink-muted"
                      )}
                    >
                      {item.description}
                    </p>
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      {item.category && (
                        <span
                          className={cn(
                            poppins_600,
                            "rounded-full border border-accent/15 bg-surface px-2 py-1 text-xs uppercase tracking-wider text-ink"
                          )}
                        >
                          {item.category}
                        </span>
                      )}
                      {item.price !== undefined && (
                        <span
                          className={cn(
                            poppins_600,
                            "rounded-full bg-gradient-to-r from-highlight to-accent px-3 py-1 text-xs text-white shadow-sm"
                          )}
                        >
                          {item.price ? `$${item.price}` : "Free"}
                        </span>
                      )}
                      {item.author && (
                        <span
                          className={cn(poppins_400, "text-xs text-ink-muted")}
                        >
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
                    <div className="mb-2 flex items-center gap-2">
                      {item.avatar && (
                        <Image
                          src={item.avatar}
                          alt=""
                          width={32}
                          height={32}
                          className="rounded-full object-cover"
                        />
                      )}
                      <span className={cn(poppins_600, "text-ink")}>
                        {item.name}
                      </span>
                    </div>
                    {item.role && (
                      <span
                        className={cn(poppins_400, "text-xs text-ink-muted")}
                      >
                        Role: {item.role}
                      </span>
                    )}
                  </>
                )}
                {item.type === "space" && (
                  <>
                    <p
                      className={cn(
                        poppins_400,
                        "mb-2 line-clamp-2 text-sm text-ink-muted"
                      )}
                    >
                      {item.description}
                    </p>
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      {item.status && (
                        <span
                          className={cn(
                            poppins_600,
                            "rounded-full bg-gradient-to-r from-secondary to-accent px-2 py-1 text-xs text-white shadow-sm"
                          )}
                        >
                          {item.status.toUpperCase()}
                        </span>
                      )}
                      {item.price !== undefined && (
                        <span
                          className={cn(
                            poppins_600,
                            "rounded-full bg-gradient-to-r from-highlight to-accent px-3 py-1 text-xs text-white shadow-sm"
                          )}
                        >
                          {item.price ? `$${item.price}` : "Free"}
                        </span>
                      )}
                      {item.eventDate && (
                        <span
                          className={cn(poppins_400, "text-xs text-ink-muted")}
                        >
                          Event: {formatDate(item.eventDate)}
                        </span>
                      )}
                      {item.duration && (
                        <span
                          className={cn(poppins_400, "text-xs text-ink-muted")}
                        >
                          Duration: {item.duration} min
                        </span>
                      )}
                      {item.host && (
                        <span
                          className={cn(poppins_400, "text-xs text-ink-muted")}
                        >
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
                    <p
                      className={cn(
                        poppins_400,
                        "mb-2 line-clamp-2 text-sm text-ink-muted"
                      )}
                    >
                      {item.description}
                    </p>
                  </>
                )}
                <Link
                  href={typeLinks[item.type](item.id)}
                  className={cn(
                    poppins_500,
                    "mt-2 block w-full rounded-full bg-accent px-4 py-2 text-center text-sm text-white shadow-sm transition-colors hover:bg-highlight"
                  )}
                >
                  View {typeLabels[item.type]}
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Page;
