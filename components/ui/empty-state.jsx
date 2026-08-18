import * as React from "react";
import { cn } from "@/lib/utils";
import { poppins_400, poppins_600 } from "@/lib/config/font.config";
import { Card, CardContent } from "@/components/ui/card";

function EmptyState({
  icon: Icon,
  title,
  heading,
  description,
  action,
  children,
  className,
  contentClassName,
  iconContainerClassName,
  titleClassName,
  descriptionClassName,
  ...props
}) {
  const displayTitle = title || heading;

  const renderIcon = () => {
    if (!Icon) return null;
    if (React.isValidElement(Icon)) {
      return Icon;
    }
    if (typeof Icon === "function" || typeof Icon === "object") {
      return <Icon className="h-7 w-7 text-accent" />;
    }
    return null;
  };

  const actionContent = action || children;

  return (
    <Card
      data-slot="empty-state"
      className={cn(
        "rounded-2xl border border-accent/10 bg-surface-raised pb-0 shadow-sm",
        className
      )}
      {...props}
    >
      <CardContent
        className={cn(
          "flex flex-col items-center justify-center space-y-4 py-16 text-center",
          contentClassName
        )}
      >
        {Icon && (
          <div
            className={cn(
              "flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-secondary/15 to-highlight/10",
              iconContainerClassName
            )}
          >
            {renderIcon()}
          </div>
        )}
        {(displayTitle || description) && (
          <div>
            {displayTitle && (
              <h3
                className={cn(
                  poppins_600.className,
                  "text-lg text-ink",
                  titleClassName
                )}
              >
                {displayTitle}
              </h3>
            )}
            {description && (
              <p
                className={cn(
                  poppins_400.className,
                  "mt-1 max-w-md text-sm text-ink-muted",
                  descriptionClassName
                )}
              >
                {description}
              </p>
            )}
          </div>
        )}
        {actionContent && (
          <div className="flex flex-wrap items-center justify-center gap-3">
            {actionContent}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export { EmptyState };
