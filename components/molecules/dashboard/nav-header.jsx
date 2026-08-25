"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { SidebarTrigger } from "@/components/ui/sidebar";
import Notybell from "@/components/molecules/dashboard/Notybell";
import Searchbox from "@/components/atoms/dashboard/Searchbox";
import ThemeToggle from "@/components/ui/theme-toggle";
import LocaleSwitcher from "@/components/molecules/i18n/LocaleSwitcher";

const NavHeader = () => {
  const t = useTranslations("dashboard.nav");
  // Rotating search placeholders, localised.
  const searchParams = [
    t("searchParams.courses"),
    t("searchParams.books"),
    t("searchParams.spaces"),
    t("searchParams.authors"),
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur-md">
      <div className="flex h-14 items-center px-4 md:px-6 gap-4 justify-between">
        <div className="flex items-center gap-3 flex-1">
          <SidebarTrigger />
          <Searchbox placeholder={searchParams} className="max-w-[300px]" />
        </div>

        <div className="flex items-center space-x-4">
          <LocaleSwitcher />
          <ThemeToggle />
          <Notybell />
        </div>
      </div>
    </header>
  );
};

export default NavHeader;
