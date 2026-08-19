"use client";
import React, { use, useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { getUserById } from "@/lib/actions/users/getUserById";
import { fetchUserCourses } from "@/lib/actions/courses/fetch-user-id-courses";
import { fetchUserBooks } from "@/lib/actions/library/fetch-user-id-books";
import { fetchUserSpaces } from "@/lib/actions/spaces/fetchUserSpaces";
import {
  getFollowersCount,
  checkIfFollowing,
  followUser,
  unfollowUser,
} from "@/hooks/useFollow";
import { getAverageRating } from "@/hooks/getAverageRating";
import EducatorProfileHeader from "@/components/organisms/educators/EducatorProfileHeader";
import PublicCourseCard from "@/components/molecules/dashboard/cards/educators/PublicCourseCard";
import PublicBookCard from "@/components/molecules/dashboard/cards/educators/PublicBookCard";
import PublicSpaceCard from "@/components/molecules/dashboard/cards/educators/PublicSpaceCard";
import NotFoundComp from "@/components/molecules/errors/NotFound";
import NetworkErrorComp from "@/components/molecules/errors/NetworkError";
import Loader from "@/components/molecules/loaders/rootLoader";
import Footer from "@/components/molecules/ladingpage/Footer";
import Navbar from "@/components/molecules/ladingpage/Navbar";
import { Copy, Share2, Users, BookOpen, GraduationCap, Star } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  poppins_400,
  poppins_500,
  poppins_600,
} from "@/lib/config/font.config";
import Button from "@/components/atoms/form/Button";

export default function PublicEducatorPage({ params }) {
  const { profileid } = use(params);
  const { user: currentUser } = useAuth();
  const router = useRouter();

  const [educator, setEducator] = useState(null);
  const [courses, setCourses] = useState([]);
  const [books, setBooks] = useState([]);
  const [spaces, setSpaces] = useState([]);
  const [followersCount, setFollowersCount] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [activeTab, setActiveTab] = useState("courses");

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(false);
      try {
        const res = await getUserById(profileid);
        const u = res?.user || null;
        if (!u) {
          setError(true);
          setLoading(false);
          return;
        }
        setEducator(u);

        const [coursesData, booksData, spacesData, followersRes] =
          await Promise.allSettled([
            fetchUserCourses(profileid),
            fetchUserBooks(profileid),
            fetchUserSpaces(profileid),
            getFollowersCount(profileid),
          ]);

        if (coursesData.status === "fulfilled") {
          setCourses(Array.isArray(coursesData.value) ? coursesData.value : []);
        }
        if (booksData.status === "fulfilled") {
          setBooks(Array.isArray(booksData.value) ? booksData.value : []);
        }
        if (spacesData.status === "fulfilled") {
          const sd = spacesData.value;
          setSpaces(sd?.spaces || (Array.isArray(sd) ? sd : []));
        }
        if (followersRes.status === "fulfilled" && followersRes.value?.success) {
          setFollowersCount(
            followersRes.value.followersCount || followersRes.value.count || 0
          );
        }

        if (currentUser?._id && currentUser._id !== profileid) {
          const followRes = await checkIfFollowing(profileid);
          if (followRes?.success) {
            setIsFollowing(followRes.isFollowing);
          }
        }
      } catch (e) {
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [profileid, currentUser?._id]);

  const handleFollowToggle = async () => {
    if (!currentUser?._id) {
      router.push(`/login?next=${encodeURIComponent(`/educators/${profileid}`)}`);
      return;
    }
    setFollowLoading(true);
    try {
      const result = isFollowing
        ? await unfollowUser(profileid)
        : await followUser(profileid);
      if (result.success) {
        setIsFollowing(!isFollowing);
        setFollowersCount((c) => (isFollowing ? c - 1 : c + 1));
      } else {
        toast.error(result.message || "Failed to update follow status");
      }
    } catch {
      toast.error("Failed to update follow status");
    } finally {
      setFollowLoading(false);
    }
  };

  const handleShare = async () => {
    const url = `${typeof window !== "undefined" ? window.location.origin : ""}/educators/${profileid}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: educator?.name || "Educator Profile",
          text: educator?.bio || `Check out ${educator?.name} on DeenBridge`,
          url,
        });
      } catch {}
    } else {
      try {
        await navigator.clipboard.writeText(url);
        toast.success("Link copied to clipboard!");
      } catch {
        toast.error("Failed to copy link");
      }
    }
  };

  if (loading) return <Loader />;

  if (error || !educator) {
    return (
      <div className="min-h-screen bg-basic flex flex-col">
        <Navbar />
        <main id="main-content" className="flex-1 flex items-center justify-center">
          <NotFoundComp errMsg="Educator profile not found or is private." />
        </main>
        <Footer />
      </div>
    );
  }

  const hasContent =
    courses.length > 0 || books.length > 0 || spaces.length > 0;

  if (!hasContent) {
    return (
      <div className="min-h-screen bg-basic flex flex-col">
        <Navbar />
        <main id="main-content" className="flex-1">
          <EducatorProfileHeader
            educator={educator}
            followersCount={followersCount}
            isFollowing={isFollowing}
            followLoading={followLoading}
            onFollowToggle={handleFollowToggle}
            onShare={handleShare}
            isOwnProfile={currentUser?._id === profileid}
          />
          <div className="mx-auto max-w-4xl px-4 py-20 text-center">
            <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
              <BookOpen className="h-7 w-7 text-secondary" />
            </div>
            <h3 className={cn(poppins_600, "mb-2 text-lg text-ink-inverse")}>
              No public content yet
            </h3>
            <p className={cn(poppins_400, "text-ink-inverse-muted")}>
              This educator hasn&apos;t published any courses, books, or spaces
              yet.
            </p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const tabs = [
    { key: "courses", label: "Courses", count: courses.length, icon: GraduationCap },
    { key: "books", label: "Books", count: books.length, icon: BookOpen },
    { key: "spaces", label: "Spaces", count: spaces.length, icon: Users },
  ].filter((t) => t.count > 0);

  const allRatings = [
    ...courses.flatMap((c) => c.reviews || []),
    ...books.flatMap((b) => b.reviews || []),
  ];
  const avgRating = getAverageRating(allRatings);

  return (
    <div className="min-h-screen bg-basic flex flex-col">
      <Navbar />
      <main id="main-content" className="flex-1">
        <EducatorProfileHeader
          educator={educator}
          followersCount={followersCount}
          avgRating={avgRating}
          isFollowing={isFollowing}
          followLoading={followLoading}
          onFollowToggle={handleFollowToggle}
          onShare={handleShare}
          isOwnProfile={currentUser?._id === profileid}
          stats={{
            courses: courses.length,
            books: books.length,
            spaces: spaces.length,
          }}
        />

        {tabs.length > 1 && (
          <div className="mx-auto mt-8 max-w-6xl px-4 sm:px-6">
            <div className="inline-flex flex-wrap gap-1 rounded-full border border-white/10 bg-white/5 p-1 backdrop-blur">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={cn(
                    poppins_500,
                    "flex items-center gap-2 rounded-full px-4 py-2 text-sm transition-colors",
                    activeTab === tab.key
                      ? "bg-white text-basic"
                      : "text-ink-inverse-muted hover:text-ink-inverse"
                  )}
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                  <span
                    className={cn(
                      "rounded-full px-1.5 py-0.5 text-xs",
                      activeTab === tab.key
                        ? "bg-basic/10 text-basic"
                        : "bg-white/10 text-ink-inverse-muted"
                    )}
                  >
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          {activeTab === "courses" && courses.length > 0 && (
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {courses.map((course) => (
                <PublicCourseCard key={course._id} course={course} />
              ))}
            </div>
          )}
          {activeTab === "books" && books.length > 0 && (
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {books.map((book) => (
                <PublicBookCard key={book._id} book={book} />
              ))}
            </div>
          )}
          {activeTab === "spaces" && spaces.length > 0 && (
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {spaces.map((space) => (
                <PublicSpaceCard key={space._id} space={space} />
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
