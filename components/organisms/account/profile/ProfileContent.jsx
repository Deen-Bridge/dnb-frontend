import React, { useEffect, useState } from "react";
import CourseCard from "@/components/molecules/dashboard/cards/courseCard";
import CourseCardSkeleton from "@/components/atoms/skeletons/CourseCardSkeleton";
import LibraryBookCard from "@/components/molecules/dashboard/cards/libraryCard";
import SpaceCard from "@/components/molecules/dashboard/cards/spaceCard";
import UserCard from "@/components/molecules/dashboard/cards/userCard";
import { fetchUserCourses } from "@/lib/actions/courses/fetch-user-id-courses";
import { fetchUserBooks } from "@/lib/actions/library/fetch-user-id-books";
import { fetchUserSpaces } from "@/lib/actions/spaces/fetchUserSpaces";
import {
  getFollowers,
  getFollowing,
  getFollowersCount,
  getFollowingCount,
} from "@/hooks/useFollow";
import { useAuth } from "@/hooks/useAuth";

import NetworkErrorComp from "@/components/molecules/errors/NetworkError";
import {
  normalizeProfileCollection,
  profileEmptyMessage,
} from "@/lib/profile/profile-content";

const ProfileContent = ({ selectedTab, profileId }) => {
  switch (selectedTab) {
    case "courses":
      return <CoursesTab key="courses" profileId={profileId} />;
    case "books":
      return <BooksTab key="books" profileId={profileId} />;
    case "spaces":
      return <SpaceTab key="spaces" profileId={profileId} />;
    case "followers":
      return <FollowersTab key="followers" profileId={profileId} />;
    case "following":
      return <FollowingTab key="following" profileId={profileId} />;
    default:
      return (
        <div
          className="rounded-xl border border-accent/10 bg-surface-raised p-6 text-center text-sm text-ink-muted"
          role="status"
        >
          No profile content is available for this section.
        </div>
      );
  }
};

export default ProfileContent;

// Temporary placeholder components
const Placeholder = ({ title }) => (
  <div className="col-span-full rounded-xl border border-dashed border-accent/15 bg-surface-raised p-8 text-center text-ink-muted" role="status">
    <p className="text-sm">{profileEmptyMessage(title)}</p>
  </div>
);

const CoursesTab = ({ profileId }) => {
  const { loading } = useAuth();
  const [userCourses, setUserCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (loading) return;
    const getCourses = async () => {
      setIsLoading(true);
      setError(null);
      try {
        if (profileId) {
          const data = await fetchUserCourses(profileId);
          setUserCourses(normalizeProfileCollection(data, ["courses", "items"]));
        } else {
          setUserCourses([]);
          setError("User not found or not logged in");
        }
      } catch (err) {
        setUserCourses([]);
        setError("Failed to fetch courses. Please check your connection.");
      } finally {
        setIsLoading(false);
      }
    };
    getCourses();
  }, [loading, profileId]);

  if (error) {
    return (
      <NetworkErrorComp
        errMsg={error}
        reset={() => {
          setError(null);
          setIsLoading(true);
          if (profileId) {
            fetchUserCourses(profileId)
              .then((data) =>
                setUserCourses(normalizeProfileCollection(data, ["courses", "items"]))
              )
              .catch(() =>
                setError(
                  "Failed to fetch courses. Please check your connection."
                )
              )
              .finally(() => setIsLoading(false));
          }
        }}
      />
    );
  }

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 pt-5">
      {isLoading ? (
        [...Array(6)].map((_, idx) => <CourseCardSkeleton key={idx} />)
      ) : userCourses && userCourses.length > 0 ? (
        userCourses.map((course, index) => (
          <CourseCard key={course.id || course._id || index} course={course} />
        ))
      ) : (
        <Placeholder title="courses" />
      )}
    </div>
  );
};

const BooksTab = ({ profileId }) => {
  const { loading } = useAuth();
  const [userBooks, setUserBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (loading) return;
    if (!profileId) {
      setUserBooks([]);
      setIsLoading(false);
      return;
    }
    const getBooks = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await fetchUserBooks(profileId);
        setUserBooks(normalizeProfileCollection(data, ["books", "items"]));
      } catch (err) {
        setUserBooks([]);
        setError("Failed to fetch books. Please check your connection.");
      } finally {
        setIsLoading(false);
      }
    };
    getBooks();
  }, [profileId, loading]);

  if (error) {
    return (
      <NetworkErrorComp
        errMsg={error}
        reset={() => {
          setError(null);
          setIsLoading(true);
          if (profileId) {
            fetchUserBooks(profileId)
              .then((data) =>
                setUserBooks(normalizeProfileCollection(data, ["books", "items"]))
              )
              .catch(() =>
                setError("Failed to fetch books. Please check your connection.")
              )
              .finally(() => setIsLoading(false));
          }
        }}
      />
    );
  }

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 pt-5">
      {isLoading ? (
        [...Array(6)].map((_, idx) => <CourseCardSkeleton key={idx} />)
      ) : userBooks && userBooks.length > 0 ? (
          userBooks.map((book, index) => (
          <LibraryBookCard key={book.id || book._id || index} book={book} />
        ))
      ) : (
        <Placeholder title="books" />
      )}
    </div>
  );
};
const SpaceTab = ({ profileId }) => {
  const { loading } = useAuth();
  const [userSpaces, setUserSpaces] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (loading) return;
    if (!profileId) {
      setUserSpaces([]);
      setIsLoading(false);
      return;
    }
    const getSpaces = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await fetchUserSpaces(profileId);
        setUserSpaces(normalizeProfileCollection(data, ["spaces", "items"]));
      } catch (err) {
        setUserSpaces([]);
        setError("Failed to fetch spaces. Please check your connection.");
      } finally {
        setIsLoading(false);
      }
    };
    getSpaces();
  }, [loading, profileId]);

  if (error) {
    return (
      <NetworkErrorComp
        errMsg={error}
        reset={() => {
          setError(null);
          setIsLoading(true);
          if (profileId) {
            fetchUserSpaces(profileId)
              .then((data) =>
                setUserSpaces(normalizeProfileCollection(data, ["spaces", "items"]))
              )
              .catch(() =>
                setError(
                  "Failed to fetch spaces. Please check your connection."
                )
              )
              .finally(() => setIsLoading(false));
          }
        }}
      />
    );
  }

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 pt-5">
      {isLoading ? (
        [...Array(6)].map((_, idx) => <CourseCardSkeleton key={idx} />)
      ) : userSpaces && userSpaces.length > 0 ? (
        userSpaces.map((space, index) => (
          <SpaceCard key={space.id || space._id || index} space={space} />
        ))
      ) : (
        <Placeholder title="spaces" />
      )}
    </div>
  );
};
const FollowersTab = ({ profileId }) => {
  const { loading: authLoading } = useAuth();
  const [followers, setFollowers] = useState([]);
  const [followersCount, setFollowersCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {

    if (authLoading) {
      setIsLoading(true);
      return;
    }
    if (!profileId) {
      setFollowers([]);
      setFollowersCount(0);
      setIsLoading(false);
      return;
    }

    const getFollowersData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [followersData, countData] = await Promise.all([
          getFollowers(profileId),
          getFollowersCount(profileId),
        ]);


        if (followersData.success) {
          setFollowers(normalizeProfileCollection(followersData, ["followers", "items"]));
        }

        if (countData.success) {
          setFollowersCount(countData.followersCount || countData.count || 0);
        }
      } catch (err) {
        setFollowers([]);
        setFollowersCount(0);
        setError("Failed to fetch followers. Please check your connection.");
      } finally {
        setIsLoading(false);
      }
    };

    getFollowersData();
  }, [profileId, authLoading]);


  if (error) {
    return (
      <NetworkErrorComp
        errMsg={error}
        reset={() => {
          setError(null);
          setIsLoading(true);
          if (profileId) {
            Promise.all([getFollowers(profileId), getFollowersCount(profileId)])
              .then(([followersData, countData]) => {
                if (followersData.success) {
                  setFollowers(
                    normalizeProfileCollection(followersData, ["followers", "items"])
                  );
                }
                if (countData.success) {
                  setFollowersCount(
                    countData.followersCount || countData.count || 0
                  );
                }
              })
              .catch(() =>
                setError(
                  "Failed to fetch followers. Please check your connection."
                )
              )
              .finally(() => setIsLoading(false));
          }
        }}
      />
    );
  }

  return (
    <div className="space-y-4 pt-5">
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(6)].map((_, idx) => (
            <div
              key={idx}
              className="flex items-center gap-4 p-4 bg-surface/30 rounded-lg animate-pulse"
            >
              <div className="h-12 w-12 bg-surface rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-surface rounded w-1/3"></div>
                <div className="h-3 bg-surface rounded w-1/2"></div>
              </div>
              <div className="h-8 w-20 bg-surface rounded"></div>
            </div>
          ))}
        </div>
      ) : followers && followers.length > 0 ? (
        <div className="space-y-3">
          {followers.map((follower) => (
            <UserCard key={follower._id} user={follower} />
          ))}
        </div>
      ) : (
        <Placeholder title="followers" />
      )}
    </div>
  );
};

const FollowingTab = ({ profileId }) => {
  const { loading: authLoading } = useAuth();
  const [following, setFollowing] = useState([]);
  const [followingCount, setFollowingCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {

    if (authLoading) {
      setIsLoading(true);
      return;
    }
    if (!profileId) {
      setFollowing([]);
      setFollowingCount(0);
      setIsLoading(false);
      return;
    }

    const getFollowingData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [followingData, countData] = await Promise.all([
          getFollowing(profileId),
          getFollowingCount(profileId),
        ]);


        if (followingData.success) {
          setFollowing(normalizeProfileCollection(followingData, ["following", "items"]));
        }

        if (countData.success) {
          setFollowingCount(countData.followingCount || countData.count || 0);
        }
      } catch (err) {
        setFollowing([]);
        setFollowingCount(0);
        setError("Failed to fetch following. Please check your connection.");
      } finally {
        setIsLoading(false);
      }
    };

    getFollowingData();
  }, [profileId, authLoading]);


  if (error) {
    return (
      <NetworkErrorComp
        errMsg={error}
        reset={() => {
          setError(null);
          setIsLoading(true);
          if (profileId) {
            Promise.all([getFollowing(profileId), getFollowingCount(profileId)])
              .then(([followingData, countData]) => {
                if (followingData.success) {
                  setFollowing(
                    normalizeProfileCollection(followingData, ["following", "items"])
                  );
                }
                if (countData.success) {
                  setFollowingCount(
                    countData.followingCount || countData.count || 0
                  );
                }
              })
              .catch(() =>
                setError(
                  "Failed to fetch following. Please check your connection."
                )
              )
              .finally(() => setIsLoading(false));
          }
        }}
      />
    );
  }

  return (
    <div className="space-y-4 pt-5">
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(6)].map((_, idx) => (
            <div
              key={idx}
              className="flex items-center gap-4 p-4 bg-surface/30 rounded-lg animate-pulse"
            >
              <div className="h-12 w-12 bg-surface rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-surface rounded w-1/3"></div>
                <div className="h-3 bg-surface rounded w-1/2"></div>
              </div>
              <div className="h-8 w-20 bg-surface rounded"></div>
            </div>
          ))}
        </div>
      ) : following && following.length > 0 ? (
        <div className="space-y-3">
          {following.map((followedUser) => (
            <UserCard key={followedUser._id} user={followedUser} />
          ))}
        </div>
      ) : (
        <Placeholder title="following" />
      )}
    </div>
  );
};
