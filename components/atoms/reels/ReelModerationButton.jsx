"use client";
/**
 * ReelModerationButton — hide/unhide toggle for a reel, wired to the shared
 * optimistic-mutation helper (#335).
 *
 * Proves the integration: all the optimistic-update, rollback, toast, and
 * same-entity queue-safety logic lives in `useReelModeration` →
 * `useOptimisticMutation`; this component is purely presentational and holds no
 * bespoke revert/toast code.
 *
 * @param {Object} props
 * @param {string} props.reelId
 * @param {boolean} [props.hidden=false] Current server-known hidden state.
 * @param {string} [props.className]
 */
import { Eye, EyeOff } from "lucide-react";
import ReelActionButton from "@/components/atoms/reels/ReelActionButton";
import useReelModeration from "@/hooks/useReelModeration";

const ReelModerationButton = ({ reelId, hidden = false, className }) => {
  const { hidden: isHidden, toggle, isPending } = useReelModeration(reelId, hidden);

  return (
    <ReelActionButton
      icon={isHidden ? <EyeOff size={20} aria-hidden="true" /> : <Eye size={20} aria-hidden="true" />}
      label={isHidden ? "Hidden" : "Visible"}
      active={isHidden}
      pressed={isHidden}
      accessibleLabel={isHidden ? "Unhide this reel" : "Hide this reel"}
      disabled={isPending}
      onClick={toggle}
      className={className}
    />
  );
};

export default ReelModerationButton;
