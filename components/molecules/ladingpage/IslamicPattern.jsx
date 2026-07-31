import { cn } from "@/lib/utils";

export default function IslamicPattern({
  className = "",
  opacity = 0.06,
  color = "#265902",
}) {
  return (
    <div
      className={cn("absolute inset-0 pointer-events-none overflow-hidden", className)}
      aria-hidden="true"
    >
      <svg
        className="w-full h-full animate-[pattern-rotate_120s_linear_infinite]"
        xmlns="http://www.w3.org/2000/svg"
        style={{ opacity }}
      >
        <defs>
          <pattern
            id="islamic-star-pattern"
            x="0"
            y="0"
            width="80"
            height="80"
            patternUnits="userSpaceOnUse"
          >
            {/* 8-pointed star */}
            <polygon
              points="40,4 46,18 62,14 50,26 62,38 46,34 40,48 34,34 18,38 30,26 18,14 34,18"
              fill="none"
              stroke={color}
              strokeWidth="0.8"
            />
            {/* Inner diamond */}
            <polygon
              points="40,16 48,32 40,40 32,32"
              fill="none"
              stroke={color}
              strokeWidth="0.5"
            />
            {/* Outer connecting lines */}
            <line x1="40" y1="0" x2="40" y2="4" stroke={color} strokeWidth="0.3" />
            <line x1="40" y1="48" x2="40" y2="52" stroke={color} strokeWidth="0.3" />
            <line x1="0" y1="26" x2="18" y2="26" stroke={color} strokeWidth="0.3" />
            <line x1="62" y1="26" x2="80" y2="26" stroke={color} strokeWidth="0.3" />
            {/* Corner connectors */}
            <line x1="0" y1="0" x2="18" y2="14" stroke={color} strokeWidth="0.2" />
            <line x1="80" y1="0" x2="62" y2="14" stroke={color} strokeWidth="0.2" />
            <line x1="0" y1="52" x2="18" y2="38" stroke={color} strokeWidth="0.2" />
            <line x1="80" y1="52" x2="62" y2="38" stroke={color} strokeWidth="0.2" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#islamic-star-pattern)" />
      </svg>
    </div>
  );
}

export function ArabesqueDivider({ className = "", color = "#265902" }) {
  return (
    <div className={cn("flex items-center justify-center py-2", className)} aria-hidden="true">
      <svg
        width="320"
        height="24"
        viewBox="0 0 320 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full max-w-xs sm:max-w-sm"
      >
        {/* Left line */}
        <line
          x1="0"
          y1="12"
          x2="120"
          y2="12"
          stroke={color}
          strokeWidth="0.8"
          strokeOpacity="0.4"
        />
        {/* Left dot */}
        <circle cx="130" cy="12" r="1.5" fill={color} fillOpacity="0.5" />
        {/* Center diamond */}
        <polygon
          points="148,4 160,12 148,20 136,12"
          fill="none"
          stroke={color}
          strokeWidth="1"
          strokeOpacity="0.6"
        />
        {/* Center star inside diamond */}
        <polygon
          points="160,6 162,10 166,10 163,13 164,17 160,15 156,17 157,13 154,10 158,10"
          fill={color}
          fillOpacity="0.4"
        />
        {/* Right diamond */}
        <polygon
          points="172,4 184,12 172,20 160,12"
          fill="none"
          stroke={color}
          strokeWidth="1"
          strokeOpacity="0.6"
        />
        {/* Right dot */}
        <circle cx="190" cy="12" r="1.5" fill={color} fillOpacity="0.5" />
        {/* Right line */}
        <line
          x1="200"
          y1="12"
          x2="320"
          y2="12"
          stroke={color}
          strokeWidth="0.8"
          strokeOpacity="0.4"
        />
      </svg>
    </div>
  );
}
