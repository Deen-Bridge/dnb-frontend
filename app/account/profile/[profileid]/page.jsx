"use client";
import React, { useState, useEffect } from "react";
import ProfileHeader from "@/components/organisms/account/profile/ProfileHeader";
import ProfileUserInfo from "@/components/organisms/account/profile/ProfileUserInfo";
import ProfileTabs from "@/components/organisms/account/profile/ProfileTabs";
import ProfileContent from "@/components/organisms/account/profile/ProfileContent";
import {getUserById} from "@/lib/actions/users/getUserById"
import NotFoundComp from "@/components/molecules/errors/NotFound";

const page = ({ params }) => {
  const { profileid } =  React.use(params);
  const [selectedTab, setSelectedTab] = useState("courses");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      const res = await getUserById(profileid);
      setUser(res?.user || null);
      setLoading(false);
    };
    fetchUser();
  }, [profileid]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-lg">Loading user...</div>;
  }
  if (!user) {
       return <NotFoundComp errMsg="User profile not found or has been removed." />
  }

  return (
    <>
      <div className="min-h-screen bg-muted p-4">
        <ProfileHeader avatar={user?.avatar} />
        <ProfileUserInfo user={user} />
        <ProfileTabs selectedTab={selectedTab} onChange={setSelectedTab} />
        <ProfileContent selectedTab={selectedTab} profileId={profileid} />
      </div>
    </>
  );
};
export default page;