"use client";
import { Inter_800, Inter_400 } from "@/lib/config/font.config";
import { cn } from "@/lib/utils";
import Button from "@/components/atoms/form/Button";
import Image from "next/image";
import React from "react";

const NetworkErrorComp = ({ className, errMsg, reset, onRetry }) => {
  const handleRetry = React.useCallback(() => {
    if (typeof onRetry === "function") {
      onRetry();
    } else if (typeof reset === "function") {
      reset();
    }
  }, [onRetry, reset]);

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
        alt=""
        src="/svgs/connectivity.svg"
        priority
        className="mb-12 hidden lg:block"
      />
      <Image
        height="300"
        width="300"
        alt=""
        priority
        src="/svgs/connectivity.svg"
        className="mb-14 block lg:hidden"
      />
      <p
        className={cn(
          "text-4xl lg:text-4xl text-foreground font-bold mb-5 text-center",
          Inter_800.className
        )}
      >
        {errMsg ? "Oops!, something went awry!" : "No network connection"}
      </p>
      <p
        className={cn(
          "text-xl lg:text-2xl text-muted-foreground text-center mb-7",
          Inter_400.className
        )}
      >
        {errMsg ? errMsg : "Please check your network and try again"}
      </p>
      <Button
        round
        onClick={handleRetry}
        className="text-base lg:text-lg bg-accent hover:bg-highlight text-white"
      >
        Retry
      </Button>
    </div>
  );
};

export default NetworkErrorComp;
