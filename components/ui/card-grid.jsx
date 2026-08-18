import * as React from "react";
import { cn } from "@/lib/utils";

function CardGrid({
  as: Comp = "div",
  className,
  children,
  ...props
}) {
  return (
    <Comp
      data-slot="card-grid"
      className={cn(
        "grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
        className
      )}
      {...props}
    >
      {children}
    </Comp>
  );
}

export { CardGrid };
