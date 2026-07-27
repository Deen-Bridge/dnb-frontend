"use client";
import React from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
const DashTabs = ({ selectedTab, onChange, tabs }) => {
    return (
        <div className="w-full mt-6 overflow-x-auto">
            <Tabs defaultValue={selectedTab} onValueChange={onChange}>
                <TabsList className="flex flex-nowrap min-w-max sm:w-full gap-2 bg-white rounded-full overflow-x-auto scrollbar-hide">
                    {tabs.map((tab) => (
                        <TabsTrigger
                            key={tab.value}
                            value={tab.value}
                            className="px-4 py-2 rounded-full text-sm font-medium data-[state=active]:bg-accent data-[state=active]:text-white font-stretch-125%"
                        >
                            {tab.label}
                        </TabsTrigger>
                    ))}
                </TabsList>
            </Tabs>
        </div>
    );
};

export default DashTabs;