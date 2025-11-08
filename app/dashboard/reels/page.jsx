"use client";

import dynamic from "next/dynamic";

const ReelFeed = dynamic(
  () => import("@/components/organisms/reels/ReelFeed"),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 text-muted-foreground">
        <div className="h-16 w-16 animate-spin rounded-full border-b-2 border-accent" />
        <p className="text-sm">Loading reels feed…</p>
      </div>
    ),
  }
);

export default function ReelsPage() {
  return <ReelFeed />;
}
