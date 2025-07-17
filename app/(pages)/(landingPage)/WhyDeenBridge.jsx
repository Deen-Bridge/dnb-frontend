"use client";
import {
  FaBookOpen,
  FaUsers,
  FaMosque,
  FaShieldAlt,
  FaHandsHelping,
} from "react-icons/fa";
import { BsStars } from "react-icons/bs";
import Button from "@/components/atoms/form/Button";
import { cn } from "@/lib/utils";
import { poppins_600 } from "@/lib/config/font.config";

const features = [
  {
    icon: <FaBookOpen className="text-accent w-10 h-10 mb-4" />,
    title: "Trusted Islamic Resources",
    desc: "Access authentic knowledge, curated by scholars and trusted sources, to strengthen your Deen with confidence.",
  },
  {
    icon: <FaUsers className="text-accent w-10 h-10 mb-4" />,
    title: "Supportive Community",
    desc: "Connect with Muslims worldwide, share experiences, and grow together in a safe, welcoming environment.",
  },
  {
    icon: <FaMosque className="text-accent w-10 h-10 mb-4" />,
    title: "Spaces & Events",
    desc: "Join live sessions, discussions, and events designed to inspire, educate, and unite the Ummah.",
  },
  {
    icon: <FaHandsHelping className="text-accent w-10 h-10 mb-4" />,
    title: "Personalized Learning",
    desc: "Discover books, courses, and resources tailored to your interests and spiritual journey.",
  },
  {
    icon: <FaShieldAlt className="text-accent w-10 h-10 mb-4" />,
    title: "Privacy & Security",
    desc: "Your data and conversations are protected with industry-leading security and privacy standards.",
  },
  {
    icon: <BsStars className="text-accent w-10 h-10 mb-4" />,
    title: "Excellence in Every Step",
    desc: "Experience a platform built for beauty, ease, and spiritual excellence—where Deen meets modern design.",
  },
];

export default function WhyDeenBridge() {
  return (
    <section className="relative py-20 px-2 sm:px-6 bg-gradient-to-br from-green-50 via-white to-green-100/80 overflow-hidden">
      {/* Decorative Islamic motif background */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute left-0 top-0 w-1/2 h-1/2 bg-gradient-to-br from-accent/10 to-transparent rounded-full blur-3xl" />
        <div className="absolute right-0 bottom-0 w-1/3 h-1/3 bg-gradient-to-tr from-highlight/10 to-transparent rounded-full blur-2xl" />
      </div>
      <div className="relative z-10 max-w-6xl mx-auto">
        <h2
          className={cn(
            poppins_600,
            "text-4xl sm:text-5xl font-bold text-center mb-12 bg-gradient-to-r from-accent via-green-500 to-highlight text-transparent bg-clip-text font-stretch-125%"
          )}
        >
          Why Deen Bridge?
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((f, i) => (
            <div
              key={f.title}
              className="rounded-3xl bg-white/80 backdrop-blur-xl shadow-xl hover:shadow-2xl transition-all p-8 flex flex-col items-center text-center border-0 border-accent/10 hover:scale-[1.03]"
            >
              {f.icon}
              <h3 className="text-xl font-bold mb-2 text-accent font-stretch-125%">
                {f.title}
              </h3>
              <p className="text-gray-700 text-base mb-2 font-stretch-110%">
                {f.desc}
              </p>
            </div>
          ))}
        </div>
        <div className="flex justify-center mt-14">
          <Button
            wide
            round
            className="bg-accent hover:bg-highlight text-white px-10 py-3 text-lg font-bold animate-in-out transition-all"
          >
            Join the Community
          </Button>
        </div>
      </div>
    </section>
  );
}
