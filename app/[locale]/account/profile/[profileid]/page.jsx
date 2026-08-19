"use client";
import React, { use, useState, useEffect } from "react";
import Link from "next/link";
import ProfileHeader from "@/components/organisms/account/profile/ProfileHeader";
import ProfileUserInfo from "@/components/organisms/account/profile/ProfileUserInfo";
import ProfileTabs from "@/components/organisms/account/profile/ProfileTabs";
import ProfileContent from "@/components/organisms/account/profile/ProfileContent";
import { getUserById } from "@/lib/actions/users/getUserById";
import NotFoundComp from "@/components/molecules/errors/NotFound";
import NetworkErrorComp from "@/components/molecules/errors/NetworkError";
import Loader from "@/components/molecules/loaders/rootLoader";
import { ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { poppins_500 } from "@/lib/config/font.config";
const page = ({ params }) => {
  const { profileid } = use(params);
  const [selectedTab, setSelectedTab] = useState("courses");
  const [user, setUser] = useState(null);
  const [err, setErr] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      setLoading(true);
      setErr(false);
      const res = await getUserById(profileid);
      setUser(res?.user || null);
      console.log("Fetched user:", res?.user);
      setLoading(false);
    } catch (e) {
      console.log(e);
      setErr(true);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, [profileid]);

  if (loading) {
    return <Loader />;
  }
  if (err) {
    return (
      <NetworkErrorComp
        errMsg="Failed to load user profile. Please try again."
        reset={() => fetchUser()}
      />
    );
  }
  if (!user) {
    return (
      <NotFoundComp errMsg="User profile not found or has been removed." />
    );
  }

  return (
    <div className="min-h-full bg-surface p-3 sm:p-6">
      <div className="mx-auto max-w-5xl space-y-4">
        <div className="overflow-hidden rounded-2xl border border-accent/10 bg-surface-raised shadow-sm">
          <ProfileHeader avatar={user?.avatar} />
          <ProfileUserInfo user={user} />
          <div className="px-4 pb-5 sm:px-6">
            <Link
              href={`/educators/${profileid}`}
              className={cn(
                poppins_500,
                "inline-flex items-center gap-1.5 text-sm text-secondary transition-colors hover:text-highlight hover:underline"
              )}
            >
              <ExternalLink className="h-3.5 w-3.5" />
              View public page
            </Link>
          </div>
        </div>
        <ProfileTabs selectedTab={selectedTab} onChange={setSelectedTab} />
        <ProfileContent selectedTab={selectedTab} profileId={user?._id} />
      </div>
    </div>
  );
};
export default page;
