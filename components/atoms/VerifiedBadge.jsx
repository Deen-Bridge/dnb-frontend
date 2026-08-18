/**
 * VerifiedBadge — trust badge for verified educators.
 * ---------------------------------------------------
 * Renders ONLY when the subject is a verified educator; otherwise renders
 * nothing. Built on the shared `Badge` primitive.
 *
 * Pass either a `user`/subject object (verification is read from it via the
 * shared `isVerified` rule) or an explicit `verified` boolean when the caller
 * already knows the status.
 *
 *   <VerifiedBadge user={course.createdBy} />
 *   <VerifiedBadge verified={isVerified} />
 */
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { BadgeCheck } from "lucide-react";
import { isVerified as isVerifiedRule } from "@/lib/auth/roles";

export function VerifiedBadge({ user, verified, className, showLabel = true }) {
  const show = verified === true || (verified === undefined && isVerifiedRule(user));
  if (!show) return null;

  return (
    <Badge
      variant="secondary"
      className={cn(
        "gap-1 border-transparent bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
        className
      )}
      title="Verified educator"
    >
      <BadgeCheck className="size-3" aria-hidden="true" />
      {showLabel && <span>Verified</span>}
    </Badge>
  );
}

export default VerifiedBadge;
