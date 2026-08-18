"use client";
import React, { useState, useEffect } from "react";
import { Globe, Plus } from "lucide-react";
import SpaceCard from "@/components/molecules/dashboard/cards/spaceCard";
import CourseCardSkeleton from "@/components/atoms/skeletons/CourseCardSkeleton";
import { Button } from "@/components/ui/button";
import { PageShell } from "@/components/ui/page-shell";
import { PageHeader } from "@/components/ui/page-header";
import { CardGrid } from "@/components/ui/card-grid";
import { EmptyState } from "@/components/ui/empty-state";
import SpaceCreateForm from "@/components/organisms/create/space-create-form";
import Modal from "@/components/molecules/Modal";
import { getSpaces } from "@/lib/actions/spaces/get-spaces";
import useAuth from "@/hooks/useAuth";
import NetworkErrorComp from "@/components/molecules/errors/NetworkError";
import { cn } from "@/lib/utils";

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
    <PageShell>
      <PageHeader
        icon={Globe}
        title="Islamic Spaces"
        subtitle="Join live sessions, discussions, and community events"
        actions={
          <Button
            variant="outline"
            className="rounded-full"
            onClick={() => setmodalOpen(true)}
          >
            <Plus className="mr-1 h-4 w-4" />
            Create
          </Button>
        }
      />

      {/* Tab Filters */}
      <div className="flex gap-2">
        {tabnames.map((tab) => (
          <Button
            key={tab.value}
            variant={selectedTab === tab.value ? "default" : "outline"}
            className={cn(
              "rounded-full",
              selectedTab === tab.value && "bg-accent text-white hover:bg-accent/90"
            )}
            onClick={() => setSelectedTab(tab.value)}
          >
            {tab.label}
          </Button>
        ))}
      </div>

      {loading ? (
        <CardGrid>
          {[...Array(6)].map((_, idx) => (
            <CourseCardSkeleton key={idx} />
          ))}
        </CardGrid>
      ) : filteredSpaces.length === 0 ? (
        <EmptyState
          icon={Globe}
          title="No Spaces Found"
          description={
            selectedTab === "all"
              ? "No spaces available at the moment."
              : `No ${selectedTab} spaces at the moment.`
          }
          action={
            <Button
              variant="outline"
              className="rounded-full"
              onClick={() => setmodalOpen(true)}
            >
              Create Space
            </Button>
          }
        />
      ) : (
        <CardGrid>
          {filteredSpaces.map((space, index) => (
            <SpaceCard key={space._id || index} space={space} />
          ))}
        </CardGrid>
      )}

      <Modal
        isOpen={modalOpen}
        onClose={() => setmodalOpen(false)}
        title="Create Space"
      >
        <SpaceCreateForm onSpaceCreated={handleSpaceCreated} />
      </Modal>
    </PageShell>
  );
};

export default Page;
