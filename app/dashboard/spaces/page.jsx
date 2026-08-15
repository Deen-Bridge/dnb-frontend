"use client";
import React, { useState, useEffect } from "react";
import { Globe, Plus } from "lucide-react";
import SpaceCard from "@/components/molecules/dashboard/cards/spaceCard";
import CourseCardSkeleton from "@/components/atoms/skeletons/CourseCardSkeleton";
import Button from "@/components/atoms/form/Button";
import SpaceCreateForm from "@/components/organisms/create/space-create-form";
import Modal from "@/components/molecules/Modal";
import { getSpaces } from "@/lib/actions/spaces/get-spaces";
import useAuth from "@/hooks/useAuth";
import NetworkErrorComp from "@/components/molecules/errors/NetworkError";
import { cn } from "@/lib/utils";
import {
  poppins_400,
  poppins_500,
  poppins_600,
} from "@/lib/config/font.config";

const tabnames = [
  { value: "all", label: "All" },
  { value: "upcoming", label: "Upcoming" },
  { value: "live", label: "Live" },
  { value: "wishlist", label: "Wishlist" },
];

const Page = () => {
  const [spaces, setSpaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [modalOpen, setmodalOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState("all");
  const { user } = useAuth();

  const fetchSpaces = async () => {
    setLoading(true);
    setError(false);
    try {
      const data = await getSpaces();
      setSpaces(data);
    } catch (err) {
      setError(true);
      setSpaces([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSpaces();
  }, []);

  const handleSpaceCreated = () => {
    setmodalOpen(false);
    fetchSpaces();
  };

  if (error) {
    return (
      <NetworkErrorComp
        errMsg="Failed to load spaces. Please try again."
        reset={() => fetchSpaces()}
      />
    );
  }

  const filteredSpaces = spaces.filter((space) =>
    selectedTab === "all" ? true : space?.status === selectedTab
  );

  return (
    <div className="space-y-6 bg-surface p-4 sm:p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-2xl border border-accent/5 bg-gradient-to-br from-secondary/20 to-highlight/10">
            <Globe className="h-5 w-5 text-accent" />
          </div>
          <div>
            <h1
              className={cn(
                poppins_600,
                "bg-gradient-to-r from-secondary via-highlight to-accent bg-clip-text text-2xl text-transparent"
              )}
            >
              Islamic Spaces
            </h1>
            <p className={cn(poppins_400, "mt-1 text-sm text-ink-muted")}>
              Join live sessions, discussions, and community events
            </p>
          </div>
        </div>
        <Button round outlined onClick={() => setmodalOpen(true)}>
          <Plus className="mr-1 h-4 w-4" />
          Create
        </Button>
      </div>

      {/* Tab Filters */}
      <div className="flex gap-2">
        {tabnames.map((tab) => (
          <Button
            key={tab.value}
            round
            outlined={selectedTab !== tab.value}
            className={selectedTab === tab.value ? "bg-accent text-white" : ""}
            onClick={() => setSelectedTab(tab.value)}
          >
            {tab.label}
          </Button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, idx) => (
            <CourseCardSkeleton key={idx} />
          ))}
        </div>
      ) : filteredSpaces.length === 0 ? (
        <div className="rounded-2xl border border-accent/10 bg-surface-raised shadow-sm">
          <div className="flex flex-col items-center justify-center space-y-4 py-16 text-center">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-secondary/15 to-highlight/10">
              <Globe className="h-7 w-7 text-accent" />
            </div>
            <div>
              <h3 className={cn(poppins_600, "text-lg text-ink")}>
                No Spaces Found
              </h3>
              <p className={cn(poppins_400, "mt-1 max-w-md text-sm text-ink-muted")}>
                {selectedTab === "all"
                  ? "No spaces available at the moment."
                  : `No ${selectedTab} spaces at the moment.`}
              </p>
            </div>
            <Button round outlined onClick={() => setmodalOpen(true)}>
              Create Space
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredSpaces.map((space, index) => (
            <SpaceCard key={space._id || index} space={space} />
          ))}
        </div>
      )}

      <Modal
        isOpen={modalOpen}
        onClose={() => setmodalOpen(false)}
        title="Create Space"
      >
        <SpaceCreateForm onSpaceCreated={handleSpaceCreated} />
      </Modal>
    </div>
  );
};

export default Page;
