"use client";
import React, { useState } from "react";
import ProfileHeader from "@/components/organisms/account/profile/ProfileHeader";
import ProfileUserInfo from "@/components/organisms/account/profile/ProfileUserInfo";
import ProfileTabs from "@/components/organisms/account/profile/ProfileTabs";
import ProfileContent from "@/components/organisms/account/profile/ProfileContent";
import { useAuth } from "@/hooks/useAuth";


const page = () => {
  const { user } = useAuth();
  const [selectedTab, setSelectedTab] = useState("courses");

  return (
    <>

      <div className="min-h-screen bg-muted p-4">
        <ProfileHeader avatar={user?.avatar} />
        <ProfileUserInfo user={user} />
        <ProfileTabs selectedTab={selectedTab} onChange={setSelectedTab} />
        <ProfileContent selectedTab={selectedTab} />
      </div>

    </>
  )
};
export default page;


