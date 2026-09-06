"use client";

import * as React from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { Button as UiButton, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const Button = React.forwardRef(function Button(
  {
    children,
    className,
    variant,
    size,
    to,
    download,
    wide,
    outlined,
    loading,
    round,
    disabled,
    loaderSize = 16,
    loaderColor,
    childrenClassName,
    asChild = false,
    ...props
  },
  ref
) {
  const resolvedVariant =
    variant || (outlined ? "outline" : undefined);

  const resolvedClassName = cn(
    wide && "w-full sm:w-auto",
    round && "rounded-full",
    className
  );

  const content = (
    <>
      {loading && (
        <Loader2
          className="animate-spin shrink-0 mr-1"
          size={loaderSize}
          color={loaderColor}
        />
      )}
      {childrenClassName ? (
        <span className={childrenClassName}>{children}</span>
      ) : (
        children
      )}
    </>
  );

  if (to) {
    if (disabled) {
      return (
        <UiButton
          ref={ref}
          variant={resolvedVariant}
          size={size}
          disabled
          className={resolvedClassName}
          {...props}
        >
          {content}
        </UiButton>
      );
    }
    return (
      <UiButton
        ref={ref}
        asChild
        variant={resolvedVariant}
        size={size}
        className={resolvedClassName}
        {...props}
      >
        <Link href={to} download={download}>
          {content}
        </Link>
      </UiButton>
    );
  }

  return (
    <UiButton
      ref={ref}
      asChild={asChild}
      variant={resolvedVariant}
      size={size}
      disabled={disabled || loading}
      className={resolvedClassName}
      {...props}
    >
      {content}
    </UiButton>
  );
});

Button.displayName = "Button";

export default Button;
export { Button, buttonVariants };
