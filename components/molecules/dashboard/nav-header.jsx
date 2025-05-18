import React from 'react';
import { SidebarTrigger } from "@/components/ui/sidebar";
import Notybell from "@/components/atoms/dashboard/Notybell";
import Searchbox from "@/components/atoms/dashboard/Searchbox";

const searchParams = ["Courses", " Books", " Spaces", " Authors"];

const NavHeader = () => {
    return (
        <header className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur-md">
            <div className="flex h-14 items-center px-4 md:px-6 gap-4 justify-between">
                {/* Left: Sidebar + Search */}
                <div className="flex items-center gap-3 flex-1">
                    <SidebarTrigger />
                    <Searchbox
                        placeholder={searchParams}
                        className="max-w-[300px]"
                    />
                </div>

                {/* Right: Bell */}
                <div className="flex items-center space-x-4">
                    <Notybell />
                </div>
            </div>
        </header>
    );
};

export default NavHeader;
