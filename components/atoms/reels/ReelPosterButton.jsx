"use client";
/**
 * ReelPosterButton - opens `ReelPosterDialog` for a reel (#265).
 *
 * Purely presentational trigger, styled like the other reel action rail
 * buttons. Visibility (admin-only) is decided by the caller (`ReelCard`), not
 * here, so this stays a dumb button - consistent with `ReelModerationButton`.
 *
 * @param {Object} props
 * @param {() => void} props.onClick
 * @param {string} [props.className]
 */
import { ImageIcon } from "lucide-react";
import ReelActionButton from "@/components/atoms/reels/ReelActionButton";

const ReelPosterButton = ({ onClick, className }) => {
  return (
    <ReelActionButton
      icon={<ImageIcon size={20} aria-hidden="true" />}
      accessibleLabel="Manage this reel's poster"
      onClick={onClick}
      className={className}
    />
  );
};

export default ReelPosterButton;
