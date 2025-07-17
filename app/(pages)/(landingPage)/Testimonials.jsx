"use client";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { poppins_600 } from "@/lib/config/font.config";

const testimonials = [
  {
    name: "Fatimah Yusuf",
    role: "Student, Nigeria",
    avatar: "/images/img-9.jpeg",
    quote:
      "Deen Bridge has helped me connect with sisters around the world and deepen my understanding of Islam. The community is so welcoming!",
  },
  {
    name: "Ustadh Ahmad",
    role: "Scholar, Egypt",
    avatar: "/images/img-10.jpg",
    quote:
      "I love how Deen Bridge makes authentic knowledge accessible to everyone. The platform is beautifully designed and easy to use.",
  },
  {
    name: "Zayd Khan",
    role: "Entrepreneur, UK",
    avatar: "/images/img-11.jpg",
    quote:
      "The spaces and events feature is a game changer. I've met so many inspiring Muslims and learned so much!",
  },
  {
    name: "Maryam Abubakar",
    role: "Book Lover, Malaysia",
    avatar: "/images/img-12.jpg",
    quote:
      "The book recommendations are spot on. I've discovered gems I never would have found elsewhere!",
  },
  {
    name: "Imam Suleiman",
    role: "Imam, USA",
    avatar: "/images/img-13.jpg",
    quote:
      "Deen Bridge is a blessing for our Ummah. It's secure, supportive, and truly brings people together for good.",
  },
  {
    name: "Aisha Bello",
    role: "Mother, South Africa",
    avatar: "/images/img-14.jpg",
    quote:
      "My children and I use Deen Bridge to learn and grow together. The resources are trustworthy and engaging!",
  },
];

export default function Testimonials() {
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
          What Our Community Says
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((t, i) => (
            <div
              key={t.name}
              className="rounded-3xl bg-white/80 backdrop-blur-xl shadow-xl hover:shadow-2xl transition-all p-8 flex flex-col border-0 border-accent/10"
            >
              {/* Quote */}
              <blockquote className="italic text-lg text-gray-700 mb-4 font-stretch-110% flex-1">
                "{t.quote}"
              </blockquote>
              {/* Avatar and name at bottom */}
              <div className="flex items-center gap-4">
                <div>
                  <span className="block font-bold text-accent text-lg">
                    {t.name}
                  </span>
                  <span className="block text-sm text-muted-foreground">
                    {t.role}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
