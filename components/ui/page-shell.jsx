import * as React from "react";
import { cn } from "@/lib/utils";

function PageShell({
  as: Comp = "div",
  className,
  children,
  ...props
}) {
  return (
    <Comp
      data-slot="page-shell"
      className={cn("p-4 sm:p-6 space-y-6", className)}
      {...props}
    >
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      {children}
    </Comp>
  );
}

export { PageShell };
