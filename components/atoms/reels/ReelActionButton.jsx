"use client";

import { cn } from "@/lib/utils";

const ReelActionButton = ({
  icon,
  label,
  active = false,
  onClick,
  disabled = false,
  className,
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex flex-col items-center gap-1 transition",
        disabled ? "cursor-not-allowed opacity-50" : "hover:scale-105",
        className
      )}
    >
      <span
        className={cn(
          "flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white shadow-md backdrop-blur",
          active && "border-white bg-white/80 text-black"
        )}
      >
        {icon}
      </span>
      {label !== undefined && (
        <span className="text-xs font-medium text-white drop-shadow">
          {label}
        </span>
      )}
    </button>
  );
};

export default ReelActionButton;

