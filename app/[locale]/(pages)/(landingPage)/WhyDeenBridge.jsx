"use client";
import {
  FaBookOpen,
  FaUsers,
  FaMosque,
  FaShieldAlt,
  FaHandsHelping,
} from "react-icons/fa";
import { BsStars } from "react-icons/bs";
import { useTranslations } from "next-intl";
import Button from "@/components/atoms/form/Button";
import { cn } from "@/lib/utils";
import { poppins_600 } from "@/lib/config/font.config";

const features = [
  {
    id: "resources",
    icon: <FaBookOpen className="text-accent w-10 h-10 mb-4" />,
  },
  {
    id: "community",
    icon: <FaUsers className="text-accent w-10 h-10 mb-4" />,
  },
  {
    id: "spaces",
    icon: <FaMosque className="text-accent w-10 h-10 mb-4" />,
  },
  {
    id: "learning",
    icon: <FaHandsHelping className="text-accent w-10 h-10 mb-4" />,
  },
  {
    id: "privacy",
    icon: <FaShieldAlt className="text-accent w-10 h-10 mb-4" />,
  },
  {
    id: "excellence",
    icon: <BsStars className="text-accent w-10 h-10 mb-4" />,
  },
];

export default function WhyDeenBridge() {
  const t = useTranslations("landing.why");
  return (
    <section id="services" className="relative py-20 px-2 sm:px-6 bg-basic overflow-hidden">
      {/* Decorative Islamic motif background */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute start-0 top-0 w-1/2 h-1/2 bg-gradient-to-br from-accent/10 to-transparent rounded-full blur-3xl" />
        <div className="absolute end-0 bottom-0 w-1/3 h-1/3 bg-gradient-to-tr from-highlight/10 to-transparent rounded-full blur-2xl" />
      </div>
      <div className="relative z-10 max-w-6xl mx-auto">
        <h2
          className={cn(
            poppins_600,
            "text-4xl sm:text-8xl font-bold text-center pb-12 bg-gradient-to-r from-secondary via-highlight to-secondary text-transparent bg-clip-text font-stretch-125%"
          )}
        >
          {t("heading")}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((f) => (
            <div
              key={f.id}
              className="rounded-3xl bg-surface-raised backdrop-blur-xl shadow-xl hover:shadow-2xl transition-all p-8 flex flex-col items-center text-center border-0 border-accent/10 hover:scale-[1.03]"
            >
              {f.icon}
              <h3 className="text-xl font-bold mb-2 text-accent font-stretch-125%">
                {t(`features.${f.id}.title`)}
              </h3>
              <p className="text-ink-muted text-base mb-2 font-stretch-110%">
                {t(`features.${f.id}.desc`)}
              </p>
            </div>
          ))}
        </div>
        <div className="flex justify-center mt-14">
          <Button
            wide
            round
            to="/signup"
            className="bg-accent hover:bg-highlight text-white px-10 py-3 text-lg font-bold animate-in-out transition-all"
          >
            {t("cta")}
          </Button>
        </div>
      </div>
    </section>
  );
}
