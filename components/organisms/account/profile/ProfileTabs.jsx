"use client";
import React from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { poppins_500 } from "@/lib/config/font.config";

const tabs = [
  { value: "courses", label: "Courses" },
  { value: "books", label: "Books" },
  { value: "spaces", label: "Spaces" },
  { value: "followers", label: "Followers" },
  { value: "following", label: "Following" },
];

const ProfileTabs = ({ selectedTab, onChange }) => {
  return (
    <div className="mt-6 w-full overflow-x-auto">
      <Tabs defaultValue={selectedTab} onValueChange={onChange}>
        <TabsList className="flex w-full flex-wrap justify-start gap-1.5 rounded-full border border-accent/10 bg-surface-raised p-1">
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className={cn(
                poppins_500,
                "rounded-full px-4 py-2 text-sm text-ink-muted transition-colors hover:text-ink data-[state=active]:bg-accent data-[state=active]:text-white"
              )}
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  );
};

export default ProfileTabs;
