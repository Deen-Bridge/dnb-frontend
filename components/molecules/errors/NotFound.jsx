"use client";
import { Inter_800, Inter_400 } from "@/lib/config/font.config";
import { cn } from "@/lib/utils";
import Button from "@/components/atoms/form/Button";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import React from "react";

const NotFoundComp = ({
  className,
  isRoute = true,
  errMsg,
}) => {
  const pathname = usePathname();
  const router = useRouter();
  const isDashboard = pathname.includes("/dashboard");

  const handleGoBack = () => {
    if (window.history.length > 2) {
      router.back();
    } else {
      router.push(isDashboard ? "/dashboard" : "/login");
    }
  };

  return (

  <div
    className={cn(
      "w-full flex flex-col items-center justify-center py-16",
      "max-w-xl mx-auto",
      className
    )}
  >
    <Image
      height="222"
      width="443"
      alt="404-image"
      src="/svgs/404_image.svg"
      priority
      className="mb-12 hidden lg:block"
    />
    <Image
      height="300"
      width="300"
      alt="404-image"
      priority
      src="/svgs/404_image.svg"
      className="mb-14 block lg:hidden"
    />
    <p
      className={cn(
        "text-4xl lg:text-4xl text-foreground font-bold mb-6",
        Inter_800.className
      )}
    >
      Oh No! Error 404
    </p>
    <p
      className={cn(
        "text-xl lg:text-2xl text-muted-foreground text-center mb-8",
        Inter_400.className
      )}
    >
      {errMsg ? (
        errMsg
      ) : (
        <>
          Oops! That page seems to have taken a detour.
          <br />
          Let us guide you back to your destination.
        </>
      )}
    </p>
    <Button
      type="button"
      round
      onClick={handleGoBack}
      className="py-3 px-8 text-base lg:text-lg bg-accent text-white font-bold hover:bg-accent/90 transition"
    >
      Go Back
    </Button>
  </div>
);
};

export default NotFoundComp;