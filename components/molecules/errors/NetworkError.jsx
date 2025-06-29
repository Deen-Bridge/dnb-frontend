"use client";
import {
  Space_Grotesk_400,
  roboto_400,
  roboto_900,
} from "@/lib/config/font.config";
import {cn} from "@/lib/utils";
import Button from "@/components/atoms/form/Button";
import Image from "next/image";
import { usePathname } from "next/navigation";
import React from "react";

const NetworkErrorComp = ({
  className,
  errMsg,
  reset,
}) => {
  return (
    <div
      className={cn(
        "h-[85dvh] flex flex-col items-center justify-center",
        className
      )}
    >
      <Image
        height="222"
        width="443"
        alt="404-image"
        src="/svgs/connectivity.svg"
        priority
        className="mb-12 hidden lg:block"
      />
      <Image
        height="300"
        width="300"
        alt="404-image"
        priority
        src="/svgs/connectivity.svg"
        className="mb-14 block lg:hidden"
      />
      <p
        className={cn(
          "text-4xl lg:text-4xl text-[#252F40] text-bold mb-5 tes-center",
          roboto_900.className
        )}
      >
        {errMsg ? "Oops!, something went awry 😥!." : "No network connection"}
      </p>
      <p
        className={cn(
          "text-xl lg:text-2xl text-[#838DA0] text-bold text-center mb-7",
          roboto_400.className
        )}
      >
        {errMsg ? errMsg : "Please check your network and try again"}
      </p>
      <Button
        round
        func={reset}
        className={cn(
          `text-base lg:text-lg bg-accent hover:bg-highlight text-white`,
          Space_Grotesk_400.className
        )}
   
      >
        Retry
      </Button>
    </div>
  );
};

export default NetworkErrorComp;
