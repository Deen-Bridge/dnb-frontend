"use client";
import React, { useState, useEffect } from "react";
import DashTabs from "@/components/atoms/dashboard/DashTabs";
import { cn } from "@/lib/utils";
import SpaceCard from "@/components/molecules/dashboard/cards/spaceCard";
import CourseCardSkeleton from "@/components/atoms/skeletons/CourseCardSkeleton";
import { poppins_700 } from "@/lib/config/font.config";
import Button from "@/components/atoms/form/Button";
import SpaceCreateForm from "@/components/organisms/create/space-create-form";
import Modal from "@/components/molecules/Modal";
import { getSpaces } from "@/lib/actions/spaces/get-spaces"; // <-- import your fetch function
import useAuth from "@/hooks/useAuth"; // <-- import useAuth hook


const tabnames = [
  { value: "all", label: "All" },
  { value: "upcoming", label: "Upcoming" },
  { value: "live", label: "live" },
  { value: "wishlist", label: "Wishlist" },
];


const Page = () => {
  const [spaces, setSpaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setmodalOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState("all");
  const {user } = useAuth();


  useEffect(() => {
    async function fetchSpaces() {
      setLoading(true);
      const data = await getSpaces();
      setSpaces(data);
      setLoading(false);
    }
    fetchSpaces();
  }, []);

  const handleClick = () => {
    setmodalOpen(!modalOpen);
  };

  const handleSpaceCreated = () => {
    setmodalOpen(false);
    // Optionally, refetch spaces after creating a new one
    // fetchSpaces(); // You can lift fetchSpaces to the component scope if you want this
  };

  return (
    <>
      <div className="bg-muted min-h-screen  px-4">
        <div className="flex flex-1 flex-col gap-4 mt-10 p-4 pt-0">
          <div className="mb-8 flex flex-row justify-between items-center gap-4">
            <div>
              <span className={cn("text-highlight text-xl ", poppins_700)}>Explore Our Islamic Spaces</span>
            </div>
            <div>
              <Button outlined round wide className="text-sm text-nowrap" onClick={handleClick}>Create Space</Button>
            </div>
          </div>

          <DashTabs selectedTab={selectedTab} onChange={setSelectedTab} tabs={tabnames} />

          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 mt-4">
            {loading ? (
              [...Array(6)].map((_, idx) => <CourseCardSkeleton key={idx} />)
            ) : (
              (() => {
                const filteredSpaces = spaces.filter(
                  (space) => selectedTab === "all" ? true : space?.status === selectedTab
                );
                if (filteredSpaces.length === 0) {
                  return (
                    <div className="col-span-full text-center text-muted-foreground py-8">
                      No {selectedTab === "all" ? "spaces" : selectedTab + " spaces"} at the moment.
                    </div>
                  );
                }
                return filteredSpaces.map((space, index) => (
                  <SpaceCard key={space._id || index} space={space} />
                ));
              })()
            )}
          </div>
        </div>
      </div>
      <Modal
        isOpen={modalOpen}
        onClose={() => setmodalOpen(false)}
        title="Create Space"
      >
        <SpaceCreateForm onSpaceCreated={handleSpaceCreated} />
      </Modal>
    </>
  );
};

export default Page;







