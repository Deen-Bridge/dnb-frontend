"use client";
import React from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const tabs = [
    { value: "courses", label: "Courses" },
    { value: "books", label: "Books" },
    { value: "followers", label: "Followers" },
 
];

const ProfileTabs = ({ selectedTab, onChange }) => {
    return (
        <div className="w-full mt-6 overflow-auto overscroll-x-auto">
            <Tabs defaultValue={selectedTab} onValueChange={onChange}>
                <TabsList className="w-full flex flex-wrap justify-start gap-2 bg-white rounded-full">
                    {tabs.map((tab) => (
                        <TabsTrigger
                            key={tab.value}
                            value={tab.value}
                            className="px-4 py-2 rounded-full text-sm font-medium data-[state=active]:bg-accent data-[state=active]:text-white"
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

