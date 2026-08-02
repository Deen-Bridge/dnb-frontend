"use client";
import { FaHeart, FaStar } from "react-icons/fa";
import { cn } from "@/lib/utils";
import { poppins_400, poppins_500, poppins_600 } from "@/lib/config/font.config";
import Button from "@/components/atoms/form/Button";

import { studentSteps, tutorSteps } from "@/lib/data";

const StepCard = ({ step }) => (
  <div className="group relative h-full rounded-2xl border border-accent/10 bg-surface-raised p-5 shadow-lg backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
    <div className="mb-4 flex items-center gap-3">
      <div
        className={cn(
          "flex size-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-r shadow-md transition-transform group-hover:scale-110",
          step.color
        )}
      >
        {step.icon}
      </div>
      <span
        className={cn(
          poppins_600,
          "flex size-6 shrink-0 items-center justify-center rounded-full bg-accent/10 text-xs text-accent"
        )}
      >
        {step.id}
      </span>
    </div>
    <h4
      className={cn(
        poppins_600,
        "mb-1.5 text-base text-accent font-stretch-110%"
      )}
    >
      {step.title}
    </h4>
    <p className={cn(poppins_400, "text-sm text-ink-muted font-stretch-110%")}>
      {step.desc}
    </p>
  </div>
);

const TrackCopy = ({ eyebrow, title, body, cta, href }) => (
  <div>
    <span
      className={cn(
        poppins_500,
        "mb-4 inline-flex items-center rounded-full border border-accent/20 bg-secondary/10 px-4 py-1.5 text-sm text-accent"
      )}
    >
      {eyebrow}
    </span>
    <h3
      className={cn(
        poppins_600,
        "mb-4 text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-secondary via-highlight to-accent bg-clip-text text-transparent font-stretch-125%"
      )}
    >
      {title}
    </h3>
    <p
      className={cn(
        poppins_400,
        "mb-8 text-lg leading-relaxed text-ink-muted font-stretch-110%"
      )}
    >
      {body}
    </p>
    <Button
      wide
      round
      to={href}
      className="bg-gradient-to-r from-accent to-highlight hover:from-highlight hover:to-accent text-white px-10 py-3.5 text-base font-bold animate-in-out transition-all shadow-lg"
    >
      {cta}
    </Button>
  </div>
);

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="relative py-24 px-4 sm:px-6 bg-surface overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute -left-24 top-0 h-[420px] w-[420px] rounded-full bg-secondary/10 blur-3xl" />
        <div className="absolute -right-24 bottom-0 h-[420px] w-[420px] rounded-full bg-accent/10 blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-20">
          <h2
            className={cn(
              poppins_600,
              "text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-secondary via-highlight to-accent text-transparent bg-clip-text font-stretch-125%"
            )}
          >
            How It Works
          </h2>
          <p
            className={cn(
              poppins_400,
              "text-xl text-ink-muted max-w-3xl mx-auto font-stretch-110%"
            )}
          >
            Two paths, one Ummah — whether you came here to learn or to teach
          </p>
        </div>

        {/* Students — copy on the left, steps on the right */}
        <div className="mb-24 grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <TrackCopy
            eyebrow="For Students"
            title="Start learning in four steps"
            body="Create an account, find what speaks to you, and study alongside
              teachers and classmates from across the Ummah. Everything is
              curated by verified scholars, so you can learn with confidence
              from day one."
            cta="Create a free account"
            href="/signup"
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {studentSteps.map((step) => (
              <StepCard key={step.id} step={step} />
            ))}
          </div>
        </div>

        {/* Educators — reversed: steps first, then copy */}
        <div className="mb-16 grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {tutorSteps.map((step) => (
              <StepCard key={step.id} step={step} />
            ))}
          </div>
          <TrackCopy
            eyebrow="For Educators"
            title="Teach, and get paid for it"
            body="Share what you know with learners who are looking for exactly
              your expertise. Publish courses and books, host live spaces, and
              receive your earnings in USDC over Stellar — settled in seconds,
              straight to your own wallet."
            cta="Apply to teach"
            href="/signup"
          />
        </div>

        {/* Bottom Section */}
        <div className="text-center">
          <div className="bg-surface-raised backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-accent/10 max-w-4xl mx-auto">
            <div className="flex items-center justify-center gap-4 mb-6">
              <FaHeart className="text-accent w-8 h-8 animate-pulse" />
              <FaStar className="text-highlight w-8 h-8 animate-pulse" />
              <FaHeart className="text-accent w-8 h-8 animate-pulse" />
            </div>
            <h3 className="text-2xl font-bold text-ink mb-4 font-stretch-125%">
              Ready to Begin Your Journey?
            </h3>
            <p className="text-ink-muted mb-8 font-stretch-110%">
              Join thousands of Muslims who are already growing and learning
              together
            </p>
            <Button
              wide
              round
              to="/signup"
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
