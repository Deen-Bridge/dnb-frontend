"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import {
  poppins_400,
  poppins_500,
  poppins_600,
} from "@/lib/config/font.config";
import Navbar from "@/components/molecules/ladingpage/Navbar";
import Footer from "../(landingPage)/Footer";
import NetworkErrorComp from "@/components/molecules/errors/NetworkError";
import { fetchEducators } from "@/lib/actions/educators/fetch-educators";
import { BookOpen, GraduationCap, Radio, Search, Users } from "lucide-react";

const FILTERS = [
  { value: "all", label: "Everyone" },
  { value: "courses", label: "Course creators" },
  { value: "books", label: "Authors" },
  { value: "spaces", label: "Space hosts" },
];

const initials = (name) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("") || "?";

const CardSkeleton = () => (
  <div className="animate-pulse rounded-3xl border border-accent/10 bg-surface-raised p-6">
    <div className="mb-4 flex items-center gap-4">
      <div className="size-14 rounded-full bg-accent/10" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-2/3 rounded bg-accent/10" />
        <div className="h-3 w-1/3 rounded bg-accent/10" />
      </div>
    </div>
    <div className="mb-5 h-3 w-full rounded bg-accent/10" />
    <div className="flex gap-2">
      <div className="h-7 w-20 rounded-lg bg-accent/10" />
      <div className="h-7 w-20 rounded-lg bg-accent/10" />
    </div>
  </div>
);

const EducatorCard = ({ educator }) => {
  const stats = [
    { icon: GraduationCap, n: educator.courses, one: "course", many: "courses" },
    { icon: BookOpen, n: educator.books, one: "book", many: "books" },
    { icon: Radio, n: educator.spaces, one: "space", many: "spaces" },
  ].filter((s) => s.n > 0);

  return (
    <Link
      href={`/educators/${educator._id}`}
      className="group relative overflow-hidden rounded-3xl border border-accent/10 bg-surface-raised p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-accent/30 hover:shadow-xl"
    >
      <div className="mb-4 flex items-center gap-4">
        <Avatar className="size-14 border border-accent/10">
          <AvatarImage src={educator.avatar || undefined} alt={educator.name} />
          <AvatarFallback
            className={cn(
              poppins_600,
              "bg-gradient-to-br from-secondary to-accent text-ink-inverse"
            )}
          >
            {initials(educator.name)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <h3
            className={cn(
              poppins_600,
              "truncate text-lg text-ink font-stretch-110%"
            )}
          >
            {educator.name}
          </h3>
          <p className={cn(poppins_400, "truncate text-xs text-highlight")}>
            {educator.role || "Educator"}
          </p>
        </div>
      </div>

      <p
        className={cn(
          poppins_400,
          "mb-5 line-clamp-2 min-h-[2.5rem] text-sm leading-relaxed text-ink-muted font-stretch-110%"
        )}
      >
        {educator.bio ||
          "Teaching on DeenBridge and sharing knowledge with the Ummah."}
      </p>

      <div className="flex flex-wrap items-center gap-2">
        {stats.map(({ icon: Icon, n, one, many }) => (
          <span
            key={one}
            className={cn(
              poppins_500,
              "inline-flex items-center gap-1.5 rounded-lg bg-secondary/10 px-3 py-1.5 text-xs text-accent"
            )}
          >
            <Icon className="size-3.5" />
            {n} {n === 1 ? one : many}
          </span>
        ))}
      </div>

      <span className="absolute inset-x-0 bottom-0 h-1 origin-left scale-x-0 bg-gradient-to-r from-secondary via-highlight to-accent transition-transform duration-500 group-hover:scale-x-100" />
    </Link>
  );
};

export default function EducatorsPage() {
  const [educators, setEducators] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");

  const load = async () => {
    setLoading(true);
    setError(false);
    try {
      const { educators: roster, meta: totals } = await fetchEducators();
      setEducators(roster);
      setMeta(totals);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return educators.filter((e) => {
      if (filter === "courses" && e.courses === 0) return false;
      if (filter === "books" && e.books === 0) return false;
      if (filter === "spaces" && e.spaces === 0) return false;
      if (!q) return true;
      return (
        e.name.toLowerCase().includes(q) ||
        (e.bio || "").toLowerCase().includes(q)
      );
    });
  }, [educators, query, filter]);

  return (
    <div className="min-h-screen bg-basic flex flex-col">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden bg-basic">
        <div className="absolute inset-0 bg-gradient-to-br from-secondary via-accent to-secondary opacity-30 blur-2xl z-0" />
        <div className="relative z-10 mx-auto max-w-4xl px-4 pt-36 pb-20 text-center sm:px-6">
          <span
            className={cn(
              poppins_500,
              "mb-6 inline-flex items-center gap-2 rounded-full border border-secondary/30 bg-secondary/10 px-4 py-1.5 text-sm text-ink-inverse-muted"
            )}
          >
            <Users className="size-3.5" />
            The people behind the platform
          </span>
          <h1
            className={cn(
              poppins_600,
              "mb-6 text-4xl font-bold leading-tight text-ink-inverse sm:text-6xl font-stretch-125%"
            )}
          >
            Meet our{" "}
            <span className="bg-gradient-to-r from-secondary via-highlight to-secondary bg-clip-text text-transparent">
              educators
            </span>
          </h1>
          <p
            className={cn(
              poppins_400,
              "mx-auto max-w-2xl text-lg leading-relaxed text-ink-inverse-muted font-stretch-110%"
            )}
          >
            The teachers, authors, and hosts who write the books, build the
            courses, and lead the live spaces on DeenBridge.
          </p>

          {!loading && !error && educators.length > 0 && (
            <div className="mt-10 flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
              {[
                { n: meta?.educators ?? educators.length, label: "educators" },
                { n: meta?.courses ?? 0, label: "courses" },
                { n: meta?.books ?? 0, label: "books" },
                { n: meta?.spaces ?? 0, label: "spaces" },
              ].map((s) => (
                <div key={s.label} className="text-center">
                  <div
                    className={cn(
                      poppins_600,
                      "text-2xl text-secondary font-stretch-110%"
                    )}
                  >
                    {s.n}
                  </div>
                  <div
                    className={cn(
                      poppins_400,
                      "text-xs text-ink-inverse-muted"
                    )}
                  >
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <main id="main-content" className="flex-1 bg-surface">
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20">
          {error ? (
            <NetworkErrorComp
              errMsg="We couldn't load our educators right now. Please try again."
              reset={load}
            />
          ) : (
            <>
              {/* Toolbar */}
              <div className="mb-10 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="relative w-full lg:max-w-sm">
                  <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-ink-muted" />
                  <input
                    type="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search educators by name"
                    aria-label="Search educators by name"
                    className={cn(
                      poppins_400,
                      "w-full rounded-full border border-accent/15 bg-surface-raised py-3 pl-11 pr-4 text-sm text-ink outline-none transition-colors placeholder:text-ink-muted/70 focus:border-secondary"
                    )}
                  />
                </div>

                <div className="flex flex-wrap gap-2">
                  {FILTERS.map((f) => (
                    <button
                      key={f.value}
                      type="button"
                      onClick={() => setFilter(f.value)}
                      aria-pressed={filter === f.value}
                      className={cn(
                        poppins_500,
                        "rounded-full border px-4 py-2 text-sm transition-all",
                        filter === f.value
                          ? "border-transparent bg-gradient-to-r from-secondary to-accent text-ink-inverse shadow-md"
                          : "border-accent/15 bg-surface-raised text-ink-muted hover:border-secondary hover:text-accent"
                      )}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Grid */}
              {loading ? (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {Array.from({ length: 6 }, (_, i) => (
                    <CardSkeleton key={i} />
                  ))}
                </div>
              ) : visible.length === 0 ? (
                <div className="rounded-3xl border border-accent/10 bg-surface-raised px-6 py-20 text-center">
                  <Users className="mx-auto mb-4 size-10 text-accent/40" />
                  <h2
                    className={cn(
                      poppins_600,
                      "mb-2 text-xl text-ink font-stretch-110%"
                    )}
                  >
                    {educators.length === 0
                      ? "No educators yet"
                      : "No educators match that search"}
                  </h2>
                  <p
                    className={cn(
                      poppins_400,
                      "mx-auto max-w-md text-sm text-ink-muted font-stretch-110%"
                    )}
                  >
                    {educators.length === 0
                      ? "As soon as the first course, book, or space is published, its author will appear here."
                      : "Try a different name, or switch the filter back to Everyone."}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {visible.map((e) => (
                    <EducatorCard key={e._id} educator={e} />
                  ))}
                </div>
              )}
            </>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
