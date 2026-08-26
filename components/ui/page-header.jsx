import * as React from "react";
import { cn } from "@/lib/utils";
import { poppins_400, poppins_600 } from "@/lib/config/font.config";

function PageHeader({
  icon: Icon,
  title,
  subtitle,
  actions,
  children,
  className,
  titleClassName,
  subtitleClassName,
  ...props
}) {
  const renderIcon = () => {
    if (!Icon) return null;
    if (React.isValidElement(Icon)) {
      return Icon;
    }
    if (typeof Icon === "function" || typeof Icon === "object") {
      return <Icon className="h-5 w-5 text-accent" />;
    }
    return null;
  };

  const actionContent = actions || children;

  return (
    <div
      data-slot="page-header"
      className={cn(
        "flex flex-col sm:flex-row sm:flex-wrap sm:items-center sm:justify-between gap-3 sm:gap-4",
        className
      )}
      {...props}
    >
      <div className="flex items-center gap-3 min-w-0">
        {Icon && (
          <div className="flex size-9 sm:size-11 shrink-0 items-center justify-center rounded-2xl border border-accent/5 bg-gradient-to-br from-secondary/20 to-highlight/10">
            {renderIcon()}
          </div>
        )}
        <div className="min-w-0">
          {title && (
            <h1
              className={cn(
                poppins_600.className,
                "bg-gradient-to-r from-secondary via-highlight to-accent bg-clip-text text-xl sm:text-2xl text-transparent",
                titleClassName
              )}
            >
              {title}
            </h1>
          )}
          {subtitle && (
            <p
              className={cn(
                poppins_400.className,
                "mt-0.5 sm:mt-1 text-xs sm:text-sm text-ink-muted truncate",
                subtitleClassName
              )}
            >
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {actionContent && (
        <div className="flex items-center gap-2 flex-wrap">{actionContent}</div>
      )}
    </div>
  );
}

export { PageHeader };
