"use client";
/**
 * Unauthorized — graceful 403 screen.
 * -----------------------------------
 * Shown when an authenticated user reaches a surface their role can't access
 * (e.g. a student navigating directly to a create route). Never a blank page
 * or a broken render — a clear message and a way back. This is a UX affordance
 * layered on top of server-side authorization, not the enforcement point.
 */
import { Inter_800, Inter_400 } from "@/lib/config/font.config";
import { cn } from "@/lib/utils";
import Button from "@/components/atoms/form/Button";
import { useRouter } from "next/navigation";
import { ShieldAlert } from "lucide-react";
import React from "react";

const Unauthorized = ({ className, message }) => {
  const router = useRouter();

  const handleGoBack = () => {
    if (typeof window !== "undefined" && window.history.length > 2) {
      router.back();
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <div
      role="alert"
      className={cn(
        "w-full flex flex-col items-center justify-center py-16",
        "max-w-xl mx-auto text-center",
        className
      )}
    >
      <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-destructive/10">
        <ShieldAlert className="h-12 w-12 text-destructive" aria-hidden="true" />
      </div>
      <h1
        className={cn(
          "text-3xl lg:text-4xl text-foreground font-bold mb-4",
          Inter_800.className
        )}
      >
        Access restricted
      </h1>
      <p
        className={cn(
          "text-lg lg:text-xl text-muted-foreground mb-8",
          Inter_400.className
        )}
      >
        {message ||
          "You don't have permission to view this page. If you think this is a mistake, contact a maintainer."}
      </p>
      <Button
        type="button"
        round
        onClick={handleGoBack}
        className="py-3 px-8 text-base lg:text-lg bg-accent text-white font-bold hover:bg-accent/90 transition"
      >
        Back to dashboard
      </Button>
    </div>
  );
};

export default Unauthorized;
