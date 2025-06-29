"use client";
import React, { use, useState, useEffect } from "react";
import ProfileHeader from "@/components/organisms/account/profile/ProfileHeader";
import ProfileUserInfo from "@/components/organisms/account/profile/ProfileUserInfo";
import ProfileTabs from "@/components/organisms/account/profile/ProfileTabs";
import ProfileContent from "@/components/organisms/account/profile/ProfileContent";
import { getUserById } from "@/lib/actions/users/getUserById"
import NotFoundComp from "@/components/molecules/errors/NotFound";
import NetworkErrorComp from "@/components/molecules/errors/NetworkError";
import Loader from "@/components/molecules/loaders/rootLoader";
const page = ({ params }) => {
  const { profileid } = use(params);
  const [selectedTab, setSelectedTab] = useState("courses");
  const [user, setUser] = useState(null);
  const [err, setErr] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const fetchUser = async () => {
        setLoading(true);
        const res = await getUserById(profileid);
        setUser(res?.user || null);
        console.log("Fetched user:", res?.user);
        setLoading(false);
      }
      fetchUser();
    } catch (e) {
      console.log(e)
      setErr(!err)
    };
  }, [profileid]);

  if (loading) {
    return <Loader/>;
  }
  if (err) {
    return <NetworkErrorComp />
  }
  if (!user) {
    return <NotFoundComp errMsg="User profile not found or has been removed." />
  }


  return (
    <>
      <div className="min-h-screen bg-muted p-2 sm:p-4">
        <ProfileHeader avatar={user?.avatar} />
        <ProfileUserInfo user={user} />
        <ProfileTabs selectedTab={selectedTab} onChange={setSelectedTab} />
        <ProfileContent selectedTab={selectedTab} profileId={user?._id} />
      </div>
    </>
  );
};
export default page;