import Image from "next/image";
import React from "react";
export default function Page() {
  return (
    <div className="flex-1 bg-highlight/20 rounded-xl w-full h-full p-4 flex flex-col justify-center items-center">
      <div className=" w-full flex justify-center items-center h-full relative">
        <Image
          alt="shadow"
          src="/svgs/choose-chat.svg"
          height={293}
          width={263}
          className="no-select"
          priority
        />
        <p className="text-center text-sm  mt-20 absolute">
          Send and receive message from different people across the
          globe
        </p>
      </div>
    </div>
  );
}