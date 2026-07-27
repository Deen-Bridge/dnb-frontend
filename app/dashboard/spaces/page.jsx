"use client";
import React, { useState, useEffect } from "react";
import { Globe, Plus } from "lucide-react";
import SpaceCard from "@/components/molecules/dashboard/cards/spaceCard";
import CourseCardSkeleton from "@/components/atoms/skeletons/CourseCardSkeleton";
import Button from "@/components/atoms/form/Button";
import { Card, CardContent } from "@/components/ui/card";
import SpaceCreateForm from "@/components/organisms/create/space-create-form";
import Modal from "@/components/molecules/Modal";
import { getSpaces } from "@/lib/actions/spaces/get-spaces";
import useAuth from "@/hooks/useAuth";
import NetworkErrorComp from "@/components/molecules/errors/NetworkError";

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
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Globe className="h-6 w-6 text-accent" />
            Islamic Spaces
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Join live sessions, discussions, and community events
          </p>
        </div>
        <Button round outlined onClick={() => setmodalOpen(true)}>
          <Plus className="h-4 w-4 mr-1" />
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
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, idx) => (
            <CourseCardSkeleton key={idx} />
          ))}
        </div>
      ) : filteredSpaces.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center space-y-4">
            <Globe className="h-12 w-12 text-muted-foreground" />
            <div>
              <h3 className="font-semibold text-lg">No Spaces Found</h3>
              <p className="text-muted-foreground text-sm mt-1 max-w-md">
                {selectedTab === "all"
                  ? "No spaces available at the moment."
                  : `No ${selectedTab} spaces at the moment.`}
              </p>
            </div>
            <Button round outlined onClick={() => setmodalOpen(true)}>
              Create Space
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
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
