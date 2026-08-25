"use client";
import React, { useState, useEffect } from "react";
import { Globe, Plus, Flag } from "lucide-react";
import SpaceCard from "@/components/molecules/dashboard/cards/spaceCard";
import CourseCardSkeleton from "@/components/atoms/skeletons/CourseCardSkeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageShell } from "@/components/ui/page-shell";
import { PageHeader } from "@/components/ui/page-header";
import { CardGrid } from "@/components/ui/card-grid";
import { EmptyState } from "@/components/ui/empty-state";
import SpaceCreateForm from "@/components/organisms/create/space-create-form";
import Modal from "@/components/molecules/Modal";
import { getSpaces } from "@/lib/actions/spaces/get-spaces";
import useAuth from "@/hooks/useAuth";
import { useCan } from "@/hooks/useCan";
import { CAPABILITIES } from "@/lib/auth/roles";
import NetworkErrorComp from "@/components/molecules/errors/NetworkError";
import useFlaggedContent from "@/hooks/useFlaggedContent";
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
  const { can } = useCan();
  const canCreateSpace = can(CAPABILITIES.SPACE_CREATE);

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

  const tabFiltered = spaces.filter((space) =>
    selectedTab === "all" ? true : space?.status === selectedTab
  );

  const { flaggedCount, showFlaggedOnly, toggleFlaggedOnly, filteredItems } =
    useFlaggedContent(tabFiltered);

  const filteredSpaces = filteredItems;

  return (
    <PageShell>
      <PageHeader
        icon={Globe}
        title="Islamic Spaces"
        subtitle="Join live sessions, discussions, and community events"
        actions={
          canCreateSpace && (
            <Button
              variant="outline"
              className="rounded-full"
              onClick={() => setmodalOpen(true)}
            >
              <Plus className="mr-1 h-4 w-4" />
              Create
            </Button>
          )
        }
      />

      {/* Tab Filters */}
      <div className="flex gap-2 flex-wrap">
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
        {flaggedCount > 0 && (
          <Button
            variant={showFlaggedOnly ? "default" : "outline"}
            className={cn(
              "rounded-full gap-1.5",
              showFlaggedOnly
                ? "bg-red-500 text-white hover:bg-red-600"
                : "border-red-200 text-red-600 hover:bg-red-50"
            )}
            onClick={toggleFlaggedOnly}
          >
            <Flag className="h-3.5 w-3.5" />
            Flagged
            <Badge
              variant="secondary"
              className={cn(
                "ml-1 text-xs px-1.5 py-0",
                showFlaggedOnly
                  ? "bg-white/20 text-white"
                  : "bg-red-100 text-red-600"
              )}
            >
              {flaggedCount}
            </Badge>
          </Button>
        )}
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
            canCreateSpace && (
              <Button
                variant="outline"
                className="rounded-full"
                onClick={() => setmodalOpen(true)}
              >
                Create Space
              </Button>
            )
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
