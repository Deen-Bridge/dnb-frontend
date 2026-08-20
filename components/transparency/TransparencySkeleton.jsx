import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { poppins_400 } from "@/lib/config/font.config";

/**
 * Server-shell fallback shown while the transparency feed is being fetched
 * on the server, so the page streams its layout immediately.
 */
export default function TransparencySkeleton() {
  return (
    <section className="bg-surface px-4 py-12 sm:px-6 sm:py-16">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="rounded-2xl border border-accent/10 bg-surface-raised p-6"
            >
              <Skeleton className="h-4 w-24" />
              <Skeleton className="mt-3 h-9 w-32" />
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-accent/10 bg-surface-raised p-6">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="mt-4 h-56 w-full rounded-xl" />
        </div>

        <div className="rounded-2xl border border-accent/10 bg-surface-raised p-6">
          <div className="mb-4 flex items-center justify-between">
            <Skeleton className="h-5 w-36" />
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
          <div className="space-y-2">
            {[0, 1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-16 w-full rounded-xl" />
            ))}
          </div>
        </div>

        <p
          className={cn(
            poppins_400,
            "text-center text-sm text-ink-muted"
          )}
        >
          Loading live donations from Stellar Horizon…
        </p>
      </div>
    </section>
  );
}
