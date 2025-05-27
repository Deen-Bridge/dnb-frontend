"use client";
import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import SpaceCard from "@/components/molecules/dashboard/cards/spaceCard";
import CourseCardSkeleton from "@/components/atoms/skeletons/CourseCardSkeleton";
import { poppins_700 } from "@/lib/config/font.config";
import Button from "@/components/atoms/form/Button";
import SpaceCreateForm from "@/components/organisms/create/space-create-form";
import Modal from "@/components/molecules/Modal";
import { getSpaces } from "@/lib/actions/spaces/get-spaces"; // <-- import your fetch function

const Page = () => {
  const [spaces, setSpaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setmodalOpen] = useState(false);

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
      <div className="bg-muted min-h-screen pt-10 px-4">
        <h1 className="text-2xl sm:text-3xl font-accent font-bold text-center mb-6">
          Interactive Learning Spaces
        </h1>

        <div className="flex flex-1 flex-col gap-4 mt-10 p-4 pt-0">
          <div className="mb-8 flex flex-row justify-between items-center gap-4">
            <div>
              <span className={cn("text-highlight text-xl ", poppins_700)}>Explore Our Islamic Spaces</span>
            </div>
            <div>
              <Button outlined round wide className="text-sm text-nowrap" onClick={handleClick}>Create Space</Button>
            </div>
          </div>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 ">
            {loading ? (
              [...Array(6)].map((_, idx) => <CourseCardSkeleton key={idx} />)
            ) : (
              spaces.map((space, index) => (
                <SpaceCard key={space._id || index} space={space} />
              ))
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