"use client";
/**
 * VerificationRequired — shown to an educator who has the right role for a
 * content-creation flow but has NOT completed verification yet. Unlike the
 * Unauthorized screen (wrong role), this is a recoverable state: it explains
 * what's needed and links straight to the verification flow.
 */
import { Inter_800, Inter_400 } from "@/lib/config/font.config";
import { cn } from "@/lib/utils";
import Button from "@/components/atoms/form/Button";
import { BadgeCheck } from "lucide-react";
import React from "react";

const VerificationRequired = ({ className, message }) => {
  return (
    <div
      role="alert"
      className={cn(
        "w-full flex flex-col items-center justify-center py-16",
        "max-w-xl mx-auto text-center",
        className
      )}
    >
      <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/40">
        <BadgeCheck
          className="h-12 w-12 text-amber-600 dark:text-amber-400"
          aria-hidden="true"
        />
      </div>
      <h1
        className={cn(
          "text-3xl lg:text-4xl text-foreground font-bold mb-4",
          Inter_800.className
        )}
      >
        Verification required
      </h1>
      <p
        className={cn(
          "text-lg lg:text-xl text-muted-foreground mb-8",
          Inter_400.className
        )}
      >
        {message ||
          "Only verified educators can create content. Complete your verification to unlock course, book, and space creation."}
      </p>
      <Button
        type="button"
        round
        to="/account/verification"
        className="py-3 px-8 text-base lg:text-lg bg-accent text-white font-bold hover:bg-accent/90 transition"
      >
        Complete verification
      </Button>
    </div>
  );
};

export default VerificationRequired;
