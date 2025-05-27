import React from "react";

const CustomLoader = ({ className = "", size = 40 }) => (
  <div
    className={`w-full flex items-center justify-center py-8 ${className}`}
    style={{ minHeight: size * 2 }}
  >
    <span
      className="inline-block animate-spin rounded-full border-4 border-solid border-accent border-t-transparent"
      style={{
        width: size,
        height: size,
        borderTopColor: "transparent",
      }}
      aria-label="Loading"
    />
  </div>
);

export default CustomLoader;