"use client";
import { FaUserPlus, FaSearch, FaUsers, FaGraduationCap, FaHeart, FaStar } from "react-icons/fa";
import { cn } from '@/lib/utils';
import { poppins_600 } from '@/lib/config/font.config';
import Button from '@/components/atoms/form/Button';

const steps = [
  {
    id: 1,
    icon: <FaUserPlus className="text-white w-6 h-6" />,
    title: "Join Community",
    desc: "Create your account and become part of our growing Ummah",
    position: "top-0 left-1/2 -translate-x-1/2 -translate-y-4",
    color: "from-blue-500 to-cyan-500",
  },
  {
    id: 2,
    icon: <FaSearch className="text-white w-6 h-6" />,
    title: "Discover Resources",
    desc: "Explore curated courses, books, and learning materials",
    position: "top-1/4 right-4 translate-x-0",
    color: "from-emerald-500 to-teal-500",
  },
  {
    id: 3,
    icon: <FaUsers className="text-white w-6 h-6" />,
    title: "Connect & Learn",
    desc: "Join live sessions and connect with fellow Muslims",
    position: "bottom-1/4 right-4 translate-x-0",
    color: "from-purple-500 to-pink-500",
  },
  {
    id: 4,
    icon: <FaGraduationCap className="text-white w-6 h-6" />,
    title: "Grow Together",
    desc: "Share knowledge and grow in your spiritual journey",
    position: "bottom-0 left-1/2 -translate-x-1/2 translate-y-4",
    color: "from-orange-500 to-red-500",
  },
  {
    id: 5,
    icon: <FaUsers className="text-white w-6 h-6" />,
    title: "Share Knowledge",
    desc: "Contribute your wisdom and inspire others in the community",
    position: "bottom-1/4 left-4 -translate-x-0",
    color: "from-indigo-500 to-blue-500",
  },
  {
    id: 6,
    icon: <FaGraduationCap className="text-white w-6 h-6" />,
    title: "Achieve Excellence",
    desc: "Reach spiritual heights and become a beacon of knowledge",
    position: "top-1/4 left-4 -translate-x-0",
    color: "from-green-500 to-emerald-500",
  },
];

export default function HowItWorks() {
  return (
    <section className="relative py-24 px-4 sm:px-6 bg-gradient-to-br from-green-50 via-white to-green-100/80 overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute left-0 top-0 w-1/2 h-1/2 bg-gradient-to-br from-accent/10 to-transparent rounded-full blur-3xl animate-pulse" />
        <div className="absolute right-0 bottom-0 w-1/3 h-1/3 bg-gradient-to-tr from-highlight/10 to-transparent rounded-full blur-2xl animate-pulse" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-accent/5 to-highlight/5 rounded-full blur-3xl animate-pulse" />
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-20">
          <h2 className={cn(
            poppins_600,
            "text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-accent via-green-500 to-highlight text-transparent bg-clip-text font-stretch-125% animate-pulse"
          )}>
            How It Works
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto font-stretch-110%">
            Experience the seamless path to spiritual growth and community connection
          </p>
        </div>

        {/* Mobile Layout */}
        <div className="md:hidden mb-16">
          <div className="space-y-6">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className="bg-white/95 backdrop-blur-xl rounded-3xl p-6 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-105 border border-white/20 group"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-14 h-14 rounded-2xl bg-gradient-to-r flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform",
                    step.color
                  )}>
                    {step.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-accent font-stretch-125%">
                        {step.title}
                      </h3>
                      <div className="w-7 h-7 rounded-full bg-gradient-to-r from-accent to-highlight flex items-center justify-center">
                        <span className="text-white font-bold text-xs">{step.id}</span>
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm font-stretch-110%">
                      {step.desc}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Section */}
        <div className="text-center">
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-white/20 max-w-4xl mx-auto">
            <div className="flex items-center justify-center gap-4 mb-6">
              <FaHeart className="text-accent w-8 h-8 animate-pulse" />
              <FaStar className="text-highlight w-8 h-8 animate-pulse" />
              <FaHeart className="text-accent w-8 h-8 animate-pulse" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-4 font-stretch-125%">
              Ready to Begin Your Journey?
            </h3>
            <p className="text-gray-600 mb-8 font-stretch-110%">
              Join thousands of Muslims who are already growing and learning together
            </p>
            <Button
              wide
              round
              className="bg-gradient-to-r from-accent to-highlight hover:from-highlight hover:to-accent text-white px-12 py-4 text-lg font-bold animate-in-out transition-all shadow-lg"
            >
              Get Started Now
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
