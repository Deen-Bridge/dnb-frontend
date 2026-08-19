import { GalleryVerticalEnd } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export const metadata = {
  title: "Educator Verification — Deen Bridge",
  description:
    "Complete identity verification to submit your educator application.",
};

/**
 * Shared layout for the educator onboarding flow.
 * Mirrors the profile-setup two-column layout for visual consistency.
 */
export default function EducatorOnboardingLayout({ children }) {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      {/* Left column — content */}
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <Link href="/" className="flex items-center gap-2 font-medium">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <GalleryVerticalEnd className="size-4" />
            </div>
            Deen Bridge
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs sm:max-w-lg">{children}</div>
        </div>
      </div>

      {/* Right column — decorative image (hidden on mobile) */}
      <div className="relative hidden bg-muted lg:block">
        <Image
          src="/images/profile-setup-img.jpeg"
          alt=""
          aria-hidden="true"
          fill
          className="object-cover dark:brightness-[0.2] dark:grayscale"
          priority
        />
      </div>
    </div>
  );
}
