"use client";

import { FaBookOpen, FaHandsHelping, FaMosque, FaShieldAlt, FaUsers } from "react-icons/fa";
import { BsStars } from "react-icons/bs";
import { useTranslations } from "next-intl";
import Button from "@/components/atoms/form/Button";
import { cn } from "@/lib/utils";
import { poppins_600 } from "@/lib/config/font.config";

const featureDefinitions = [
  { icon: FaBookOpen, title: "trustedTitle", description: "trustedDescription" },
  { icon: FaUsers, title: "communityTitle", description: "communityDescription" },
  { icon: FaMosque, title: "spacesTitle", description: "spacesDescription" },
  { icon: FaHandsHelping, title: "learningTitle", description: "learningDescription" },
  { icon: FaShieldAlt, title: "privacyTitle", description: "privacyDescription" },
  { icon: BsStars, title: "excellenceTitle", description: "excellenceDescription" },
];

export default function WhyDeenBridge() {
  const t = useTranslations("landing.features");

  return (
    <section id="services" className="relative overflow-hidden bg-basic px-2 py-20 sm:px-6">
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute start-0 top-0 h-1/2 w-1/2 rounded-full bg-gradient-to-br from-accent/10 to-transparent blur-3xl" />
        <div className="absolute bottom-0 end-0 h-1/3 w-1/3 rounded-full bg-gradient-to-tr from-highlight/10 to-transparent blur-2xl" />
      </div>
      <div className="relative z-10 mx-auto max-w-6xl">
        <h2 className={cn(poppins_600, "pb-12 text-center text-4xl font-bold text-transparent bg-gradient-to-r from-accent via-green-500 to-highlight bg-clip-text sm:text-8xl")}>
          {t("title")}
        </h2>
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {featureDefinitions.map(({ icon: Icon, title, description }) => (
            <div key={title} className="flex flex-col items-center rounded-3xl border-0 border-accent/10 bg-white/80 p-8 text-center shadow-xl backdrop-blur-xl transition-all hover:scale-[1.03] hover:shadow-2xl">
              <Icon className="mb-4 h-10 w-10 text-accent" />
              <h3 className="mb-2 text-xl font-bold text-accent">{t(title)}</h3>
              <p className="mb-2 text-base text-gray-700">{t(description)}</p>
            </div>
          ))}
        </div>
        <div className="mt-14 flex justify-center">
          <Button wide round to="/signup" className="bg-accent px-10 py-3 text-lg font-bold text-white transition-all hover:bg-highlight">
            {t("join")}
          </Button>
        </div>
      </div>
    </section>
  );
}
